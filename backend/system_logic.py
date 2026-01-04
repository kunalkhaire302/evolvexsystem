from datetime import datetime, timedelta

# --- 1. Weakness Exposure Module ---
def analyze_weakness(stats):
    """
    Analyzes user stats to find imbalances.
    Returns a 'System Notice' string or None.
    """
    s = stats.get('strength', 10)
    a = stats.get('agility', 10)
    i = stats.get('intelligence', 10)
    
    avg = (s + a + i) / 3
    threshold = avg * 0.8 # Flag if 20% below average
    
    notices = []
    
    if s < threshold:
        notices.append("STRENGTH")
    if a < threshold:
        notices.append("AGILITY")
    if i < threshold:
        notices.append("INTELLIGENCE")
        
    if notices:
        areas = ", ".join(notices)
        return f"⚠️ SYSTEM ALERT: Critical weakness detected in {areas}. Analysis suggests immediate training."
    
    return None

# --- 2. Identity Reinforcement (Titles) ---
def check_behavior_titles(user_id, db):
    """
    Checks user history for behavioral patterns and awards titles.
    Returns list of new title names.
    """
    new_titles = []
    
    # helper to grant title
    def grant_title(t_id, t_name, t_desc, bonus):
        # Check if already has
        if not db.user_titles.find_one({'user_id': user_id, 'title_id': t_id}):
            # Add to user_titles
            db.user_titles.insert_one({
                'user_id': user_id,
                'title_id': t_id,
                'title_name': t_name,
                'acquired_at': datetime.utcnow()
            })
            # Add definition if needed (idempotent)
            db.defined_titles.update_one(
                {'title_id': t_id},
                {'$set': {
                    'title_name': t_name,
                    'description': t_desc,
                    'stat_bonus': bonus
                }},
                upsert=True
            )
            new_titles.append(t_name)

    # 1. "Night Owl" - Late Night Activity
    # Check last 5 quests completed between 11PM (23) and 4AM (4)
    # This is a simplified check: just check if *current* action is late night
    hour = datetime.now().hour
    if hour >= 23 or hour < 4:
        # Check if they have done this multiple times? For now, grant on first occurrence for demo
        grant_title("night_owl", "Night Owl", "One who thrives in the shadow hours.", {'intelligence': 3})

    # 2. "Early Riser"
    if 5 <= hour < 8:
        grant_title("early_riser", "Early Riser", "Discipline begins before the sun.", {'stamina': 5})

    return new_titles

# --- 3. Consistency (Streak Integrity) ---
def process_streak_login(user, db):
    """
    Updates login streak with Decay logic.
    Returns (streak_count, message)
    """
    current_time = datetime.utcnow()
    last_login_str = user.get('last_login_streak_date')
    streak = user.get('streak_count', 0)
    
    msg = ""
    
    if not last_login_str:
        # First time tracking
        streak = 1
        msg = "Daily Streak Started: Day 1"
    else:
        last_login = datetime.fromisoformat(last_login_str)
        delta = current_time - last_login
        
        if delta.days == 0:
            # Same day, do nothing
            pass
        elif delta.days == 1:
            # Consecutive day!
            streak += 1
            msg = f"🔥 Streak Continued! Day {streak}"
        elif delta.days == 2:
            # Missed one day - DECAY (Recoverable)
            streak = max(0, streak - 1)
            msg = f"⚠️ SYSTEM WARNING: 24h Inactivity. Streak decayed by 1. Current: {streak}"
        else:
            # Missed > 2 days - RESET
            streak = 1
            msg = "🚫 Streak Lost due to inactivity. Reset to Day 1."
            
    # Update DB
    db.users.update_one(
        {'_id': user['_id']},
        {
            '$set': {
                'streak_count': streak,
                'last_login_streak_date': current_time.isoformat()
            }
        }
    )
    return streak, msg

# --- 4. PHASE 2: Recommendation Engine ---
def get_recommended_action(stats, quests):
    """
    Suggests the best quest based on the lowest stat.
    """
    # 1. Identify lowest stat
    s = stats.get('strength', 0)
    a = stats.get('agility', 0)
    i = stats.get('intelligence', 0)
    
    lowest_stat = 'strength'
    min_val = s
    
    if a < min_val:
        lowest_stat = 'agility'
        min_val = a
    if i < min_val:
        lowest_stat = 'intelligence'
        min_val = i
        
    # 2. Find quest giving that stat
    rec_quest = None
    for q in quests:
        # Check if quest rewards the lowest stat
        if lowest_stat in q.get('stat_rewards', {}):
            rec_quest = q
            break
            
    if rec_quest:
        return {
            'type': 'recommendation',
            'message': f"System Suggestion: Focus on {rec_quest['title']} to improve {lowest_stat.upper()}.",
            'quest_id': rec_quest['quest_id']
        }
    return None

# --- 5. PHASE 3: Predictive Analysis (Burnout) ---
def predict_burnout(stats, user_history):
    """
    Predicts burnout risk based on stamina and recent failures.
    """
    current_stamina = stats.get('stamina', 50)
    max_stamina = stats.get('max_stamina', 100)
    
    # Simple Heuristic: < 20% stamina is high risk
    if current_stamina < (max_stamina * 0.2):
         return "⚠️ PREDICTION: High Burnout Risk. Efficiency dropping. Rest recommended."
         
    return None
