"""
Vercel Serverless Entrypoint
This file imports the Flask app from backend/simple_app.py
so Vercel can find and serve it.
"""
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from simple_app import app

# Vercel expects the app variable to be named 'app'
