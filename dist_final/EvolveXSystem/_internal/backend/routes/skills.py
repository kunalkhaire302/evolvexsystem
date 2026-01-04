"""
Skill Routes
Handles skill management and progression
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.skill import Skill
from models.progress import Progress

skill_bp = Blueprint('skill', __name__)

# These will be initialized in app.py
user_model = None
skill_model = None
progress_model = None

def init_skill_routes(db):
    """Initialize models for skill routes"""
    global user_model, skill_model, progress_model
    user_model = User(db)
    skill_model = Skill(db)
    progress_model = Progress(db)

@skill_bp.route('/', methods=['GET'])
@jwt_required()
def get_skills():
    """Get all user skills"""
    try:
        user_id = get_jwt_identity()
        
        # Get user skills
        user_skills = skill_model.get_user_skills(user_id)
        
        # Get available skill templates
        templates = skill_model.get_skill_templates()
        
        return jsonify({
            'user_skills': user_skills,
            'available_skills': templates
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@skill_bp.route('/unlock', methods=['POST'])
@jwt_required()
def unlock_skill():
    """Unlock a new skill using skill points"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('skill_id'):
            return jsonify({'error': 'Skill ID required'}), 400
        
        skill_id = data['skill_id']
        
        # Get skill template
        templates = skill_model.get_skill_templates()
        skill_template = next((s for s in templates if s['skill_id'] == skill_id), None)
        
        if not skill_template:
            return jsonify({'error': 'Skill not found'}), 404
        
        # Check if user has enough skill points
        user = user_model.get_user_by_id(user_id)
        if user['skill_points'] < skill_template['unlock_cost']:
            return jsonify({'error': 'Not enough skill points'}), 400
        
        # Unlock skill
        result = skill_model.unlock_skill(user_id, skill_id)
        
        if not result['success']:
            return jsonify({'error': result['message']}), 400
        
        # Deduct skill points
        user_model.update_user(
            user_id,
            {'skill_points': user['skill_points'] - skill_template['unlock_cost']}
        )
        
        # Log progress
        progress_model.log_skill_unlock(user_id, skill_id, skill_template['name'])
        
        # Get updated user
        user = user_model.get_user_by_id(user_id)
        
        return jsonify({
            'message': 'Skill unlocked successfully',
            'skill_id': skill_id,
            'skill_name': skill_template['name'],
            'remaining_skill_points': user['skill_points']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@skill_bp.route('/levelup', methods=['POST'])
@jwt_required()
def level_up_skill():
    """Level up a skill"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('skill_id'):
            return jsonify({'error': 'Skill ID required'}), 400
        
        skill_id = data['skill_id']
        
        # Level up skill
        result = skill_model.level_up_skill(user_id, skill_id)
        
        if not result['success']:
            return jsonify({'error': result['message']}), 400
        
        return jsonify({
            'message': 'Skill leveled up successfully',
            'new_level': result['new_level']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@skill_bp.route('/use', methods=['POST'])
@jwt_required()
def use_skill():
    """Use a skill and gain skill EXP"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('skill_id'):
            return jsonify({'error': 'Skill ID required'}), 400
        
        skill_id = data['skill_id']
        
        # Add skill EXP
        exp_gained = 10  # Base EXP for using a skill
        success = skill_model.add_skill_exp(user_id, skill_id, exp_gained)
        
        if not success:
            return jsonify({'error': 'Skill not found'}), 404
        
        # Get updated skill
        user_skills = skill_model.get_user_skills(user_id)
        skill = next((s for s in user_skills if s['skill_id'] == skill_id), None)
        
        return jsonify({
            'message': 'Skill used successfully',
            'skill': skill
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
