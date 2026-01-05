#!/bin/bash

# iOS Setup Script for JournalApp
# This script helps set up iOS development environment

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║    iOS Setup for JournalApp            ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}\n"

# Check if Xcode is installed
if [ ! -d "/Applications/Xcode.app" ]; then
    echo -e "${RED}❌ Xcode is not installed${NC}"
    echo -e "${YELLOW}Please install Xcode from the Mac App Store first:${NC}"
    echo "  1. Open Mac App Store"
    echo "  2. Search for 'Xcode'"
    echo "  3. Install (free, ~12GB, takes 30-60 min)"
    echo "  4. Open Xcode once to accept license"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ Xcode.app found${NC}"

# Check Xcode command line tools
XCODE_PATH=$(xcode-select -p 2>/dev/null || echo "")
if [ -z "$XCODE_PATH" ] || [[ "$XCODE_PATH" != *"Xcode.app"* ]]; then
    echo -e "${YELLOW}⚠️  Configuring Xcode command line tools...${NC}"
    sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
    echo -e "${GREEN}✅ Xcode command line tools configured${NC}"
else
    echo -e "${GREEN}✅ Xcode command line tools configured${NC}"
fi

# Check CocoaPods
if ! command -v pod &> /dev/null; then
    echo -e "${YELLOW}⚠️  CocoaPods not found. Installing...${NC}"
    
    # Try with sudo gem first
    if sudo gem install cocoapods 2>/dev/null; then
        echo -e "${GREEN}✅ CocoaPods installed${NC}"
    else
        echo -e "${YELLOW}Trying alternative installation method...${NC}"
        # Try with Homebrew if available
        if command -v brew &> /dev/null; then
            brew install cocoapods
            echo -e "${GREEN}✅ CocoaPods installed via Homebrew${NC}"
        else
            echo -e "${RED}❌ Failed to install CocoaPods${NC}"
            echo "Please install manually: sudo gem install cocoapods"
            exit 1
        fi
    fi
else
    POD_VERSION=$(pod --version)
    echo -e "${GREEN}✅ CocoaPods installed (version: $POD_VERSION)${NC}"
fi

# Navigate to iOS directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

if [ ! -d "ios" ]; then
    echo -e "${RED}❌ ios directory not found${NC}"
    echo "Please run this script from the JournalApp directory"
    exit 1
fi

# Install pods
echo -e "${BLUE}📦 Installing iOS dependencies (this may take 5-10 minutes)...${NC}"
cd ios

if [ -f "Podfile" ]; then
    pod install
    echo -e "${GREEN}✅ iOS dependencies installed${NC}"
else
    echo -e "${RED}❌ Podfile not found${NC}"
    exit 1
fi

cd ..

# Check if simulator is available
echo -e "${BLUE}📱 Checking iOS Simulator...${NC}"
if xcrun simctl list devices available &>/dev/null; then
    echo -e "${GREEN}✅ iOS Simulator available${NC}"
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║    ✅ iOS Setup Complete!              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📝 Next Steps:${NC}"
    echo "  1. Open iOS Simulator:"
    echo "     open -a Simulator"
    echo ""
    echo "  2. Run the app:"
    echo "     npm run ios"
    echo ""
    echo "  3. Or specify a device:"
    echo "     npm run ios -- --simulator=\"iPhone 15 Pro\""
else
    echo -e "${YELLOW}⚠️  Could not list simulators${NC}"
    echo "You may need to open Xcode first to initialize simulators"
fi


