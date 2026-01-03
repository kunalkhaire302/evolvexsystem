"""
Stats Model
Handles user statistics (Strength, Agility, Intelligence, Stamina, HP)
"""

from datetime import datetime

class Stats:
    """Stats model for user attributes"""
    
    def __init__(self, db):
        self.collection = db['stats']
    
    def create_stats(self, user_id):
        """Create initial stats for a new user"""
        stats_data = {
            'user_id': user_id,
            'strength': 10,
            'agility': 10,
            'intelligence': 10,
            'stamina': 50,
            'health': 100,
            'max_health': 100,
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        result = self.collection.insert_one(stats_data)
        stats_data['_id'] = str(result.inserted_id)
        return stats_data
    
    def get_stats(self, user_id):
        """Get user stats"""
        stats = self.collection.find_one({'user_id': user_id})
        if stats:
            stats['_id'] = str(stats['_id'])
        return stats
    
    def update_stats(self, user_id, stat_updates):
        """Update user stats"""
        stat_updates['updated_at'] = datetime.utcnow()
        
        result = self.collection.update_one(
            {'user_id': user_id},
            {'$set': stat_updates}
        )
        return result.modified_count > 0
    
    def increase_stats(self, user_id, stat_increases):
        """Increase stats by specified amounts"""
        stat_increases['updated_at'] = datetime.utcnow()
        
        # Build increment dictionary
        inc_dict = {}
        for stat, value in stat_increases.items():
            if stat != 'updated_at':
                inc_dict[stat] = value
        
        result = self.collection.update_one(
            {'user_id': user_id},
            {
                '$inc': inc_dict,
                '$set': {'updated_at': stat_increases['updated_at']}
            }
        )
        return result.modified_count > 0
    
    def level_up_stats(self, user_id, stat_bonuses):
        """Apply level-up stat bonuses"""
        return self.increase_stats(user_id, stat_bonuses)
    
    def restore_stamina(self, user_id, amount):
        """Restore stamina (capped at 100)"""
        stats = self.get_stats(user_id)
        if not stats:
            return False
        
        new_stamina = min(stats['stamina'] + amount, 100)
        return self.update_stats(user_id, {'stamina': new_stamina})
    
    def restore_health(self, user_id, amount):
        """Restore health (capped at max_health)"""
        stats = self.get_stats(user_id)
        if not stats:
            return False
        
        new_health = min(stats['health'] + amount, stats['max_health'])
        return self.update_stats(user_id, {'health': new_health})
    
    def consume_stamina(self, user_id, amount):
        """Consume stamina for quest completion"""
        stats = self.get_stats(user_id)
        if not stats or stats['stamina'] < amount:
            return False
        
        new_stamina = max(stats['stamina'] - amount, 0)
        return self.update_stats(user_id, {'stamina': new_stamina})
