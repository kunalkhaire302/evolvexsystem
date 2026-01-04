"""
Progress Routes
Handles progress tracking and history
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.progress import Progress

progress_bp = Blueprint('progress', __name__)

# These will be initialized in app.py
progress_model = None

def init_progress_routes(db):
    """Initialize models for progress routes"""
    global progress_model
    progress_model = Progress(db)

@progress_bp.route('/history', methods=['GET'])
@jwt_required()
def get_progress_history():
    """Get user's progress history"""
    try:
        user_id = get_jwt_identity()
        
        # Get limit from query params
        limit = request.args.get('limit', 20, type=int)
        
        history = progress_model.get_progress_history(user_id, limit)
        
        return jsonify({'history': history}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@progress_bp.route('/titles', methods=['GET'])
@jwt_required()
def get_all_titles():
    """Get all available titles and user's earned titles"""
    try:
        user_id = get_jwt_identity()
        
        # Get user titles
        user_titles = progress_model.get_user_titles(user_id)
        
        # Get all title templates
        all_titles = progress_model.get_title_templates()
        
        return jsonify({
            'earned_titles': user_titles,
            'all_titles': all_titles
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
