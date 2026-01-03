"""
Progress Model
Handles progress logging and achievement tracking
"""

from datetime import datetime

class Progress:
    """Progress model for tracking user achievements"""
    
    def __init__(self, db):
        self.collection = db['progress_logs']
        self.titles = db['titles']
        self.user_titles = db['user_titles']
    
    def log_action(self, user_id, action_type, details):
        """Log a user action"""
        log_entry = {
            'user_id': user_id,
            'action_type': action_type,
            'details': details,
            'timestamp': datetime.utcnow()
        }
        
        result = self.collection.insert_one(log_entry)
        return result.inserted_id is not None
    
    def log_quest_completion(self, user_id, quest_id, exp_gained, rewards):
        """Log quest completion"""
        details = {
            'quest_id': quest_id,
            'exp_gained': exp_gained,
            'rewards': rewards
        }
        return self.log_action(user_id, 'quest_completed', details)
    
    def log_level_up(self, user_id, old_level, new_level, stat_bonuses):
        """Log level-up event"""
        details = {
            'old_level': old_level,
            'new_level': new_level,
            'stat_bonuses': stat_bonuses
        }
        return self.log_action(user_id, 'level_up', details)
    
    def log_skill_unlock(self, user_id, skill_id, skill_name):
        """Log skill unlock"""
        details = {
            'skill_id': skill_id,
            'skill_name': skill_name
        }
        return self.log_action(user_id, 'skill_unlocked', details)
    
    def get_progress_history(self, user_id, limit=20):
        """Get user's progress history"""
        history = list(self.collection.find(
            {'user_id': user_id}
        ).sort('timestamp', -1).limit(limit))
        
        for entry in history:
            entry['_id'] = str(entry['_id'])
        
        return history
    
    def get_title_templates(self):
        """Get predefined title templates"""
        return [
            {
                'title_id': 'beginner',
                'name': 'Beginner',
                'description': 'Just starting the journey',
                'requirement': 'Reach Level 1',
                'stat_bonus': {},
                'auto_grant': True
            },
            {
                'title_id': 'novice',
                'name': 'Novice',
                'description': 'Learning the ropes',
                'requirement': 'Reach Level 5',
                'stat_bonus': {'strength': 2, 'agility': 2},
                'level_required': 5
            },
            {
                'title_id': 'apprentice',
                'name': 'Apprentice',
                'description': 'Showing promise',
                'requirement': 'Reach Level 10',
                'stat_bonus': {'strength': 5, 'agility': 5, 'intelligence': 5},
                'level_required': 10
            },
            {
                'title_id': 'quest_master',
                'name': 'Quest Master',
                'description': 'Completed 50 quests',
                'requirement': 'Complete 50 quests',
                'stat_bonus': {'stamina': 10},
                'quests_required': 50
            },
            {
                'title_id': 'scholar',
                'name': 'Scholar',
                'description': 'Intelligence reaches 50',
                'requirement': 'Intelligence ≥ 50',
                'stat_bonus': {'intelligence': 10},
                'stat_required': {'intelligence': 50}
            },
            {
                'title_id': 'warrior',
                'name': 'Warrior',
                'description': 'Strength reaches 50',
                'requirement': 'Strength ≥ 50',
                'stat_bonus': {'strength': 10},
                'stat_required': {'strength': 50}
            },
            {
                'title_id': 'speedster',
                'name': 'Speedster',
                'description': 'Agility reaches 50',
                'requirement': 'Agility ≥ 50',
                'stat_bonus': {'agility': 10},
                'stat_required': {'agility': 50}
            },
            {
                'title_id': 'unstoppable',
                'name': 'Unstoppable',
                'description': 'Reach Level 20',
                'requirement': 'Reach Level 20',
                'stat_bonus': {'strength': 10, 'agility': 10, 'intelligence': 10, 'stamina': 20},
                'level_required': 20
            }
        ]
    
    def check_and_grant_titles(self, user_id, user_level, user_stats, quests_completed):
        """Check if user qualifies for any new titles"""
        templates = self.get_title_templates()
        granted_titles = []
        
        for title in templates:
            # Check if already has title
            existing = self.user_titles.find_one({
                'user_id': user_id,
                'title_id': title['title_id']
            })
            
            if existing:
                continue
            
            # Check requirements
            qualifies = False
            
            if title.get('auto_grant'):
                qualifies = True
            elif title.get('level_required'):
                qualifies = user_level >= title['level_required']
            elif title.get('quests_required'):
                qualifies = quests_completed >= title['quests_required']
            elif title.get('stat_required'):
                stat_name = list(title['stat_required'].keys())[0]
                required_value = title['stat_required'][stat_name]
                qualifies = user_stats.get(stat_name, 0) >= required_value
            
            if qualifies:
                # Grant title
                user_title = {
                    'user_id': user_id,
                    'title_id': title['title_id'],
                    'name': title['name'],
                    'description': title['description'],
                    'stat_bonus': title['stat_bonus'],
                    'granted_at': datetime.utcnow()
                }
                self.user_titles.insert_one(user_title)
                granted_titles.append(title)
        
        return granted_titles
    
    def get_user_titles(self, user_id):
        """Get all titles earned by user"""
        titles = list(self.user_titles.find({'user_id': user_id}))
        for title in titles:
            title['_id'] = str(title['_id'])
        return titles
