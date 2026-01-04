from pymongo import MongoClient
import os

# Connection String
MONGO_URI = 'mongodb+srv://kunalkhaire177_db_user:Sj2LigG8XfQvbcF2@cluster0.7keyczh.mongodb.net/the_system?retryWrites=true&w=majority&appName=Cluster0'

try:
    client = MongoClient(MONGO_URI)
    db = client['the_system']
    print("✅ Connected to MongoDB")

    # --- SKILLS ---
    skills_data = [
        # Active Skills (No stat bonuses usually, but maybe impact combat calculations)
        {"skill_id": "power_strike", "name": "Power Strike", "type": "active", "description": "Deal 200% damage in one hit", "max_level": 10, "base_effect": "Damage x2", "unlock_cost": 2, "icon": "sword", "stat_bonus": {}},
        {"skill_id": "stealth", "name": "Stealth", "type": "active", "description": "Become invisible to enemies", "max_level": 5, "base_effect": "Invisibility 10s", "unlock_cost": 3, "icon": "eye-off", "stat_bonus": {}},
        {"skill_id": "sprint", "name": "Sprint", "type": "active", "description": "Increase movement speed massively", "max_level": 5, "base_effect": "Speed +50%", "unlock_cost": 2, "icon": "run", "stat_bonus": {"agility": 5}}, # Active but gives flat agility? Let's say yes for simplicity
        {"skill_id": "mana_shield", "name": "Mana Shield", "type": "active", "description": "Absorb damage using Mana", "max_level": 10, "base_effect": "Absorb 30%", "unlock_cost": 4, "icon": "shield-check", "stat_bonus": {"intelligence": 3}},
        {"skill_id": "double_jump", "name": "Double Jump", "type": "active", "description": "Jump a second time in mid-air", "max_level": 1, "base_effect": "Jump +1", "unlock_cost": 5, "icon": "arrow-up", "stat_bonus": {"agility": 5}},
        {"skill_id": "fireball", "name": "Fireball", "type": "active", "description": "Launch a fiery projectile", "max_level": 10, "base_effect": "Fire DMG 50", "unlock_cost": 3, "icon": "fire", "stat_bonus": {"intelligence": 2}},
        {"skill_id": "ice_spikes", "name": "Ice Spikes", "type": "active", "description": "Freeze enemies in place", "max_level": 10, "base_effect": "Freeze 2s", "unlock_cost": 3, "icon": "snowflake", "stat_bonus": {"intelligence": 2}},
        {"skill_id": "lightning_dash", "name": "Lightning Dash", "type": "active", "description": "Teleport forward dealing damage", "max_level": 5, "base_effect": "Dash 5m", "unlock_cost": 4, "icon": "flash", "stat_bonus": {"agility": 3}},
        {"skill_id": "shadow_step", "name": "Shadow Step", "type": "active", "description": "Teleport behind target", "max_level": 5, "base_effect": "Teleport", "unlock_cost": 5, "icon": "ghost", "stat_bonus": {"agility": 3}},
        {"skill_id": "berserker_rage", "name": "Berserker Rage", "type": "active", "description": "Increase DMG taken and dealt", "max_level": 5, "base_effect": "DMG +50%, DEF -50%", "unlock_cost": 5, "icon": "skull", "stat_bonus": {"strength": 10}},
        {"skill_id": "heal", "name": "Heal", "type": "active", "description": "Restore Health", "max_level": 10, "base_effect": "HP +20%", "unlock_cost": 2, "icon": "heart", "stat_bonus": {"intelligence": 2}},
        {"skill_id": "wind_walk", "name": "Wind Walk", "type": "active", "description": "Walk on air for short time", "max_level": 3, "base_effect": "Fly 5s", "unlock_cost": 5, "icon": "weather-windy", "stat_bonus": {"agility": 5}},

        # Passive Skills (These give permanent stats)
        {"skill_id": "iron_skin", "name": "Iron Skin", "type": "passive", "description": "Reduce physical damage taken", "max_level": 10, "base_effect": "DEF +10%", "unlock_cost": 3, "icon": "wall", "stat_bonus": {"stamina": 10, "max_health": 50}},
        {"skill_id": "eagle_eye", "name": "Eagle Eye", "type": "passive", "description": "Increase accuracy/crit chance", "max_level": 10, "base_effect": "Crit +5%", "unlock_cost": 3, "icon": "eye", "stat_bonus": {"agility": 5}},
        {"skill_id": "health_regen", "name": "Health Regen", "type": "passive", "description": "Recover health over time", "max_level": 10, "base_effect": "HP +1/sec", "unlock_cost": 4, "icon": "heart-pulse", "stat_bonus": {"max_health": 100, "stamina": 10}},
        {"skill_id": "stamina_boost", "name": "Stamina Boost", "type": "passive", "description": "Increase Max Stamina", "max_level": 10, "base_effect": "Stamina +20", "unlock_cost": 2, "icon": "battery-charging", "stat_bonus": {"max_stamina": 50, "stamina": 20}},
        {"skill_id": "meditation", "name": "Meditation", "type": "passive", "description": "Increase EXP gain while resting", "max_level": 5, "base_effect": "Rest Exp +50%", "unlock_cost": 2, "icon": "brain", "stat_bonus": {"intelligence": 10}},
        {"skill_id": "vampiric_touch", "name": "Vampiric Touch", "type": "passive", "description": "Heal on hit", "max_level": 5, "base_effect": "Lifesteal 5%", "unlock_cost": 6, "icon": "water", "stat_bonus": {"strength": 5}},
        {"skill_id": "thorns", "name": "Thorns", "type": "passive", "description": "Reflect damage back to attacker", "max_level": 5, "base_effect": "Reflect 10%", "unlock_cost": 4, "icon": "cactus", "stat_bonus": {"stamina": 10}},
        {"skill_id": "stone_form", "name": "Stone Form", "type": "passive", "description": "Immune to knockback", "max_level": 1, "base_effect": "No Knockback", "unlock_cost": 5, "icon": "rhombus", "stat_bonus": {"stamina": 20}}
    ]

    print(f"Upserting {len(skills_data)} skills...")
    for skill in skills_data:
        db.skills.update_one(
            {'skill_id': skill['skill_id']},
            {'$set': skill},
            upsert=True
        )

    # --- TITLES ---
    titles_data = [
        {"title_id": "beginner", "name": "Beginner", "description": "Just starting the journey", "requirement": "Create Account", "stat_bonus": {"stamina": 5}},
        {"title_id": "novice", "name": "Novice", "description": "Reached Level 5", "requirement": "Level 5", "stat_bonus": {"strength": 2, "agility": 2}},
        {"title_id": "apprentice", "name": "Apprentice", "description": "Reached Level 10", "requirement": "Level 10", "stat_bonus": {"intelligence": 5, "stamina": 5}},
        {"title_id": "warrior", "name": "Warrior", "description": "Complete 50 Quests", "requirement": "50 Quests", "stat_bonus": {"strength": 10}},
        {"title_id": "mage", "name": "Mage", "description": "Unlock 5 Magic Skills", "requirement": "5 Magic Skills", "stat_bonus": {"intelligence": 10}},
        {"title_id": "assassin", "name": "Assassin", "description": "Kill 100 enemies from stealth", "requirement": "100 Stealth Kills", "stat_bonus": {"agility": 10}},
        {"title_id": "tank", "name": "Tank", "description": "Take 10,000 Damage", "requirement": "10k Damage Taken", "stat_bonus": {"max_health": 200, "stamina": 20}},
        {"title_id": "healer", "name": "Healer", "description": "Heal 5,000 HP", "requirement": "5k Healing", "stat_bonus": {"intelligence": 10, "max_health": 50}},
        {"title_id": "explorer", "name": "Explorer", "description": "Discover 10 Map Areas", "requirement": "10 Areas", "stat_bonus": {"stamina": 15}},
        {"title_id": "wolf_slayer", "name": "Wolf Slayer", "description": "Defeated the Steel Fanged Wolves", "requirement": "Boss Kill", "stat_bonus": {"strength": 5, "agility": 5}},
        {"title_id": "goblin_hunter", "name": "Goblin Hunter", "description": "Killed 50 Goblins", "requirement": "50 Goblins", "stat_bonus": {"strength": 3}},
        {"title_id": "dragon_bane", "name": "Dragon Bane", "description": "Slayed a Dragon", "requirement": "Kill Dragon", "stat_bonus": {"strength": 20, "intelligence": 20}},
        {"title_id": "hero", "name": "Hero", "description": "Saved the Village", "requirement": "Questline Complete", "stat_bonus": {"max_health": 100, "strength": 5, "agility": 5, "intelligence": 5}},
        {"title_id": "legend", "name": "Legend", "description": "Reached Level 50", "requirement": "Level 50", "stat_bonus": {"strength": 50, "agility": 50, "intelligence": 50, "stamina": 50}},
        {"title_id": "immortal", "name": "Immortal", "description": "Complete 100 Quests without dying", "requirement": "Survival Mode", "stat_bonus": {"max_health": 500}},
        {"title_id": "speedster", "name": "Speedster", "description": "Unlock Sprint Max Level", "requirement": "Max Sprint", "stat_bonus": {"agility": 20}},
        {"title_id": "strategist", "name": "Strategist", "description": "Complete 10 puzzles", "requirement": "10 Puzzles", "stat_bonus": {"intelligence": 15}},
        {"title_id": "berserker", "name": "Berserker", "description": "Stay below 10% HP for 5 mins", "requirement": "Risk Taker", "stat_bonus": {"strength": 30, "max_health": -50}},
        {"title_id": "archmage", "name": "Archmage", "description": "Unlock all Magic Skills", "requirement": "Mastery", "stat_bonus": {"intelligence": 50, "max_stamina": 100}},
        {"title_id": "shadow_lord", "name": "Shadow Lord", "description": "Unlock all Stealth Skills", "requirement": "Mastery", "stat_bonus": {"agility": 50, "strength": 20}},
        {"title_id": "one_above_all", "name": "One Above All", "description": "The absolute peak of power", "requirement": "Level 100", "stat_bonus": {"strength": 100, "agility": 100, "intelligence": 100, "stamina": 100}}
    ]

    print("✅ Database population complete!")

except Exception as e:
    print(f"❌ Error: {e}")
