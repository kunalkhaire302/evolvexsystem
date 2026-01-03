"""
Quest Model
Handles quest data and completion tracking
"""

from datetime import datetime
import random

class Quest:
    """Quest model for task management"""
    
    def __init__(self, db):
        self.collection = db['quests']
        self.user_quests = db['user_quests']
    
    def get_quest_templates(self):
        """Get predefined quest templates"""
        return [
            # Daily Quests
            {
                'quest_id': 'daily_exercise',
                'title': '30-Minute Workout',
                'description': 'Complete a 30-minute exercise session',
                'type': 'daily',
                'difficulty': 'easy',
                'exp_reward': 50,
                'stat_rewards': {'stamina': 2, 'strength': 1},
                'stamina_cost': 15
            },
            {
                'quest_id': 'daily_reading',
                'title': 'Read for 1 Hour',
                'description': 'Read educational material for 60 minutes',
                'type': 'daily',
                'difficulty': 'easy',
                'exp_reward': 50,
                'stat_rewards': {'intelligence': 2},
                'stamina_cost': 10
            },
            {
                'quest_id': 'daily_coding',
                'title': 'Code for 2 Hours',
                'description': 'Practice coding for 2 hours',
                'type': 'daily',
                'difficulty': 'medium',
                'exp_reward': 100,
                'stat_rewards': {'intelligence': 3, 'agility': 1},
                'stamina_cost': 20
            },
            # Skill Improvement Quests
            {
                'quest_id': 'skill_meditation',
                'title': 'Meditation Practice',
                'description': 'Meditate for 20 minutes to improve focus',
                'type': 'skill',
                'difficulty': 'easy',
                'exp_reward': 40,
                'stat_rewards': {'intelligence': 1, 'stamina': 1},
                'stamina_cost': 5
            },
            {
                'quest_id': 'skill_sprint',
                'title': 'Sprint Training',
                'description': 'Complete 10 sprints to improve speed',
                'type': 'skill',
                'difficulty': 'medium',
                'exp_reward': 80,
                'stat_rewards': {'agility': 3, 'stamina': 1},
                'stamina_cost': 25
            },
            # Challenge Quests
            {
                'quest_id': 'challenge_marathon',
                'title': 'Marathon Study Session',
                'description': 'Study continuously for 4 hours',
                'type': 'challenge',
                'difficulty': 'hard',
                'exp_reward': 200,
                'stat_rewards': {'intelligence': 5, 'stamina': 2},
                'stamina_cost': 40
            },
            {
                'quest_id': 'challenge_project',
                'title': 'Complete a Project',
                'description': 'Finish a full coding project from start to end',
                'type': 'challenge',
                'difficulty': 'hard',
                'exp_reward': 300,
                'stat_rewards': {'intelligence': 4, 'agility': 3, 'strength': 2},
                'stamina_cost': 50
            },
            # Light Quests (for low stamina)
            {
                'quest_id': 'light_walk',
                'title': 'Light Walk',
                'description': 'Take a 15-minute walk',
                'type': 'daily',
                'difficulty': 'easy',
                'exp_reward': 25,
                'stat_rewards': {'stamina': 1},
                'stamina_cost': 5
            },
            {
                'quest_id': 'light_review',
                'title': 'Quick Review',
                'description': 'Review notes for 15 minutes',
                'type': 'daily',
                'difficulty': 'easy',
                'exp_reward': 30,
                'stat_rewards': {'intelligence': 1},
                'stamina_cost': 8
            }
        ]
    
    def get_available_quests(self, user_id, user_level, user_stamina):
        """Get available quests based on adaptive AI logic"""
        templates = self.get_quest_templates()
        available = []
        
        # Adaptive logic
        if user_stamina < 30:
            # Low stamina - assign light quests
            available = [q for q in templates if q['stamina_cost'] <= 10]
        elif user_level < 5:
            # Beginner - assign easy to medium quests
            available = [q for q in templates if q['difficulty'] in ['easy', 'medium']]
        else:
            # Advanced - all quests available
            available = templates
        
        # Filter by stamina availability
        available = [q for q in available if q['stamina_cost'] <= user_stamina]
        
        # Add quest status
        for quest in available:
            user_quest = self.user_quests.find_one({
                'user_id': user_id,
                'quest_id': quest['quest_id'],
                'status': 'active'
            })
            quest['is_active'] = user_quest is not None
        
        return available
    
    def complete_quest(self, user_id, quest_id):
        """Mark quest as completed"""
        quest_data = {
            'user_id': user_id,
            'quest_id': quest_id,
            'status': 'completed',
            'completed_at': datetime.utcnow()
        }
        
        result = self.user_quests.insert_one(quest_data)
        return result.inserted_id is not None
    
    def get_quest_history(self, user_id, limit=10):
        """Get user's quest completion history"""
        history = list(self.user_quests.find(
            {'user_id': user_id, 'status': 'completed'}
        ).sort('completed_at', -1).limit(limit))
        
        for quest in history:
            quest['_id'] = str(quest['_id'])
        
        return history
