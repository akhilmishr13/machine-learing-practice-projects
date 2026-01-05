#!/bin/bash

# Install CocoaPods and iOS dependencies
# This script helps install CocoaPods and set up iOS development

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║    Installing CocoaPods & Dependencies ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check for CocoaPods
if command -v pod &> /dev/null; then
    POD_VERSION=$(pod --version)
    echo -e "${GREEN}✅ CocoaPods already installed (version: $POD_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠️  CocoaPods not found. Attempting installation...${NC}"
    
    # Try Homebrew first (no sudo needed)
    if command -v brew &> /dev/null; then
        echo -e "${BLUE}📦 Installing via Homebrew...${NC}"
        brew install cocoapods
        echo -e "${GREEN}✅ CocoaPods installed via Homebrew${NC}"
    else
        echo -e "${YELLOW}Cannot install CocoaPods automatically.${NC}"
        echo -e "${YELLOW}Please run one of these commands:${NC}"
        echo "  sudo gem install cocoapods"
        echo "  OR"
        echo "  brew install cocoapods  (if you have Homebrew)"
        exit 1
    fi
fi

# Check if Xcode is installed
if [ ! -d "/Applications/Xcode.app" ]; then
    echo -e "${RED}❌ Xcode is not installed${NC}"
    echo -e "${YELLOW}Please install Xcode from the Mac App Store first:${NC}"
    echo "  1. Open Mac App Store"
    echo "  2. Search for 'Xcode'"
    echo "  3. Install (free, ~12GB)"
    echo "  4. Open Xcode once to accept license"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ Xcode.app found${NC}"

# Configure Xcode command line tools
XCODE_PATH=$(xcode-select -p 2>/dev/null || echo "")
if [ -z "$XCODE_PATH" ] || [[ "$XCODE_PATH" != *"Xcode.app"* ]]; then
    echo -e "${YELLOW}⚠️  Configuring Xcode command line tools...${NC}"
    sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
    echo -e "${GREEN}✅ Xcode command line tools configured${NC}"
else
    echo -e "${GREEN}✅ Xcode command line tools configured${NC}"
fi

# Navigate to project directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Install iOS dependencies
if [ -d "ios" ] && [ -f "ios/Podfile" ]; then
    echo -e "${BLUE}📦 Installing iOS dependencies (this may take 5-10 minutes)...${NC}"
    cd ios
    pod install
    cd ..
    echo -e "${GREEN}✅ iOS dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  ios directory or Podfile not found${NC}"
    echo "Skipping pod install..."
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    ✅ Installation Complete!            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "  1. Open iOS Simulator:"
echo "     open -a Simulator"
echo ""
echo "  2. Run the app:"
echo "     npm run ios"
echo ""


