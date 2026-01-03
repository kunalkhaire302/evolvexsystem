#!/usr/bin/env python
"""Test script to identify the exact error"""

import traceback
import sys

try:
    print("Testing imports...")
    from flask import Flask
    print("✓ Flask imported")
    
    from pymongo import MongoClient
    print("✓ PyMongo imported")
    
    from dotenv import load_dotenv
    load_dotenv()
    print("✓ dotenv loaded")
    
    from config import Config
    print("✓ Config imported")
    print(f"  MONGO_URI: {Config.MONGO_URI[:40]}...")
    
    # Test MongoDB connection
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    db = client.get_database('the_system')
    print(f"✓ MongoDB connected: {db.name}")
    
    # Test Flask app creation
    app = Flask(__name__)
    app.config.from_object(Config)
    print("✓ Flask app created")
    
    # Test importing routes
    print("\nTesting route imports...")
    from routes.auth import auth_bp
    print("✓ auth routes")
    from routes.user import user_bp
    print("✓ user routes")
    from routes.quests import quest_bp
    print("✓ quest routes")
    from routes.skills import skill_bp
    print("✓ skill routes")
    from routes.progress import progress_bp
    print("✓ progress routes")
    
    print("\n✅ All tests passed! The app should work.")
    
except Exception as e:
    print(f"\n❌ Error occurred:")
    print(f"Type: {type(e).__name__}")
    print(f"Message: {str(e)}")
    print("\nFull traceback:")
    traceback.print_exc()
    sys.exit(1)
