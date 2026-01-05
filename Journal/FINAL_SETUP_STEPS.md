# 🚀 Final Setup Steps

## ✅ Already Completed
- ✅ CocoaPods installed (version 1.16.2)
- ✅ Xcode.app found on system
- ✅ Backend API running
- ✅ Metro bundler running

## ⚠️ Action Required (Run These Commands)

### Step 1: Configure Xcode Command Line Tools
The system needs to point to Xcode.app instead of Command Line Tools:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

This will ask for your password. After running this, verify:
```bash
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer
```

### Step 2: Fix UTF-8 Encoding (for CocoaPods)
Add UTF-8 encoding to your shell profile:

```bash
echo 'export LANG=en_US.UTF-8' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Install iOS Dependencies
```bash
cd JournalApp/ios
pod install
cd ../..
```

This will install all iOS native dependencies (takes 5-10 minutes).

### Step 4: Open iOS Simulator
```bash
open -a Simulator
```

### Step 5: Run the App
```bash
cd JournalApp
npm run ios
```

## 🎉 That's It!

After completing these steps, your app should launch in the iOS Simulator!

## Quick One-Liner (After Step 1 & 2)

Or use the automated script (after configuring Xcode):
```bash
cd JournalApp
./install-dependencies.sh
```


