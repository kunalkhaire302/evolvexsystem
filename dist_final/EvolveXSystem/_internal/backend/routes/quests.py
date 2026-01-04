"""
Quest Routes
Handles quest management and completion
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.stats import Stats
from models.quest import Quest
from models.progress import Progress
from config import Config

quest_bp = Blueprint('quest', __name__)

# These will be initialized in app.py
user_model = None
stats_model = None
quest_model = None
progress_model = None

def init_quest_routes(db):
    """Initialize models for quest routes"""
    global user_model, stats_model, quest_model, progress_model
    user_model = User(db)
    stats_model = Stats(db)
    quest_model = Quest(db)
    progress_model = Progress(db)

@quest_bp.route('/available', methods=['GET'])
@jwt_required()
def get_available_quests():
    """Get available quests based on adaptive AI logic"""
    try:
        user_id = get_jwt_identity()
        
        # Get user data
        user = user_model.get_user_by_id(user_id)
        stats = stats_model.get_stats(user_id)
        
        if not user or not stats:
            return jsonify({'error': 'User not found'}), 404
        
        # Get quests using adaptive AI
        quests = quest_model.get_available_quests(
            user_id,
            user['level'],
            stats['stamina']
        )
        
        return jsonify({
            'quests': quests,
            'user_stamina': stats['stamina'],
            'user_level': user['level']
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quest_bp.route('/complete', methods=['POST'])
@jwt_required()
def complete_quest():
    """Complete a quest and apply rewards"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data or not data.get('quest_id'):
            return jsonify({'error': 'Quest ID required'}), 400
        
        quest_id = data['quest_id']
        
        # Get quest details
        templates = quest_model.get_quest_templates()
        quest = next((q for q in templates if q['quest_id'] == quest_id), None)
        
        if not quest:
            return jsonify({'error': 'Quest not found'}), 404
        
        # Get user stats
        stats = stats_model.get_stats(user_id)
        
        # Check stamina
        if stats['stamina'] < quest['stamina_cost']:
            return jsonify({'error': 'Not enough stamina'}), 400
        
        # Consume stamina
        stats_model.consume_stamina(user_id, quest['stamina_cost'])
        
        # Apply stat rewards
        if quest.get('stat_rewards'):
            stats_model.increase_stats(user_id, quest['stat_rewards'])
        
        # Add EXP and check for level-up
        user = user_model.get_user_by_id(user_id)
        old_level = user['level']
        level_result = user_model.add_exp(user_id, quest['exp_reward'])
        
        # Mark quest as completed
        quest_model.complete_quest(user_id, quest_id)
        
        # Log progress
        progress_model.log_quest_completion(
            user_id,
            quest_id,
            quest['exp_reward'],
            quest.get('stat_rewards', {})
        )
        
        # Check for new titles
        user = user_model.get_user_by_id(user_id)
        stats = stats_model.get_stats(user_id)
        quest_history = quest_model.get_quest_history(user_id, limit=1000)
        
        new_titles = progress_model.check_and_grant_titles(
            user_id,
            user['level'],
            stats,
            len(quest_history)
        )
        
        # Apply level-up bonuses if leveled up
        if level_result['leveled_up']:
            stats_model.level_up_stats(user_id, Config.LEVEL_UP_STATS)
            progress_model.log_level_up(
                user_id,
                old_level,
                level_result['new_level'],
                Config.LEVEL_UP_STATS
            )
        
        # Get updated user and stats
        user = user_model.get_user_by_id(user_id)
        stats = stats_model.get_stats(user_id)
        
        return jsonify({
            'message': 'Quest completed successfully',
            'exp_gained': quest['exp_reward'],
            'leveled_up': level_result['leveled_up'],
            'new_level': level_result.get('new_level'),
            'new_titles': [t['name'] for t in new_titles],
            'user': {
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
                'health': stats['health']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@quest_bp.route('/history', methods=['GET'])
@jwt_required()
def get_quest_history():
    """Get quest completion history"""
    try:
        user_id = get_jwt_identity()
        
        history = quest_model.get_quest_history(user_id)
        
        return jsonify({'history': history}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
