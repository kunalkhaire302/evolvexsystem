"""
Authentication Routes
Handles user registration and login
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from models.stats import Stats
from models.progress import Progress

auth_bp = Blueprint('auth', __name__)

# These will be initialized in app.py
user_model = None
stats_model = None
progress_model = None

def init_auth_routes(db):
    """Initialize models for auth routes"""
    global user_model, stats_model, progress_model
    user_model = User(db)
    stats_model = Stats(db)
    progress_model = Progress(db)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        username = data['username']
        email = data['email']
        password = data['password']
        
        # Create user
        user = user_model.create_user(username, email, password)
        
        if not user:
            return jsonify({'error': 'Username or email already exists'}), 409
        
        # Create initial stats
        stats_model.create_stats(user['_id'])
        
        # Grant beginner title
        progress_model.check_and_grant_titles(user['_id'], 1, {}, 0)
        
        # Create access token
        access_token = create_access_token(identity=user['_id'])
        
        return jsonify({
            'message': 'User registered successfully',
            'access_token': access_token,
            'user': {
                'id': user['_id'],
                'username': user['username'],
                'email': user['email'],
                'level': user['level']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Missing username or password'}), 400
        
        username = data['username']
        password = data['password']
        
        # Verify credentials
        user = user_model.verify_password(username, password)
        
        if not user:
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=user['_id'])
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user['_id'],
                'username': user['username'],
                'email': user['email'],
                'level': user['level'],
                'exp': user['exp'],
                'exp_required': user['exp_required']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify():
    """Verify JWT token"""
    try:
        user_id = get_jwt_identity()
        user = user_model.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'valid': True,
            'user': {
                'id': user['_id'],
                'username': user['username'],
                'level': user['level']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
