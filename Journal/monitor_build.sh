#!/bin/bash
# Monitor iOS build progress

LOG_FILE="/tmp/ios_build_progress.log"
BUILD_STAGES=(
    "Starting build"
    "Installing dependencies"
    "Compiling Swift/Objective-C"
    "Building React Native bundle"
    "Linking libraries"
    "Creating app package"
    "Installing on simulator"
    "Launching app"
)

CURRENT_STAGE=0

echo "🚀 iOS Build Progress Monitor"
echo "=============================="
echo ""

while true; do
    if [ ! -f "$LOG_FILE" ]; then
        sleep 1
        continue
    fi
    
    # Read latest log entries
    LATEST=$(tail -20 "$LOG_FILE" 2>/dev/null)
    
    # Detect build stages
    if echo "$LATEST" | grep -qi "compiling\|building"; then
        CURRENT_STAGE=2
    elif echo "$LATEST" | grep -qi "linking"; then
        CURRENT_STAGE=4
    elif echo "$LATEST" | grep -qi "installing.*simulator"; then
        CURRENT_STAGE=6
    elif echo "$LATEST" | grep -qi "launching\|launched"; then
        CURRENT_STAGE=7
    fi
    
    # Show progress bar
    PROGRESS=$((CURRENT_STAGE * 100 / 7))
    FILLED=$((CURRENT_STAGE * 50 / 7))
    BAR=$(printf "%*s" $FILLED | tr ' ' '█')
    EMPTY=$(printf "%*s" $((50 - FILLED)) | tr ' ' '░')
    
    printf "\r[%s%s] %d%% - %s" "$BAR" "$EMPTY" "$PROGRESS" "${BUILD_STAGES[$CURRENT_STAGE]}"
    
    # Check if build completed
    if echo "$LATEST" | grep -qi "BUILD SUCCEEDED\|error\|failed"; then
        echo ""
        echo ""
        if echo "$LATEST" | grep -qi "BUILD SUCCEEDED"; then
            echo "✅ Build completed successfully!"
        else
            echo "❌ Build encountered an error"
        fi
        break
    fi
    
    # Check if process is still running
    if ! ps aux | grep -q "[n]pm run ios"; then
        echo ""
        echo ""
        echo "Build process completed"
        break
    fi
    
    sleep 2
done

echo ""
echo "Latest build output:"
echo "-------------------"
tail -10 "$LOG_FILE" 2>/dev/null

