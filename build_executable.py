"""
EvolveX System - Build Executable Script
Generates a standalone .exe file using PyInstaller
Run: python build_executable.py
"""

import subprocess
import sys
import os
import shutil
from pathlib import Path

def install_pyinstaller():
    """Install PyInstaller if not already installed"""
    print("📦 Checking PyInstaller installation...")
    try:
        import PyInstaller
        print("✅ PyInstaller is already installed")
    except ImportError:
        print("📥 Installing PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("✅ PyInstaller installed successfully")

def clean_build():
    """Clean previous build artifacts"""
    print("🧹 Cleaning previous builds...")
    dirs_to_clean = ['build', 'dist', '__pycache__']
    for dir_name in dirs_to_clean:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
            print(f"   Removed {dir_name}/")
    print("✅ Cleanup complete")

def create_env_template():
    """Create .env.example template file"""
    env_template = """# EvolveX System Environment Configuration
# Copy this file to .env and fill in your values

# MongoDB Connection String
# Replace <username>, <password>, and <cluster> with your MongoDB Atlas credentials
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/the_system?retryWrites=true&w=majority

# Or use local MongoDB:
# MONGO_URI=mongodb://localhost:27017/the_system

# Secret Keys (change these in production!)
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
"""
    
    with open('.env.example', 'w') as f:
        f.write(env_template)
    print("✅ Created .env.example template")

def build_executable():
    """Build the executable using PyInstaller"""
    print("\n🔨 Building executable...")
    print("   This may take a few minutes...\n")
    
    # Get the project root directory
    project_root = Path(__file__).parent.absolute()
    
    # PyInstaller command
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name=EvolveXSystem",
        "--onedir",  # Create a directory with exe and dependencies
        "--console",  # Show console window for debugging
        "--noconfirm",  # Replace output without asking
        # Add data files
        f"--add-data={project_root / 'frontend'};frontend",
        f"--add-data={project_root / 'backend'};backend",
        # Hidden imports for Flask and dependencies
        "--hidden-import=flask",
        "--hidden-import=flask_cors",
        "--hidden-import=flask_jwt_extended",
        "--hidden-import=pymongo",
        "--hidden-import=bcrypt",
        "--hidden-import=dotenv",
        "--hidden-import=werkzeug",
        "--hidden-import=werkzeug.utils",
        "--hidden-import=bson",
        "--hidden-import=bson.objectid",
        "--hidden-import=email.mime.text",
        "--hidden-import=email.mime.multipart",
        # Collect all submodules
        "--collect-all=flask",
        "--collect-all=flask_cors",
        "--collect-all=flask_jwt_extended",
        "--collect-all=pymongo",
        "--collect-all=bcrypt",
        # Entry point
        str(project_root / "start.py")
    ]
    
    try:
        subprocess.check_call(cmd)
        print("\n✅ Executable built successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Build failed: {e}")
        return False

def copy_config_files():
    """Copy necessary config files to dist folder"""
    print("\n📁 Copying configuration files...")
    dist_dir = Path("dist/EvolveXSystem")
    
    if dist_dir.exists():
        # Copy .env.example
        if os.path.exists('.env.example'):
            shutil.copy('.env.example', dist_dir / '.env.example')
            print("   Copied .env.example")
        
        # Create README for the executable
        readme_content = """# EvolveX System - Executable Version

## Quick Start

1. **Configure Database Connection:**
   - Copy `.env.example` to `.env`
   - Edit `.env` and add your MongoDB connection string

2. **Run the Application:**
   - Double-click `EvolveXSystem.exe`
   - The server will start and open your browser automatically
   - Access the app at: http://localhost:5000

3. **Stop the Application:**
   - Press Ctrl+C in the console window
   - Or close the console window

## Troubleshooting

- **"Database not connected" error:**
  Make sure your `.env` file has a valid MONGO_URI

- **Port 5000 already in use:**
  Close any other application using port 5000

- **Application won't start:**
  Run from command prompt to see error messages:
  ```
  cd path\\to\\EvolveXSystem
  EvolveXSystem.exe
  ```

## System Requirements

- Windows 10 or later
- Internet connection (for MongoDB Atlas)
- No Python installation required

---
EvolveX System - AI-Driven Adaptive Leveling Platform
"""
        
        with open(dist_dir / 'README.txt', 'w') as f:
            f.write(readme_content)
        print("   Created README.txt")
        
        print("✅ Configuration files copied")
    else:
        print("⚠️  dist/EvolveXSystem directory not found")

def create_zip_package():
    """Create a ZIP file for distribution"""
    print("\n📦 Creating distribution package...")
    dist_dir = Path("dist/EvolveXSystem")
    
    if dist_dir.exists():
        zip_name = "EvolveXSystem_Windows"
        shutil.make_archive(f"dist/{zip_name}", 'zip', "dist", "EvolveXSystem")
        print(f"✅ Created dist/{zip_name}.zip")
        return f"dist/{zip_name}.zip"
    else:
        print("⚠️  Cannot create ZIP - dist folder not found")
        return None

def main():
    """Main build process"""
    print("\n" + "="*60)
    print("  EvolveX System - Executable Builder")
    print("="*60 + "\n")
    
    # Change to script directory
    os.chdir(Path(__file__).parent)
    
    # Step 1: Install PyInstaller
    install_pyinstaller()
    
    # Step 2: Clean previous builds
    clean_build()
    
    # Step 3: Create .env template
    create_env_template()
    
    # Step 4: Build executable
    if build_executable():
        # Step 5: Copy config files
        copy_config_files()
        
        # Step 6: Create ZIP package
        zip_path = create_zip_package()
        
        # Final message
        print("\n" + "="*60)
        print("  BUILD COMPLETE!")
        print("="*60)
        print("\n📂 Output Location:")
        print("   • Executable: dist/EvolveXSystem/EvolveXSystem.exe")
        if zip_path:
            print(f"   • ZIP Package: {zip_path}")
        print("\n📝 Next Steps:")
        print("   1. Navigate to dist/EvolveXSystem/")
        print("   2. Copy .env.example to .env")
        print("   3. Edit .env with your MongoDB connection string")
        print("   4. Run EvolveXSystem.exe")
        print("\n" + "="*60 + "\n")
    else:
        print("\n❌ Build failed. Check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
