"""
User Routes
Handles user profile and stats management
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.stats import Stats
from models.progress import Progress

user_bp = Blueprint('user', __name__)

# These will be initialized in app.py
user_model = None
stats_model = None
progress_model = None

def init_user_routes(db):
    """Initialize models for user routes"""
    global user_model, stats_model, progress_model
    user_model = User(db)
    stats_model = Stats(db)
    progress_model = Progress(db)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile with stats"""
    try:
        user_id = get_jwt_identity()
        
        # Get user data
        user = user_model.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get stats
        stats = stats_model.get_stats(user_id)
        
        # Get titles
        titles = progress_model.get_user_titles(user_id)
        
        return jsonify({
            'user': {
                'id': user['_id'],
                'username': user['username'],
                'email': user['email'],
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
            'titles': titles
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/stats', methods=['PUT'])
@jwt_required()
def update_stats():
    """Update user stats (admin/debug endpoint)"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update stats
        success = stats_model.update_stats(user_id, data)
        
        if success:
            return jsonify({'message': 'Stats updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update stats'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/titles', methods=['GET'])
@jwt_required()
def get_titles():
    """Get user achievements and titles"""
    try:
        user_id = get_jwt_identity()
        
        # Get all titles
        titles = progress_model.get_user_titles(user_id)
        
        # Get available titles
        templates = progress_model.get_title_templates()
        
        return jsonify({
            'earned_titles': titles,
            'available_titles': templates
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/restore-stamina', methods=['POST'])
@jwt_required()
def restore_stamina():
    """Restore stamina (rest action)"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        amount = data.get('amount', 20)  # Default restore 20 stamina
        
        success = stats_model.restore_stamina(user_id, amount)
        
        if success:
            stats = stats_model.get_stats(user_id)
            return jsonify({
                'message': 'Stamina restored',
                'stamina': stats['stamina']
            }), 200
        else:
            return jsonify({'error': 'Failed to restore stamina'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
