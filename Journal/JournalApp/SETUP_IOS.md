# 🍎 iOS Simulator Setup Guide

## Step 1: Install Xcode (Required)

1. **Open Mac App Store**
2. **Search for "Xcode"**
3. **Install Xcode** (Free, ~12GB download - takes 30-60 minutes)
4. **Open Xcode once** after installation
5. **Accept the license agreement**
6. **Install additional components** when prompted

## Step 2: Configure Command Line Tools

After Xcode is installed, run:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Verify:
```bash
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer
```

## Step 3: Install CocoaPods

```bash
sudo gem install cocoapods
```

**Note**: If you get permission errors, you might need:
```bash
sudo gem install -n /usr/local/bin cocoapods
```

## Step 4: Install iOS Dependencies

```bash
cd JournalApp/ios
pod install
cd ../..
```

This will install all iOS native dependencies (may take 5-10 minutes).

## Step 5: Launch iOS Simulator

### Option A: From Terminal
```bash
# List available simulators
xcrun simctl list devices available

# Open simulator
open -a Simulator
```

### Option B: From Xcode
1. Open Xcode
2. Go to: Xcode → Open Developer Tool → Simulator

## Step 6: Run the App

```bash
cd JournalApp
npm run ios
```

Or specify a device:
```bash
npm run ios -- --simulator="iPhone 15 Pro"
```

## Common Issues & Fixes

### "Command Line Tools not found"
```bash
xcode-select --install
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### "pod: command not found"
```bash
sudo gem install cocoapods
# Or use Homebrew:
brew install cocoapods
```

### "No such module 'React'"
```bash
cd ios
pod install
cd ..
```

### "Simulator won't start"
- Make sure Xcode is fully installed (not just Command Line Tools)
- Try: `xcrun simctl boot <device-id>`
- Or restart: `killall Simulator && open -a Simulator`

### Build Fails
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npm run ios
```

## Quick Setup Script

Once Xcode is installed, you can run:
```bash
cd JournalApp/ios
pod install
cd ..
npm run ios
```

That's it! 🎉


