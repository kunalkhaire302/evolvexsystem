"""
User Model
Handles user data and authentication
"""

from datetime import datetime
import bcrypt

class User:
    """User model for authentication and profile"""
    
    def __init__(self, db):
        self.collection = db['users']
    
    def create_user(self, username, email, password):
        """Create a new user with hashed password"""
        # Check if user already exists
        if self.collection.find_one({'$or': [{'username': username}, {'email': email}]}):
            return None
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_data = {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'level': 1,
            'exp': 0,
            'exp_required': 100,  # level² × 100 = 1² × 100
            'skill_points': 0,
            'created_at': datetime.utcnow(),
            'last_login': datetime.utcnow()
        }
        
        result = self.collection.insert_one(user_data)
        user_data['_id'] = str(result.inserted_id)
        return user_data
    
    def verify_password(self, username, password):
        """Verify user password"""
        user = self.collection.find_one({'username': username})
        if not user:
            return None
        
        if bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
            # Update last login
            self.collection.update_one(
                {'_id': user['_id']},
                {'$set': {'last_login': datetime.utcnow()}}
            )
            user['_id'] = str(user['_id'])
            return user
        return None
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        from bson.objectid import ObjectId
        user = self.collection.find_one({'_id': ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])
        return user
    
    def get_user_by_username(self, username):
        """Get user by username"""
        user = self.collection.find_one({'username': username})
        if user:
            user['_id'] = str(user['_id'])
        return user
    
    def update_user(self, user_id, update_data):
        """Update user data"""
        from bson.objectid import ObjectId
        result = self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0
    
    def level_up(self, user_id):
        """Level up user and update EXP requirements"""
        from bson.objectid import ObjectId
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        new_level = user['level'] + 1
        new_exp_required = (new_level ** 2) * 100
        
        self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$set': {
                    'level': new_level,
                    'exp': 0,
                    'exp_required': new_exp_required
                },
                '$inc': {'skill_points': 1}
            }
        )
        return True
    
    def add_exp(self, user_id, exp_amount):
        """Add EXP to user and handle level-ups"""
        from bson.objectid import ObjectId
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        new_exp = user['exp'] + exp_amount
        leveled_up = False
        
        # Check for level-up
        while new_exp >= user['exp_required']:
            new_exp -= user['exp_required']
            self.level_up(user_id)
            user = self.get_user_by_id(user_id)
            leveled_up = True
        
        # Update EXP
        self.collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'exp': new_exp}}
        )
        
        return {'leveled_up': leveled_up, 'new_level': user['level'] if leveled_up else None}
