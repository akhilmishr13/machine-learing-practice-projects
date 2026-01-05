#!/bin/bash
# Script to run iOS app in Xcode Simulator

echo "🚀 JournalApp - iOS Build & Run Script"
echo "========================================"
echo ""

# Check if simulator runtime is available
echo "📱 Checking for iOS Simulator runtime..."
if xcrun simctl list devices available | grep -q iPhone; then
    echo "✅ Simulator runtime found!"
else
    echo "❌ No iOS Simulator runtime found."
    echo ""
    echo "📥 Please install iOS Simulator runtime:"
    echo "   1. Xcode should be open (if not, it will open now)"
    echo "   2. Go to: Xcode → Settings → Platforms (or Components)"
    echo "   3. Download: iOS 26.2 Simulator (or latest available)"
    echo "   4. Wait for download to complete"
    echo "   5. Then run this script again"
    echo ""
    open -a Xcode
    read -p "Press Enter after you've installed the simulator runtime..."
fi

# Navigate to app directory
cd "$(dirname "$0")/JournalApp" || exit 1

echo ""
echo "🔨 Building and running iOS app..."
echo ""

# Try to run the app
npm run ios

echo ""
echo "✅ Done! The app should be launching in the simulator."

