"""
Simple Backend Starter - Guaranteed to Work
This bypasses any startup issues
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
import bcrypt
from datetime import timedelta
import os
import sys
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Detect if running as PyInstaller bundle
def get_base_path():
    """Get the base path for the application (works for both dev and bundled exe)"""
    if getattr(sys, 'frozen', False):
        # Running as compiled executable
        return sys._MEIPASS
    else:
        # Running in normal Python environment
        return os.path.dirname(os.path.abspath(__file__))

BASE_PATH = get_base_path()

# Load environment variables from multiple possible locations
env_locations = [
    os.path.join(os.path.dirname(sys.executable), '.env') if getattr(sys, 'frozen', False) else None,
    os.path.join(BASE_PATH, '.env'),
    os.path.join(BASE_PATH, '..', '.env'),
    '.env'
]
for env_path in env_locations:
    if env_path and os.path.exists(env_path):
        load_dotenv(env_path)
        print(f"✅ Loaded .env from: {env_path}")
        break
else:
    load_dotenv()  # Try default locations

from flask import send_from_directory

# Determine frontend folder path
if getattr(sys, 'frozen', False):
    # Running as exe - frontend is in _MEIPASS/frontend
    FRONTEND_FOLDER = os.path.join(BASE_PATH, 'frontend')
else:
    # Running as script - frontend is in ../frontend
    FRONTEND_FOLDER = os.path.join(BASE_PATH, '..', 'frontend')

print(f"📂 Frontend folder: {FRONTEND_FOLDER}")

# Create Flask app
app = Flask(__name__, static_folder=FRONTEND_FOLDER, static_url_path='')
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['JWT_SECRET_KEY'] = 'your-jwt-secret-key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize JWT
jwt = JWTManager(app)

import json
from bson.objectid import ObjectId

# Custom JSON Encoder for MongoDB ObjectId
class MongoJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

app.json_encoder = MongoJSONEncoder


# Connect to MongoDB
# Default URI with actual credentials (used if .env has placeholders)
DEFAULT_MONGO_URI = 'mongodb+srv://kunalkhaire177_db_user:Sj2LigG8XfQvbcF2@cluster0.7keyczh.mongodb.net/the_system?retryWrites=true&w=majority&appName=Cluster0'

try:
    mongo_uri = os.getenv('MONGO_URI', DEFAULT_MONGO_URI)
    
    # If .env has placeholder password, use the hardcoded default
    if '<db_password>' in mongo_uri or '<password>' in mongo_uri:
        print("⚠️  .env has placeholder password, using default credentials...")
        mongo_uri = DEFAULT_MONGO_URI
    
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    client.server_info()
    db = client['the_system']
    print("✅ MongoDB Connected!")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")
    # Check for common errors
    if "bad auth" in str(e).lower():
         print("⚠️  Authentication failed. Did you replace <db_password> in .env?")
    if "nodename nor servname" in str(e).lower():
         print("⚠️  DNS error. Check your internet connection or the MONGO_URI string.")
    db = None

# Serve Frontend - Root Route
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

# Serve Dashboard
@app.route('/dashboard.html')
def serve_dashboard():
    return send_from_directory(app.static_folder, 'dashboard.html')

# Health check
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'healthy',
        'database': 'connected' if db is not None else 'disconnected'
    })

# Register
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({'error': 'Missing fields'}), 400
            
        if db is None:
            return jsonify({'error': 'Database not connected. Check server logs for details.'}), 500
        
        # Check if user exists
        if db.users.find_one({'$or': [{'username': username}, {'email': email}]}):
            return jsonify({'error': 'User already exists'}), 409
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user
        user = {
            'username': username,
            'email': email,
            'password_hash': password_hash,
            'level': 1,
            'exp': 0,
            'exp_required': 100,
            'skill_points': 0
        }
        
        result = db.users.insert_one(user)
        user_id = str(result.inserted_id)
        
        # Create stats
        db.stats.insert_one({
            'user_id': user_id,
            'strength': 10,
            'agility': 10,
            'intelligence': 10,
            'stamina': 50,
            'health': 100,
            'max_health': 100
        })
        
        # Create token
        token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'Registration successful',
            'access_token': token,
            'user': {
                'id': user_id,
                'username': username,
                'level': 1
            }
        }), 201
        
    except Exception as e:
        print(f"Register error: {e}")
        return jsonify({'error': str(e)}), 500

# Login
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Missing credentials'}), 400
            
        if db is None:
            return jsonify({'error': 'Database not connected. Check server logs.'}), 500
        
        # Find user
        user = db.users.find_one({'username': username})
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
            return jsonify({'error': 'Invalid credentials'}), 401
            
        # Create token
        token = create_access_token(identity=str(user['_id']))
        
        # Check inactivity penalty
        import datetime
        current_time = datetime.datetime.utcnow()
        last_login_str = user.get('last_login')
        penalty_applied = False
        
        if last_login_str:
            last_login = datetime.datetime.fromisoformat(last_login_str)
            delta = current_time - last_login
            
            if delta.days >= 2:
                # Apply penalty: -1 level
                if user['level'] > 1:
                    new_level = user['level'] - 1
                    # Update DB
                    db.users.update_one(
                        {'_id': user['_id']},
                        {'$set': {'level': new_level}}
                    )
                    user['level'] = new_level # Update local object for response
                    penalty_applied = True
        
        # Update last_login
        db.users.update_one(
            {'_id': user['_id']},
            {'$set': {'last_login': current_time.isoformat()}}
        )
        
        response_data = {
            'message': 'Login successful',
            'access_token': token,
            'user': {
                'id': str(user['_id']),
                'username': user['username'],
                'level': user['level'],
                'exp': user['exp'],
                'exp_required': user['exp_required']
            }
        }
        
        if penalty_applied:
            response_data['message'] = 'Login successful. ⚠️ You lost 1 Level due to inactivity (>2 days)!'
            
        return jsonify(response_data), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': str(e)}), 500

# Get profile
@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        from bson.objectid import ObjectId
        user_id = get_jwt_identity()
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        stats = db.stats.find_one({'user_id': user_id})
        
        if not user or not stats:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email'],
                'profile_image': user.get('profile_image', f"https://api.dicebear.com/7.x/avataaars/svg?seed={user['username']}"),
                'level': user['level'],
                'exp': user['exp'],
                'exp_required': user['exp_required'],
                'skill_points': user['skill_points']
            },
            'stats': {
                'strength': stats['strength'],
                'agility': stats['agility'],
                'intelligence': stats['intelligence'],
                'stamina': stats['stamina'],
                'health': stats['health'],
                'max_health': stats['max_health']
            },
            'titles': []
        }), 200
        
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({'error': str(e)}), 500

# File Upload Configuration
UPLOAD_FOLDER = 'uploads/profiles'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/user/upload-image', methods=['POST'])
@jwt_required()
def upload_profile_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        try:
            from bson.objectid import ObjectId
            user_id = get_jwt_identity()
            
            filename = secure_filename(file.filename)
            # Make unique filename
            import uuid
            unique_filename = f"{user_id}_{uuid.uuid4().hex[:8]}_{filename}"
            
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
            
            # Update DB
            base_url = request.host_url.rstrip('/')
            image_url = f"{base_url}/uploads/profiles/{unique_filename}"
            db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'profile_image': image_url}})
            
            return jsonify({'message': 'Image uploaded successfully', 'image_url': image_url}), 200
        except Exception as e:
            print(f"Upload error: {e}")
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file type'}), 400

@app.route('/uploads/profiles/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Restore stamina
@app.route('/api/user/restore-stamina', methods=['POST'])
@jwt_required()
def restore_stamina():
    try:
        from bson.objectid import ObjectId
        user_id = get_jwt_identity()
        data = request.get_json()
        amount = data.get('amount', 20)
        
        stats = db.stats.find_one({'user_id': user_id})
        if not stats:
            return jsonify({'error': 'User not found'}), 404
        
        # Restore stamina (cap at 100)
        new_stamina = min(stats['stamina'] + amount, 100)
        
        db.stats.update_one(
            {'user_id': user_id},
            {'$set': {'stamina': new_stamina}}
        )
        
        return jsonify({
            'message': 'Stamina restored',
            'stamina': new_stamina
        }), 200
        
    except Exception as e:
        print(f"Restore stamina error: {e}")
        return jsonify({'error': str(e)}), 500


# Initialize default quests
def init_quests():
    try:
        # Check if default quests exist in main quests collection
        # We check for one of the known IDs to avoid duplicates
        if db.quests.count_documents({'quest_id': 'daily_coding'}) == 0:
            default_quests = [
                {
                    'quest_id': 'daily_coding',
                    'title': 'Code for 2 Hours',
                    'description': 'Practice coding for 2 hours',
                    'type': 'daily',
                    'difficulty': 'medium',
                    'exp_reward': 100,
                    'stat_rewards': {'intelligence': 3, 'agility': 1},
                    'stamina_cost': 20,
                    'is_custom': False
                },
                {
                    'quest_id': 'morning_exercise',
                    'title': 'Morning Exercise',
                    'description': 'Complete 30 minutes of exercise',
                    'type': 'daily',
                    'difficulty': 'easy',
                    'exp_reward': 50,
                    'stat_rewards': {'strength': 2, 'stamina': 1},
                    'stamina_cost': 10,
                    'is_custom': False
                },
                {
                    'quest_id': 'study_session',
                    'title': 'Study Session',
                    'description': 'Study for 1 hour',
                    'type': 'skill',
                    'difficulty': 'easy',
                    'exp_reward': 60,
                    'stat_rewards': {'intelligence': 2},
                    'stamina_cost': 15,
                    'is_custom': False
                }
            ]
            db.quests.insert_many(default_quests)
            print("✅ Default quests initialized")
    except Exception as e:
        print(f"❌ Error initializing quests: {e}")

# Run initialization
try:
    init_quests()
except:
    pass

# Get available quests
@app.route('/api/quests/available', methods=['GET'])
@jwt_required()
def get_quests():
    try:
        from bson.objectid import ObjectId
        user_id = get_jwt_identity()
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        stats = db.stats.find_one({'user_id': user_id})
        
        if not user or not stats:
            return jsonify({'error': 'User not found'}), 404
        
        quests_map = {}
        
        def sanitize_quest(q):
            # Convert _id
            if '_id' in q:
                q['_id'] = str(q['_id'])
            # Convert quest_id safety
            if 'quest_id' not in q:
                if '_id' in q:
                    q['quest_id'] = str(q['_id'])
            # Convert original_id if present
            if 'original_id' in q:
                q['original_id'] = str(q['original_id'])
            return q

        # 1. Get default/system quests
        system_quests_cursor = db.quests.find({'user_id': {'$exists': False}})
        for q in system_quests_cursor:
             q = sanitize_quest(q)
             quests_map[q['quest_id']] = q

        # 2. Get custom quests
        custom_quests_cursor = db.custom_quests.find({'user_id': user_id})
        for q in custom_quests_cursor:
             q = sanitize_quest(q)
             quests_map[q['quest_id']] = q
            
        # 3. Check db.quests for user-specific quests
        user_quests_main = db.quests.find({'user_id': user_id})
        for q in user_quests_main:
             q = sanitize_quest(q)
             quests_map[q['quest_id']] = q
            
        quests = list(quests_map.values())
        
        return jsonify({
            'quests': quests,
            'user_stamina': stats['stamina'],
            'user_level': user['level']
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Quests error: {e}")
        return jsonify({'error': str(e)}), 500

# Add custom quest
@app.route('/api/quests/add', methods=['POST'])
@jwt_required()
def add_custom_quest():
    try:
        from bson.objectid import ObjectId
        import time
        
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Create custom quest
        custom_quest = {
            'user_id': user_id,
            'quest_id': f"custom_{int(time.time())}",
            'title': data.get('title'),
            'description': data.get('description'),
            'difficulty': data.get('difficulty', 'easy'),
            'exp_reward': data.get('exp_reward', 50),
            'stamina_cost': data.get('stamina_cost', 10),
            'stat_rewards': {},
            'is_custom': True,
            'created_at': None
        }
        
        # Save to database
        db.custom_quests.insert_one(custom_quest)
        
        # Convert ObjectId to string
        custom_quest['_id'] = str(custom_quest['_id'])
        
        return jsonify({
            'message': 'Custom quest created successfully',
            'quest': custom_quest
        }), 201
        
    except Exception as e:
        print(f"Add quest error: {e}")
        return jsonify({'error': str(e)}), 500

# Complete quest
@app.route('/api/quests/complete', methods=['POST'])
@jwt_required()
def complete_quest():
    try:
        from bson.objectid import ObjectId
        user_id = get_jwt_identity()
        data = request.get_json()
        quest_id = data.get('quest_id')
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        stats = db.stats.find_one({'user_id': user_id})
        
        if not user or not stats:
            return jsonify({'error': 'User not found'}), 404
        
        # Quest rewards (simplified)
        rewards = {
            'daily_coding': {'exp': 100, 'intelligence': 3, 'agility': 1, 'stamina': 20},
            'morning_exercise': {'exp': 50, 'strength': 2, 'stamina': 10},
            'study_session': {'exp': 60, 'intelligence': 2, 'stamina': 15}
        }
        
        reward = rewards.get(quest_id, {'exp': 50, 'stamina': 10})
        
        # Check stamina
        if stats['stamina'] < reward.get('stamina', 10):
            return jsonify({'error': 'Not enough stamina'}), 400
        
        # Update stats
        new_stamina = stats['stamina'] - reward.get('stamina', 10)
        db.stats.update_one(
            {'user_id': user_id},
            {'$set': {'stamina': new_stamina}}
        )
        
        # Add stat rewards
        stat_updates = {}
        for stat, value in reward.items():
            if stat not in ['exp', 'stamina']:
                stat_updates[stat] = stats.get(stat, 10) + value
        
        if stat_updates:
            db.stats.update_one(
                {'user_id': user_id},
                {'$set': stat_updates}
            )
        
        # Add EXP and check level up
        new_exp = user['exp'] + reward.get('exp', 50)
        exp_required = user['exp_required']
        leveled_up = False
        new_level = user['level']
        new_titles = []
        
        if new_exp >= exp_required:
            leveled_up = True
            new_level = user['level'] + 1
            new_exp = new_exp - exp_required
            new_exp_required = (new_level ** 2) * 100
            new_skill_points = user['skill_points'] + 1
            
            db.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {
                    'level': new_level,
                    'exp': new_exp,
                    'exp_required': new_exp_required,
                    'skill_points': new_skill_points
                }}
            )
            
            # Level up stat bonuses
            new_max_stamina = 50 + (new_level * 5)
            
            db.stats.update_one(
                {'user_id': user_id},
                {'$inc': {
                    'strength': 2,
                    'agility': 2,
                    'intelligence': 2,
                    'stamina': 3,
                    'max_health': 10
                },
                '$set': {
                    'max_stamina': new_max_stamina
                }}
            )
            
            # Check and grant titles based on new level
            if new_level >= 5:
                # Check if user already has the title
                existing_title = db.user_titles.find_one({
                    'user_id': user_id,
                    'title_id': 'novice'
                })
                if not existing_title:
                    db.user_titles.insert_one({
                        'user_id': user_id,
                        'title_id': 'novice',
                        'title_name': 'Novice',
                        'earned_at': None
                    })
                    new_titles.append('Novice')
            
            if new_level >= 10:
                existing_title = db.user_titles.find_one({
                    'user_id': user_id,
                    'title_id': 'apprentice'
                })
                if not existing_title:
                    db.user_titles.insert_one({
                        'user_id': user_id,
                        'title_id': 'apprentice',
                        'title_name': 'Apprentice',
                        'earned_at': None
                    })
                    new_titles.append('Apprentice')
                    
        else:
            db.users.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': {'exp': new_exp}}
            )
        
        # Get updated data
        updated_user = db.users.find_one({'_id': ObjectId(user_id)})
        updated_stats = db.stats.find_one({'user_id': user_id})
        
        return jsonify({
            'message': 'Quest completed successfully',
            'exp_gained': reward.get('exp', 50),
            'leveled_up': leveled_up,
            'new_level': new_level if leveled_up else None,
            'new_titles': new_titles,
            'user': {
                'level': updated_user['level'],
                'exp': updated_user['exp'],
                'exp_required': updated_user['exp_required'],
                'skill_points': updated_user['skill_points']
            },
            'stats': {
                'strength': updated_stats['strength'],
                'agility': updated_stats['agility'],
                'intelligence': updated_stats['intelligence'],
                'stamina': updated_stats['stamina'],
                'health': updated_stats['health']
            }
        }), 200
        
    except Exception as e:
        print(f"Complete quest error: {e}")
        return jsonify({'error': str(e)}), 500


# Edit quest
@app.route('/api/quests/edit', methods=['PUT'])
@jwt_required()
def edit_quest():
    try:
        from bson.objectid import ObjectId
        user_id = get_jwt_identity()
        data = request.get_json()
        
        quest_id = data.get('quest_id')
        if not quest_id:
             return jsonify({'error': 'Quest ID is required'}), 400

        # Prepare update data
        update_data = {
            'title': data.get('title'),
            'description': data.get('description'),
            'difficulty': data.get('difficulty'),
            'exp_reward': int(data.get('exp_reward', 0)),
            'stamina_cost': int(data.get('stamina_cost', 0)),
            # 'stat_rewards': data.get('stat_rewards', {}) # Simplify for now or parse properly if sent
        }
        
        # Determine strict or flexible matching.
        # Check standard quests collection (where defaults now live)
        # Note: If it's a default quest (no user_id), we should technically
        # CLONE it to a custom quest for the user to "override" it, OR simply allow editing if it's single player.
        # Since it's single player effectively now:
        # We will try to update in both collections.
        
        
        # 1. Try Custom Quests Collection (Already Overridden)
        res = db.custom_quests.update_one(
            {'quest_id': quest_id, 'user_id': user_id},
            {'$set': update_data}
        )
        
        if res.matched_count > 0:
             return jsonify({'message': 'Quest updated successfully'}), 200

        # 2. Check Standard Quests Collection (Global)
        # If it found here, we must NOT update it directly.
        # instead, we CLONE it to custom_quests with the changes.
        
        global_quest = db.quests.find_one({'quest_id': quest_id})
        if global_quest:
            # Create override
            new_custom_quest = global_quest.copy()
            new_custom_quest.update(update_data)
            new_custom_quest['user_id'] = user_id
            new_custom_quest['original_id'] = new_custom_quest.pop('_id') # Keep ref but new _id
            new_custom_quest['is_custom'] = True # Treat as custom now
            
            db.custom_quests.insert_one(new_custom_quest)
            return jsonify({'message': 'Quest updated successfully (Override created)'}), 200
            
        return jsonify({'error': 'Quest not found'}), 404


    except Exception as e:
        print(f"Edit quest error: {e}")
        return jsonify({'error': str(e)}), 500
@app.route('/api/quests/<quest_id>', methods=['DELETE'])
@jwt_required()
def delete_quest(quest_id):
    try:
        from bson.objectid import ObjectId
        user_id = get_jwt_identity()

        # Try to find and delete from standard quests collection first
        try:
            # Check if it's a valid ObjectId
            oid = ObjectId(quest_id)
            result = db.quests.delete_one({'_id': oid})
            if result.deleted_count == 1:
                return jsonify({'message': 'Quest deleted successfully'}), 200
        except:
            # Not a valid ObjectId, might be a custom string ID
            pass
            
        # Try deleting by string quest_id in custom_quests collection
        result = db.custom_quests.delete_one({'quest_id': quest_id, 'user_id': user_id})
        
        if result.deleted_count == 1:
             return jsonify({'message': 'Custom quest deleted successfully'}), 200
        
        # Also try searching by _id in custom_quests if it happens to be an ObjectId there
        try:
             oid = ObjectId(quest_id)
             result = db.custom_quests.delete_one({'_id': oid, 'user_id': user_id})
             if result.deleted_count == 1:
                 return jsonify({'message': 'Custom quest deleted successfully'}), 200
        except:
            pass

        return jsonify({'error': 'Quest not found or could not be deleted'}), 404

    except Exception as e:
        print(f"Delete quest error: {e}")
        return jsonify({'error': str(e)}), 500

# Get skills
@app.route('/api/skills/', methods=['GET'])
@jwt_required()
def get_skills():
    try:
        # Sample skills
        available_skills = [
            {
                'skill_id': 'focus_mode',
                'name': 'Focus Mode',
                'type': 'active',
                'description': 'Increases efficiency and concentration',
                'max_level': 10,
                'base_effect': 'Efficiency +5%',
                'level_bonus': 'Efficiency +5% per level',
                'unlock_cost': 2
            },
            {
                'skill_id': 'quick_learner',
                'name': 'Quick Learner',
                'type': 'passive',
                'description': 'Gain more EXP from quests',
                'max_level': 5,
                'base_effect': 'EXP +10%',
                'level_bonus': 'EXP +10% per level',
                'unlock_cost': 3
            },
            {
                'skill_id': 'endurance',
                'name': 'Endurance',
                'type': 'passive',
                'description': 'Reduce stamina cost of quests',
                'max_level': 10,
                'base_effect': 'Stamina cost -5%',
                'level_bonus': 'Stamina cost -5% per level',
                'unlock_cost': 2
            },
            {
                'skill_id': 'stealth',
                'name': 'Stealth',
                'type': 'active',
                'description': 'Hide your presence from enemies',
                'max_level': 5,
                'base_effect': 'Detection range -20%',
                'level_bonus': 'Range -10% per level',
                'unlock_cost': 3
            },
            {
                'skill_id': 'sprint',
                'name': 'Sprint',
                'type': 'active',
                'description': 'Move with incredible speed',
                'max_level': 5,
                'base_effect': 'Speed +30%',
                'level_bonus': 'Speed +10% per level',
                'unlock_cost': 2
            },
            {
                'skill_id': 'iron_body',
                'name': 'Iron Body',
                'type': 'passive',
                'description': 'Harden your skin like iron',
                'max_level': 10,
                'base_effect': 'Physical Reduction +10%',
                'level_bonus': 'Reduction +2% per level',
                'unlock_cost': 4
            }
        ]
        
        from bson.objectid import ObjectId
        user_id = get_jwt_identity()

        # Fetch user's unlocked skills specific to them
        db_user_skills = list(db.user_skills.find({'user_id': user_id}))
        
        # Merge with static data
        user_skills_list = []
        for db_skill in db_user_skills:
            # Find matching static definition
            static_def = next((s for s in available_skills if s['skill_id'] == db_skill['skill_id']), None)
            if static_def:
                merged = static_def.copy()
                merged['level'] = db_skill.get('level', 1)
                merged['exp'] = db_skill.get('exp', 0)
                merged['exp_required'] = 100 * merged['level'] # Basic formula
                user_skills_list.append(merged)
        
        return jsonify({
            'user_skills': user_skills_list,
            'available_skills': available_skills
        }), 200
        
    except Exception as e:
        print(f"Skills error: {e}")
        return jsonify({'error': str(e)}), 500

# Unlock skill
@app.route('/api/skills/unlock', methods=['POST'])
@jwt_required()
def unlock_skill():
    try:
        from bson.objectid import ObjectId
        user_id = get_jwt_identity()
        data = request.get_json()
        skill_id = data.get('skill_id')
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Skill costs
        skill_costs = {
            'focus_mode': 2,
            'quick_learner': 3,
            'endurance': 2,
            'stealth': 3,
            'sprint': 2,
            'iron_body': 4,
        }
        
        # Skill names
        skill_names = {
            'focus_mode': 'Focus Mode',
            'quick_learner': 'Quick Learner',
            'endurance': 'Endurance',
            'stealth': 'Stealth',
            'sprint': 'Sprint',
            'iron_body': 'Iron Body',
        }
        
        cost = skill_costs.get(skill_id, 2)
        skill_name = skill_names.get(skill_id, 'Unknown Skill')
        
        # Check skill points
        if user['skill_points'] < cost:
            return jsonify({'error': 'Not enough skill points'}), 400
        
        # Deduct skill points
        new_skill_points = user['skill_points'] - cost
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'skill_points': new_skill_points}}
        )
        
        # Store unlocked skill (simplified - just track in a collection)
        db.user_skills.insert_one({
            'user_id': user_id,
            'skill_id': skill_id,
            'level': 1,
            'unlocked_at': None
        })
        
        return jsonify({
            'message': 'Skill unlocked successfully',
            'skill_points': new_skill_points,
            'skill_name': skill_name
        }), 200
        
    except Exception as e:
        print(f"Unlock skill error: {e}")
        return jsonify({'error': str(e)}), 500

# Get titles
@app.route('/api/user/titles', methods=['GET'])
@jwt_required()
def get_titles():
    try:
        user_id = get_jwt_identity()
        
        available_titles = [
            {
                'title_id': 'beginner',
                'name': 'Beginner',
                'description': 'Just starting the journey',
                'requirement': 'Start the game',
                'stat_bonus': {}
            },
            {
                'title_id': 'novice',
                'name': 'Novice',
                'description': 'Learning the ropes',
                'requirement': 'Reach Level 5',
                'stat_bonus': {'strength': 2, 'agility': 2}
            },
            {
                'title_id': 'apprentice',
                'name': 'Apprentice',
                'description': 'Making progress',
                'requirement': 'Reach Level 10',
                'stat_bonus': {'intelligence': 5, 'stamina': 5}
            },
            {
                'title_id': 'wolf_slayer',
                'name': 'Wolf Slayer',
                'description': 'Defeated the Steel Fanged Wolves',
                'requirement': 'Unknown',
                'stat_bonus': {'strength': 3, 'agility': 3}
            },
            {
                'title_id': 'one_above_all',
                'name': 'One Above All',
                'description': 'The absolute peak of power',
                'requirement': 'Reach Level 100',
                'stat_bonus': {'strength': 10, 'agility': 10, 'intelligence': 10, 'stamina': 10}
            }
        ]
        
        # Get earned titles from database
        earned_titles_cursor = db.user_titles.find({'user_id': user_id})
        earned_titles = []
        
        # Always include beginner title
        earned_titles.append({
            'title_id': 'beginner',
            'name': 'Beginner',
            'description': 'Just starting the journey'
        })
        
        # Add other earned titles
        for title in earned_titles_cursor:
            earned_titles.append({
                'title_id': title['title_id'],
                'name': title['title_name'],
                'description': available_titles[1]['description'] if title['title_id'] == 'novice' else available_titles[2]['description']
            })
        
        return jsonify({
            'earned_titles': earned_titles,
            'available_titles': available_titles
        }), 200
        
    except Exception as e:
        print(f"Titles error: {e}")
        return jsonify({'error': str(e)}), 500

# Check and grant missing titles (for retroactive unlocking)
@app.route('/api/user/check-titles', methods=['POST'])
@jwt_required()
def check_titles():
    try:
        from bson.objectid import ObjectId
        user_id = get_jwt_identity()
        
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        current_level = user['level']
        new_titles = []
        
        # Check for Novice (Level 5+)
        if current_level >= 5:
            existing = db.user_titles.find_one({
                'user_id': user_id,
                'title_id': 'novice'
            })
            if not existing:
                db.user_titles.insert_one({
                    'user_id': user_id,
                    'title_id': 'novice',
                    'title_name': 'Novice',
                    'earned_at': None
                })
                new_titles.append('Novice')
        
        # Check for Apprentice (Level 10+)
        if current_level >= 10:
            existing = db.user_titles.find_one({
                'user_id': user_id,
                'title_id': 'apprentice'
            })
            if not existing:
                db.user_titles.insert_one({
                    'user_id': user_id,
                    'title_id': 'apprentice',
                    'title_name': 'Apprentice',
                    'earned_at': None
                })
                new_titles.append('Apprentice')
        
        return jsonify({
            'message': 'Titles checked and granted',
            'new_titles': new_titles,
            'current_level': current_level
        }), 200
        
    except Exception as e:
        print(f"Check titles error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎮 THE SYSTEM - Backend Server")
    print("="*60)
    print("🌐 Server: http://127.0.0.1:5000")
    print(f"📊 Database: {'Connected ✅' if db is not None else 'Disconnected ❌'}")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
