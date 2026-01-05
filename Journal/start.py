#!/usr/bin/env python3
"""
JournalApp - Start Script (Python)
Starts both backend and frontend servers
"""
import subprocess
import sys
import os
import signal
import time
from pathlib import Path

def cleanup(signum, frame):
    """Cleanup function for signal handling"""
    print("\n🛑 Shutting down servers...")
    sys.exit(0)

def check_and_setup_backend():
    """Check and setup backend if needed"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir / "backend"
    venv_dir = backend_dir / "venv"
    
    if not venv_dir.exists():
        print("⚠️  Backend virtual environment not found")
        print("📦 Setting up backend...")
        
        # Create venv
        subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], check=True)
        
        # Install dependencies
        pip = venv_dir / "bin" / "pip"
        if sys.platform == "win32":
            pip = venv_dir / "Scripts" / "pip.exe"
        
        subprocess.run([str(pip), "install", "-r", str(backend_dir / "requirements.txt")], check=True)
        print("✅ Backend setup complete")

def check_and_setup_frontend():
    """Check and setup frontend if needed"""
    script_dir = Path(__file__).parent
    frontend_dir = script_dir / "JournalApp"
    node_modules = frontend_dir / "node_modules"
    
    if not node_modules.exists():
        print("⚠️  Frontend dependencies not installed")
        print("📦 Installing frontend dependencies...")
        subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
        print("✅ Frontend setup complete")

def start_backend():
    """Start backend server"""
    script_dir = Path(__file__).parent
    backend_dir = script_dir / "backend"
    venv_python = backend_dir / "venv" / "bin" / "python"
    
    if sys.platform == "win32":
        venv_python = backend_dir / "venv" / "Scripts" / "python.exe"
    
    print("🚀 Starting Backend Server...")
    process = subprocess.Popen(
        [str(venv_python), "-m", "app.main"],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    
    print("✅ Backend started (PID: {})".format(process.pid))
    print("   📍 API: http://localhost:8000")
    print("   📚 Docs: http://localhost:8000/docs\n")
    
    return process

def start_frontend():
    """Start frontend Metro bundler"""
    script_dir = Path(__file__).parent
    frontend_dir = script_dir / "JournalApp"
    
    print("🚀 Starting Frontend (Metro Bundler)...")
    process = subprocess.Popen(
        ["npm", "start"],
        cwd=frontend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    
    print("✅ Frontend started (PID: {})".format(process.pid))
    print("   📱 Ready for: npm run ios (or android)\n")
    
    return process

def main():
    """Main function"""
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    
    print("\n╔════════════════════════════════════════╗")
    print("║    JournalApp - Starting Servers       ║")
    print("╚════════════════════════════════════════╝\n")
    
    # Check and setup
    check_and_setup_backend()
    check_and_setup_frontend()
    
    # Start servers
    backend_process = start_backend()
    time.sleep(3)  # Wait for backend to start
    frontend_process = start_frontend()
    
    print("╔════════════════════════════════════════╗")
    print("║    ✅ Both servers running!            ║")
    print("╚════════════════════════════════════════╝")
    print("\n📝 Next Steps:")
    print("   1. Open a new terminal")
    print("   2. Run: cd JournalApp && npm run ios")
    print("      or: cd JournalApp && npm run android")
    print("\nPress Ctrl+C to stop both servers\n")
    
    # Wait for processes
    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        cleanup(None, None)

if __name__ == "__main__":
    main()


