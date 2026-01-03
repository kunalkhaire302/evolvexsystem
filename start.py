"""
THE SYSTEM - Unified Startup Script (Cross-Platform)
Starts both backend and frontend servers with a single command
"""

import subprocess
import sys
import time
import webbrowser
import os
from pathlib import Path

def print_banner():
    """Print startup banner"""
    print("\n" + "="*60)
    print("  THE SYSTEM - AI-Driven Adaptive Leveling Platform")
    print("="*60 + "\n")


def start_backend():
    """Start the Flask backend server (which also serves frontend)"""
    print("[1/2] Starting Unified Server (simple_app.py)...")
    backend_dir = Path(__file__).parent / "backend"
    
    if sys.platform == "win32":
        backend_process = subprocess.Popen(
            ["python", "simple_app.py"],
            cwd=backend_dir,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
    else:
        backend_process = subprocess.Popen(
            ["python3", "simple_app.py"],
            cwd=backend_dir
        )
    
    return backend_process

def open_browser():
    """Open browser to app"""
    print("[2/2] Opening browser...")
    time.sleep(5) # Give Flask a moment to start
    webbrowser.open("http://localhost:5000")

def main():
    """Main startup function"""
    print_banner()
    
    try:
        # Start server
        backend_process = start_backend()
        
        # Print success message
        print("\n" + "="*60)
        print("  SERVER STARTED SUCCESSFULLY!")
        print("="*60)
        print("  App URL: http://localhost:5000")
        print("="*60 + "\n")
        
        # Open browser
        open_browser()
        
        print("\nPress Ctrl+C to stop server...\n")
        
        # Keep script running
        try:
            backend_process.wait()
        except KeyboardInterrupt:
            print("\n\nStopping server...")
            backend_process.terminate()
            print("Server stopped. Goodbye!\n")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Make sure all dependencies are installed:")
        print("  cd backend")
        print("  pip install -r requirements.txt")
        sys.exit(1)

if __name__ == "__main__":
    main()
