# Quick Start Guide

Get your JournalApp running in minutes!

## 🚀 Fastest Setup (One Command)

```bash
./install-all.sh
```

This single script will:
1. ✅ Check prerequisites
2. ✅ Initialize React Native (if needed)
3. ✅ Install all npm dependencies
4. ✅ Setup environment file
5. ✅ Install iOS dependencies (macOS)
6. ✅ Verify setup

## 📋 Prerequisites Checklist

Before running setup, ensure you have:

- [ ] **Node.js 18+** - [Download](https://nodejs.org/)
- [ ] **npm** (comes with Node.js)
- [ ] **Xcode 14+** (macOS, for iOS) - [Mac App Store](https://apps.apple.com/app/xcode/id497799835)
- [ ] **CocoaPods** (macOS, for iOS): `sudo gem install cocoapods`
- [ ] **Android Studio** (for Android) - [Download](https://developer.android.com/studio)

## ⚡ Quick Setup Steps

### 1. Navigate to Project

```bash
cd /Users/kh/Projects/Journal/JournalApp
```

### 2. Run Setup

```bash
# Option A: Master script (recommended)
chmod +x install-all.sh
./install-all.sh

# Option B: npm script
npm run setup

# Option C: Node.js script
node setup.js
```

### 3. Configure API Keys

Edit `.env` file and add your keys:

```bash
# Open .env in your editor
nano .env  # or use your preferred editor
```

**Get API Keys:**
- **Notion**: https://www.notion.so/my-integrations
- **Google Calendar**: https://console.cloud.google.com/

### 4. Start Development

```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Run app
npm run ios      # iOS (macOS only)
npm run android  # Android
```

## 🎯 What Gets Installed

All these libraries are automatically installed:

### Core Canvas & Interactions
- ✅ React Native Skia (canvas rendering)
- ✅ React Native Reanimated (animations)
- ✅ React Native Gesture Handler (gestures)
- ✅ Zustand (state management)

### UI & Navigation
- ✅ React Navigation (bottom tabs + stack)
- ✅ NativeWind (Tailwind CSS styling)
- ✅ React Native Vector Icons

### Calendar & Sync
- ✅ React Native Calendars
- ✅ React Native Calendar Events
- ✅ Notion API Client
- ✅ Google Calendar API

### Media
- ✅ React Native Image Picker
- ✅ React Native Fast Image
- ✅ React Native SVG

### Storage
- ✅ AsyncStorage (local persistence)

## 📱 Running the App

### iOS (macOS only)

```bash
# First time: Open in Xcode to configure signing
open ios/JournalApp.xcworkspace

# Then run
npm run ios
```

### Android

```bash
# Make sure Android emulator is running or device connected
npm run android
```

## 🔧 Troubleshooting

**Issue**: Pod install fails
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Issue**: Metro cache problems
```bash
npm start -- --reset-cache
```

**Issue**: Build errors
```bash
# iOS
cd ios && rm -rf build && cd ..

# Android
cd android && ./gradlew clean && cd ..
```

## 📚 More Information

- **Full Installation Guide**: See `INSTALL.md`
- **Setup Summary**: See `SETUP_SUMMARY.md`
- **Project README**: See `README.md`

## ✅ Success Indicators

You'll know setup is complete when:

1. ✅ `node_modules/` directory exists with all packages
2. ✅ `.env` file exists (even if placeholders)
3. ✅ `ios/Pods/` exists (macOS only)
4. ✅ `npm start` runs without errors
5. ✅ App builds and runs on simulator/device

---

**Ready to build your creative journaling app!** 🎨📱


