#!/bin/bash

# Setup and run iOS app
# This script handles the setup and launch

set -e

export LANG=en_US.UTF-8

echo "🔧 Setting up iOS environment..."

# Check if xcode-select is configured
if ! xcode-select -p 2>/dev/null | grep -q "Xcode.app"; then
    echo "⚠️  Configuring Xcode command line tools (requires password)..."
    sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
    echo "✅ Xcode configured"
else
    echo "✅ Xcode already configured"
fi

# Install pods if needed
if [ ! -d "ios/Pods" ]; then
    echo "📦 Installing iOS dependencies..."
    cd ios
    export LANG=en_US.UTF-8
    pod install
    cd ..
    echo "✅ Dependencies installed"
else
    echo "✅ iOS dependencies already installed"
fi

# Open simulator
echo "📱 Opening iOS Simulator..."
open -a Simulator

# Wait a bit for simulator
sleep 3

# Run the app
echo "🚀 Launching app..."
npm run ios

