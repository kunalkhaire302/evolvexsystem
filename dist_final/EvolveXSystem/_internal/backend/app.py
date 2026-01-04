"""
THE SYSTEM - Main Flask Application
AI-Driven Adaptive Leveling & Skill Progression Platform
"""

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from config import Config

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Initialize CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Initialize JWT
jwt = JWTManager(app)

# Initialize MongoDB
try:
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
    # Test connection
    client.server_info()
    db = client.get_database('the_system')
    print("✅ Connected to MongoDB successfully!")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    print(f"⚠️  Error details: {type(e).__name__}")
    print("⚠️  Make sure MongoDB is running or update MONGO_URI in .env file")
    db = None

# Import and register blueprints
from routes.auth import auth_bp, init_auth_routes
from routes.user import user_bp, init_user_routes
from routes.quests import quest_bp, init_quest_routes
from routes.skills import skill_bp, init_skill_routes
from routes.progress import progress_bp, init_progress_routes

# Initialize route models
if db is not None:
    init_auth_routes(db)
    init_user_routes(db)
    init_quest_routes(db)
    init_skill_routes(db)
    init_progress_routes(db)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(quest_bp, url_prefix='/api/quests')
app.register_blueprint(skill_bp, url_prefix='/api/skills')
app.register_blueprint(progress_bp, url_prefix='/api/progress')

# Root endpoint
@app.route('/')
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'THE SYSTEM - AI-Driven Adaptive Leveling Platform',
        'version': '1.0.0',
        'status': 'online',
        'endpoints': {
            'auth': '/api/auth',
            'user': '/api/user',
            'quests': '/api/quests',
            'skills': '/api/skills',
            'progress': '/api/progress'
        }
    })

# Health check endpoint
@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    mongo_status = 'connected' if db is not None else 'disconnected'
    return jsonify({
        'status': 'healthy',
        'database': mongo_status
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    """Handle expired JWT tokens"""
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    """Handle invalid JWT tokens"""
    return jsonify({'error': 'Invalid token'}), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    """Handle missing JWT tokens"""
    return jsonify({'error': 'Authorization token required'}), 401

# Run the application
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎮 THE SYSTEM - AI-Driven Adaptive Leveling Platform")
    print("="*60)
    print(f"🌐 Server running on: http://127.0.0.1:5000")
    print(f"📊 Database: {'Connected ✅' if db else 'Disconnected ❌'}")
    print("="*60 + "\n")
    
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000)
