"""
Skill Model
Handles user skills (Active and Passive)
"""

from datetime import datetime

class Skill:
    """Skill model for user abilities"""
    
    def __init__(self, db):
        self.collection = db['skills']
        self.user_skills = db['user_skills']
    
    def get_skill_templates(self):
        """Get predefined skill templates"""
        return [
            # Active Skills
            {
                'skill_id': 'focus_mode',
                'name': 'Focus Mode',
                'type': 'active',
                'description': 'Increases efficiency and concentration',
                'max_level': 10,
                'base_effect': 'Efficiency +5%',
                'level_bonus': 'Efficiency +5% per level',
                'unlock_cost': 2  # skill points
            },
            {
                'skill_id': 'quick_learner',
                'name': 'Quick Learner',
                'type': 'passive',
                'description': 'Gain bonus EXP from all activities',
                'max_level': 5,
                'base_effect': 'EXP +10%',
                'level_bonus': 'EXP +10% per level',
                'unlock_cost': 3
            },
            {
                'skill_id': 'endurance',
                'name': 'Endurance',
                'type': 'passive',
                'description': 'Reduces stamina consumption',
                'max_level': 10,
                'base_effect': 'Stamina cost -5%',
                'level_bonus': 'Stamina cost -5% per level',
                'unlock_cost': 2
            },
            {
                'skill_id': 'power_strike',
                'name': 'Power Strike',
                'type': 'active',
                'description': 'Increases strength temporarily',
                'max_level': 8,
                'base_effect': 'Strength +10',
                'level_bonus': 'Strength +5 per level',
                'unlock_cost': 3
            },
            {
                'skill_id': 'swift_movement',
                'name': 'Swift Movement',
                'type': 'active',
                'description': 'Increases agility temporarily',
                'max_level': 8,
                'base_effect': 'Agility +10',
                'level_bonus': 'Agility +5 per level',
                'unlock_cost': 3
            },
            {
                'skill_id': 'meditation',
                'name': 'Meditation',
                'type': 'active',
                'description': 'Restores stamina faster',
                'max_level': 5,
                'base_effect': 'Stamina recovery +10',
                'level_bonus': 'Stamina recovery +5 per level',
                'unlock_cost': 2
            },
            {
                'skill_id': 'iron_will',
                'name': 'Iron Will',
                'type': 'passive',
                'description': 'Increases max health',
                'max_level': 10,
                'base_effect': 'Max HP +20',
                'level_bonus': 'Max HP +10 per level',
                'unlock_cost': 4
            },
            {
                'skill_id': 'tactical_mind',
                'name': 'Tactical Mind',
                'type': 'passive',
                'description': 'Increases intelligence',
                'max_level': 10,
                'base_effect': 'Intelligence +5',
                'level_bonus': 'Intelligence +3 per level',
                'unlock_cost': 3
            }
        ]
    
    def get_user_skills(self, user_id):
        """Get all skills for a user"""
        skills = list(self.user_skills.find({'user_id': user_id}))
        for skill in skills:
            skill['_id'] = str(skill['_id'])
        return skills
    
    def unlock_skill(self, user_id, skill_id):
        """Unlock a new skill for user"""
        # Check if already unlocked
        existing = self.user_skills.find_one({
            'user_id': user_id,
            'skill_id': skill_id
        })
        
        if existing:
            return {'success': False, 'message': 'Skill already unlocked'}
        
        # Get skill template
        templates = self.get_skill_templates()
        skill_template = next((s for s in templates if s['skill_id'] == skill_id), None)
        
        if not skill_template:
            return {'success': False, 'message': 'Skill not found'}
        
        # Create user skill
        user_skill = {
            'user_id': user_id,
            'skill_id': skill_id,
            'name': skill_template['name'],
            'type': skill_template['type'],
            'level': 1,
            'exp': 0,
            'exp_required': 100,
            'max_level': skill_template['max_level'],
            'unlocked_at': datetime.utcnow()
        }
        
        result = self.user_skills.insert_one(user_skill)
        return {'success': True, 'skill_id': skill_id}
    
    def level_up_skill(self, user_id, skill_id):
        """Level up a skill"""
        skill = self.user_skills.find_one({
            'user_id': user_id,
            'skill_id': skill_id
        })
        
        if not skill:
            return {'success': False, 'message': 'Skill not found'}
        
        if skill['level'] >= skill['max_level']:
            return {'success': False, 'message': 'Skill already at max level'}
        
        new_level = skill['level'] + 1
        new_exp_required = new_level * 100
        
        self.user_skills.update_one(
            {'user_id': user_id, 'skill_id': skill_id},
            {
                '$set': {
                    'level': new_level,
                    'exp': 0,
                    'exp_required': new_exp_required
                }
            }
        )
        
        return {'success': True, 'new_level': new_level}
    
    def add_skill_exp(self, user_id, skill_id, exp_amount):
        """Add EXP to a skill"""
        skill = self.user_skills.find_one({
            'user_id': user_id,
            'skill_id': skill_id
        })
        
        if not skill:
            return False
        
        new_exp = skill['exp'] + exp_amount
        
        # Check for level-up
        if new_exp >= skill['exp_required'] and skill['level'] < skill['max_level']:
            self.level_up_skill(user_id, skill_id)
        else:
            self.user_skills.update_one(
                {'user_id': user_id, 'skill_id': skill_id},
                {'$set': {'exp': new_exp}}
            )
        
        return True
