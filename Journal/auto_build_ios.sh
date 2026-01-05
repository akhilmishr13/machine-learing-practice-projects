#!/bin/bash
# Auto-build iOS app once simulator runtime is available

echo "🚀 JournalApp - Auto iOS Build"
echo "================================"
echo ""

PROJECT_DIR="$(cd "$(dirname "$0")/JournalApp" && pwd)"
MAX_WAIT=300  # 5 minutes max wait
CHECK_INTERVAL=5
ELAPSED=0

echo "📱 Waiting for iOS Simulator runtime to be installed..."
echo "   (This script will automatically build once runtime is available)"
echo ""

# Function to check if simulator is available
check_simulator() {
    xcrun simctl list devices available 2>/dev/null | grep -q iPhone
}

# Wait for simulator runtime
while [ $ELAPSED -lt $MAX_WAIT ]; do
    if check_simulator; then
        echo ""
        echo "✅ Simulator runtime found! Starting build..."
        echo ""
        break
    fi
    
    # Show progress
    PROGRESS=$((ELAPSED * 100 / MAX_WAIT))
    printf "\r⏳ Waiting... (%d%%) - Check Xcode → Settings → Platforms" "$PROGRESS"
    
    sleep $CHECK_INTERVAL
    ELAPSED=$((ELAPSED + CHECK_INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    echo ""
    echo "⏱️  Timeout waiting for simulator runtime"
    echo "   Please install it manually in Xcode → Settings → Platforms"
    exit 1
fi

# Build and run
cd "$PROJECT_DIR" || exit 1

echo ""
echo "🔨 Building iOS app..."
echo ""

# Run the build
npm run ios

echo ""
echo "✅ Build complete!"

