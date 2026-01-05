#!/bin/bash

# JournalApp Setup Script
# This script installs all required dependencies and sets up the environment

set -e  # Exit on error

echo "🚀 Starting JournalApp Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}📦 Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js 18+ is recommended. Current version: $(node -v)${NC}"
else
    echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
fi
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    if [ -f env.template ]; then
        cp env.template .env
        echo -e "${GREEN}✅ .env file created from env.template. Please update it with your API keys.${NC}"
    elif [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created from .env.example. Please update it with your API keys.${NC}"
    else
        echo -e "${YELLOW}⚠️  Template not found. Creating basic .env file...${NC}"
        touch .env
    fi
    echo ""
else
    echo -e "${GREEN}✅ .env file found${NC}"
    echo ""
fi

# Install npm dependencies
echo -e "${BLUE}📦 Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✅ npm dependencies installed${NC}"
echo ""

# Install iOS dependencies (CocoaPods)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "ios" ]; then
        echo -e "${BLUE}🍎 Installing iOS dependencies (CocoaPods)...${NC}"
        cd ios
        if command -v pod &> /dev/null; then
            pod install
            echo -e "${GREEN}✅ iOS dependencies installed${NC}"
        else
            echo -e "${YELLOW}⚠️  CocoaPods not found. Install it with: sudo gem install cocoapods${NC}"
        fi
        cd ..
        echo ""
    else
        echo -e "${YELLOW}⚠️  iOS directory not found. Run 'npx react-native init' first or create manually.${NC}"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  Not on macOS. Skipping iOS dependencies.${NC}"
    echo ""
fi

# Check for required tools
echo -e "${BLUE}🔍 Checking for required tools...${NC}"

# Check CocoaPods (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v pod &> /dev/null; then
        echo -e "${GREEN}✅ CocoaPods installed: $(pod --version)${NC}"
    else
        echo -e "${YELLOW}⚠️  CocoaPods not installed. Install with: sudo gem install cocoapods${NC}"
    fi
fi

# Check Xcode (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v xcodebuild &> /dev/null; then
        echo -e "${GREEN}✅ Xcode installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Xcode not found. Install from Mac App Store.${NC}"
    fi
fi

# Check Android Studio
if command -v adb &> /dev/null; then
    echo -e "${GREEN}✅ Android SDK found${NC}"
else
    echo -e "${YELLOW}⚠️  Android SDK not found. Install Android Studio.${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Update .env file with your API keys:"
echo "   - Notion API: https://www.notion.so/my-integrations"
echo "   - Google Calendar: https://console.cloud.google.com/"
echo ""
echo "2. For iOS development:"
echo "   - Open ios/JournalApp.xcworkspace in Xcode"
echo "   - Configure signing & capabilities"
echo ""
echo "3. For Android development:"
echo "   - Open android/ in Android Studio"
echo "   - Configure signing"
echo ""
echo "4. Start Metro bundler:"
echo "   npm start"
echo ""
echo "5. Run on iOS:"
echo "   npm run ios"
echo ""
echo "6. Run on Android:"
echo "   npm run android"
echo ""

