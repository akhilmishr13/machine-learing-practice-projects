#!/bin/bash

# Master Installation Script for JournalApp
# This script handles complete setup: React Native initialization, dependencies, and configuration

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║    JournalApp - Complete Setup         ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check Node.js
echo -e "${BLUE}📦 Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/${NC}"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js 18+ recommended. Current: $(node -v)${NC}"
else
    echo -e "${GREEN}✅ Node.js: $(node -v)${NC}"
fi
echo ""

# Check if React Native is initialized
if [ ! -f "package.json" ] || [ ! -d "ios" ] || [ ! -d "android" ]; then
    echo -e "${YELLOW}⚠️  React Native project not fully initialized.${NC}"
    echo -e "${BLUE}📦 Initializing React Native project...${NC}"
    
    # Check if we're in the right directory
    CURRENT_DIR=$(basename "$PWD")
    if [ "$CURRENT_DIR" != "JournalApp" ]; then
        echo -e "${YELLOW}⚠️  Current directory: $CURRENT_DIR${NC}"
        read -p "Initialize React Native here? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # Initialize React Native (this will create ios/ and android/ directories)
    echo -e "${BLUE}Running: npx @react-native-community/cli@latest init...${NC}"
    echo -e "${YELLOW}Note: If this fails, you may need to run React Native init manually${NC}"
    echo ""
    
    # Create a temporary directory name
    TEMP_NAME="JournalApp_temp_$(date +%s)"
    
    # Try to initialize in parent directory
    cd ..
    if npx @react-native-community/cli@latest init "$TEMP_NAME" --skip-install --directory "$TEMP_NAME" 2>/dev/null; then
        # Move files to JournalApp directory
        if [ -d "JournalApp" ]; then
            # Copy essential React Native files
            cp -r "$TEMP_NAME/ios" "JournalApp/" 2>/dev/null || true
            cp -r "$TEMP_NAME/android" "JournalApp/" 2>/dev/null || true
            cp "$TEMP_NAME/.gitignore" "JournalApp/.gitignore.rn" 2>/dev/null || true
            rm -rf "$TEMP_NAME"
        fi
        cd JournalApp
    else
        echo -e "${RED}❌ Failed to auto-initialize React Native${NC}"
        echo -e "${YELLOW}Please run manually:${NC}"
        echo "  cd .."
        echo "  npx @react-native-community/cli@latest init JournalApp"
        echo "  cd JournalApp"
        exit 1
    fi
fi

# Setup .env file
echo -e "${BLUE}🔧 Setting up .env file...${NC}"
if [ ! -f .env ]; then
    if [ -f env.template ]; then
        cp env.template .env
        echo -e "${GREEN}✅ .env created from env.template${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANT: Update .env with your API keys!${NC}"
    else
        cat > .env << 'EOF'
# Notion API Configuration
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Google Calendar API Configuration
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=com.journalapp:/oauth2callback

# App Configuration
APP_NAME=JournalApp
APP_BUNDLE_ID=com.journalapp
EOF
        echo -e "${GREEN}✅ .env file created${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANT: Update .env with your API keys!${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Install npm dependencies
echo -e "${BLUE}📦 Installing npm dependencies (this may take a while)...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Install iOS dependencies (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [ -d "ios" ]; then
        echo -e "${BLUE}🍎 Installing iOS dependencies (CocoaPods)...${NC}"
        if command -v pod &> /dev/null; then
            cd ios
            pod install
            cd ..
            echo -e "${GREEN}✅ iOS dependencies installed${NC}"
        else
            echo -e "${YELLOW}⚠️  CocoaPods not found${NC}"
            echo -e "${YELLOW}   Install with: sudo gem install cocoapods${NC}"
            echo -e "${YELLOW}   Then run: cd ios && pod install && cd ..${NC}"
        fi
        echo ""
    fi
fi

# Check tools
echo -e "${BLUE}🔍 Checking development tools...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    if command -v pod &> /dev/null; then
        echo -e "${GREEN}✅ CocoaPods: $(pod --version)${NC}"
    else
        echo -e "${YELLOW}⚠️  CocoaPods: Not installed${NC}"
    fi
    
    if command -v xcodebuild &> /dev/null; then
        echo -e "${GREEN}✅ Xcode: Installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Xcode: Not found${NC}"
    fi
fi

if command -v adb &> /dev/null; then
    echo -e "${GREEN}✅ Android SDK: Found${NC}"
else
    echo -e "${YELLOW}⚠️  Android SDK: Not found${NC}"
fi
echo ""

# Success message
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    ✅ Setup Complete!                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Update .env file with your API keys:${NC}"
echo "   - Notion: https://www.notion.so/my-integrations"
echo "   - Google Calendar: https://console.cloud.google.com/"
echo ""
echo "2. ${YELLOW}For iOS (macOS only):${NC}"
echo "   - Open ios/JournalApp.xcworkspace in Xcode"
echo "   - Configure signing & capabilities"
echo "   - Run: npm run ios"
echo ""
echo "3. ${YELLOW}For Android:${NC}"
echo "   - Open android/ in Android Studio"
echo "   - Configure signing"
echo "   - Run: npm run android"
echo ""
echo "4. ${YELLOW}Start development:${NC}"
echo "   - Start Metro: npm start"
echo "   - Run app: npm run ios (or android)"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"


