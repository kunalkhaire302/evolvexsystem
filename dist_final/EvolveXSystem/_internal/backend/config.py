import os
from datetime import timedelta

class Config:
    """Application configuration class"""
    
    # MongoDB Configuration
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/the_system')
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-this-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'flask-secret-key-change-this')
    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # CORS Configuration
    CORS_HEADERS = 'Content-Type'
    
    # Game Constants
    EXP_MULTIPLIER = 100  # Base EXP required = level² × 100
    
    # Stat increases per level
    LEVEL_UP_STATS = {
        'strength': 2,
        'agility': 2,
        'intelligence': 2,
        'stamina': 3,
        'health': 10
    }
    
    # Skill points granted per level
    SKILL_POINTS_PER_LEVEL = 1
    
    # Quest difficulty thresholds
    STAMINA_LOW_THRESHOLD = 30
    BEGINNER_LEVEL_THRESHOLD = 5
    
    # Quest rewards multipliers
    QUEST_REWARDS = {
        'easy': {'exp': 50, 'stat_points': 1},
        'medium': {'exp': 100, 'stat_points': 2},
        'hard': {'exp': 200, 'stat_points': 3},
        'challenge': {'exp': 500, 'stat_points': 5}
    }
    
    # Penalty multipliers
    PENALTY_EXP_LOSS = 0.1  # 10% EXP loss on failure
    PENALTY_STAT_REDUCTION = 0.05  # 5% temporary stat reduction
