"""
Vercel Serverless Entrypoint
Imports the Flask app from backend/simple_app.py
"""
import sys
import os

# Get the absolute path to the project root and backend directory
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')

# Add backend to the FRONT of sys.path so 'from system_logic import ...' works
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Also add root dir
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Now import the Flask app
from simple_app import app

# Vercel expects the variable to be named 'app'
