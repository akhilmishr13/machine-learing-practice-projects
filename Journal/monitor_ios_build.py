#!/usr/bin/env python3
"""
Monitor iOS build progress and display a progress bar
"""
import subprocess
import sys
import time
import re
import os
from pathlib import Path

def print_progress_bar(current, total, width=50):
    """Print a progress bar"""
    if total == 0:
        percentage = 0
    else:
        percentage = min(100, int((current / total) * 100))
    filled = int(width * current / total) if total > 0 else 0
    bar = '█' * filled + '░' * (width - filled)
    return f"[{bar}] {percentage}%"

def check_simulator_available():
    """Check if any iOS simulator is available"""
    try:
        result = subprocess.run(
            ['xcrun', 'simctl', 'list', 'devices', 'available'],
            capture_output=True,
            text=True,
            timeout=10
        )
        return 'iPhone' in result.stdout
    except:
        return False

def install_simulator_runtime():
    """Try to install simulator runtime via Xcode"""
    print("📱 No iOS simulator runtime found.")
    print("🔧 Opening Xcode to install simulator runtime...")
    print("   Please follow these steps:")
    print("   1. In Xcode, go to Settings → Platforms (or Components)")
    print("   2. Download an iOS Simulator runtime (e.g., iOS 17.x or 18.x)")
    print("   3. Wait for download to complete")
    print("   4. Then run this script again")
    
    subprocess.run(['open', '-a', 'Xcode'])
    return False

def create_and_boot_simulator():
    """Create and boot a simulator"""
    print("🔍 Checking for available simulators...")
    
    # Try to list all devices and find one we can use
    result = subprocess.run(
        ['xcrun', 'simctl', 'list', 'devices'],
        capture_output=True,
        text=True
    )
    
    # Look for any iPhone device
    lines = result.stdout.split('\n')
    for line in lines:
        if 'iPhone' in line and '(Booted)' not in line:
            # Extract device ID
            match = re.search(r'\(([A-F0-9-]+)\)', line)
            if match:
                device_id = match.group(1)
                print(f"📱 Booting simulator {device_id}...")
                subprocess.run(['xcrun', 'simctl', 'boot', device_id], 
                             capture_output=True)
                time.sleep(3)
                return True
    
    return False

def monitor_build():
    """Monitor the iOS build process"""
    journal_app_dir = Path(__file__).parent / "JournalApp"
    os.chdir(journal_app_dir)
    
    print("\n" + "="*60)
    print("🚀 Starting iOS Build with Progress Monitoring")
    print("="*60 + "\n")
    
    # Check for simulator
    if not check_simulator_available():
        if not install_simulator_runtime():
            return False
    
    # Try to boot a simulator
    if not create_and_boot_simulator():
        print("⚠️  Could not boot simulator automatically")
        print("   Trying to proceed with build anyway...")
    
    # Start the build process
    print("\n📦 Starting build process...\n")
    
    build_stages = [
        "Checking dependencies",
        "Installing CocoaPods dependencies",
        "Compiling Swift/Objective-C code",
        "Building React Native bundle",
        "Linking libraries",
        "Creating app package",
        "Installing on simulator",
        "Launching app"
    ]
    
    process = subprocess.Popen(
        ['npm', 'run', 'ios'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    current_stage = 0
    build_output = []
    start_time = time.time()
    
    print("Build Output:")
    print("-" * 60)
    
    try:
        for line in process.stdout:
            line = line.rstrip()
            build_output.append(line)
            print(line)
            
            # Detect build stages
            line_lower = line.lower()
            
            if 'compiling' in line_lower or 'building' in line_lower:
                if current_stage < 2:
                    current_stage = 2
            elif 'linking' in line_lower:
                current_stage = 4
            elif 'installing' in line_lower and 'simulator' in line_lower:
                current_stage = 6
            elif 'launching' in line_lower or 'launched' in line_lower:
                current_stage = 7
            
            # Show progress
            if current_stage < len(build_stages):
                progress = print_progress_bar(
                    current_stage + 1, 
                    len(build_stages)
                )
                stage_name = build_stages[current_stage]
                print(f"\r{progress} - {stage_name}", end='', flush=True)
        
        process.wait()
        elapsed = time.time() - start_time
        
        print("\n\n" + "="*60)
        if process.returncode == 0:
            print("✅ Build completed successfully!")
            print(f"⏱️  Total time: {elapsed:.1f} seconds")
        else:
            print("❌ Build failed!")
            print(f"⏱️  Time before failure: {elapsed:.1f} seconds")
        print("="*60)
        
        return process.returncode == 0
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Build interrupted by user")
        process.terminate()
        return False

if __name__ == "__main__":
    success = monitor_build()
    sys.exit(0 if success else 1)

