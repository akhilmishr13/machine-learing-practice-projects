# 🚀 Quick Start - See the UI

Your app needs to run on a device or simulator. Here are your options:

## ⚠️ Current Status
- ✅ Metro bundler: Running
- ✅ Backend API: Running  
- ❌ iOS Simulator: Xcode not fully configured
- ❓ Android Emulator: Not checked

## Option 1: Use Expo Go (Easiest)

Since you don't have Xcode fully set up, the easiest way to see the UI is to use Expo Go:

```bash
# Install Expo CLI
npm install -g expo-cli

# In JournalApp directory, start Expo
cd JournalApp
npx expo start
```

Then scan the QR code with:
- **iOS**: Camera app or Expo Go app
- **Android**: Expo Go app

**Note**: Some native modules (like Skia) may not work in Expo Go. This is mainly for UI preview.

## Option 2: Set Up Xcode for iOS (Recommended for full features)

1. **Install Xcode from App Store** (free, ~12GB download)
2. **Open Xcode once** to accept license
3. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```
4. **Install iOS dependencies**:
   ```bash
   cd JournalApp/ios
   pod install
   cd ..
   ```
5. **Run the app**:
   ```bash
   npm run ios
   ```

## Option 3: Use Android Emulator

1. **Install Android Studio** from https://developer.android.com/studio
2. **Create an Android Virtual Device (AVD)**
3. **Start the emulator**
4. **Run**:
   ```bash
   cd JournalApp
   npm run android
   ```

## Option 4: View Code & Test Backend API

While setting up a simulator, you can:
- ✅ **View all UI code** in `JournalApp/src/screens/`
- ✅ **Test backend API** at http://localhost:8000/docs
- ✅ **See component code** in `JournalApp/src/components/`

## What You'll See When App Runs

1. **Today Screen**: Daily summary with habit tracking
2. **Calendar Screen**: Dynamic calendar view
3. **Profile Screen**: Settings and configuration

All screens are connected to your backend API at `http://localhost:8000`

