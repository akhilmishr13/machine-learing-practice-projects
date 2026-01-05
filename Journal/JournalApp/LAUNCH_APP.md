# 🚀 How to Launch the JournalApp UI

The Metro bundler is running, but you need to launch the app on a device or simulator to see the UI.

## Option 1: iOS Simulator (macOS only)

### Prerequisites:
- Xcode installed
- iOS Simulator available

### Steps:

1. **Install iOS dependencies:**
   ```bash
   cd JournalApp/ios
   pod install
   cd ..
   ```

2. **Start the iOS Simulator:**
   ```bash
   # List available simulators
   xcrun simctl list devices available
   
   # Or just open Xcode and select a simulator
   open -a Simulator
   ```

3. **Run the app:**
   ```bash
   cd JournalApp
   npm run ios
   ```
   
   Or specify a device:
   ```bash
   npm run ios -- --simulator="iPhone 15 Pro"
   ```

## Option 2: Android Emulator

### Prerequisites:
- Android Studio installed
- Android SDK configured
- Emulator created

### Steps:

1. **Start Android Emulator:**
   - Open Android Studio
   - Go to Tools → Device Manager
   - Start an emulator

2. **Run the app:**
   ```bash
   cd JournalApp
   npm run android
   ```

## Option 3: Physical Device

### iOS Device:

1. Connect your iPhone via USB
2. Trust the computer on your iPhone
3. In Xcode, select your device
4. Run:
   ```bash
   cd JournalApp
   npm run ios
   ```

### Android Device:

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run:
   ```bash
   cd JournalApp
   npm run android
   ```

## Quick Start (Recommended)

If you have iOS Simulator available:

```bash
cd JournalApp

# Install iOS pods (first time only)
cd ios && pod install && cd ..

# Run the app
npm run ios
```

## Troubleshooting

### Metro Bundler Not Connecting:
- Make sure Metro is running (should already be running from start.sh)
- Check that port 8081 is available
- Try restarting Metro: `npm start -- --reset-cache`

### Build Errors:
- For iOS: Make sure Xcode Command Line Tools are installed: `xcode-select --install`
- For Android: Make sure ANDROID_HOME is set in your environment

### Pod Install Fails (iOS):
```bash
cd ios
pod deintegrate
pod install
cd ..
```

## What to Expect

Once launched, you should see:
- ✅ **Today Screen**: Daily summary with habit tracker
- ✅ **Calendar Screen**: Dynamic masonry calendar view
- ✅ **Profile Screen**: Settings and habit management

The app will connect to the backend API at `http://localhost:8000` (or your configured backend URL).


