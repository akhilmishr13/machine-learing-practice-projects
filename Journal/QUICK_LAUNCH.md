# 🚀 Quick Launch Instructions

## ⚠️ REQUIRED FIRST STEP (Run in Terminal)

This command requires your password:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Enter your password when prompted.

## Then Launch the App

### Option 1: Automated Script
```bash
cd JournalApp
./run-ios-setup.sh
```

### Option 2: Manual Steps
```bash
cd JournalApp

# Install iOS dependencies (if not done)
cd ios
export LANG=en_US.UTF-8
pod install
cd ..

# Open simulator
open -a Simulator

# Wait a few seconds, then run
npm run ios
```

## What's Fixed

- ✅ react-native-reanimated downgraded to compatible version
- ✅ CocoaPods installed
- ✅ Setup scripts created
- ⏳ Waiting for Xcode configuration (requires sudo)

