# 📦 Installing Xcode and CocoaPods

## Step 1: Install Xcode

### Option A: From Mac App Store (Recommended)
1. **Open Mac App Store**
2. **Search for "Xcode"**
3. **Click "Get" or "Install"** (Free, ~12GB download)
4. **Wait for download** (30-60 minutes depending on internet speed)
5. **Open Xcode** after installation
6. **Accept the license agreement** when prompted
7. **Install additional components** if requested

### Option B: Check if Already Installed
Run this command to check:
```bash
ls -d /Applications/Xcode.app
```

If it exists, Xcode is installed!

## Step 2: Install CocoaPods

### Option A: Using Homebrew (Recommended - No sudo needed)
```bash
brew install cocoapods
```

### Option B: Using RubyGems (Requires sudo)
```bash
sudo gem install cocoapods
```

### Option C: Check if Already Installed
```bash
pod --version
```

If it shows a version number, CocoaPods is installed!

## Step 3: Install iOS Dependencies

Once both Xcode and CocoaPods are installed:

```bash
cd JournalApp
cd ios
pod install
cd ../..
```

Or use the automated script:
```bash
cd JournalApp
./install-dependencies.sh
```

## Step 4: Configure Xcode Command Line Tools

After installing Xcode, make sure command line tools point to Xcode:

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Verify:
```bash
xcode-select -p
# Should show: /Applications/Xcode.app/Contents/Developer
```

## Quick Check Script

Run this to check your setup:
```bash
# Check Xcode
if [ -d "/Applications/Xcode.app" ]; then
    echo "✅ Xcode installed"
else
    echo "❌ Xcode not found - install from Mac App Store"
fi

# Check CocoaPods
if command -v pod &> /dev/null; then
    echo "✅ CocoaPods installed: $(pod --version)"
else
    echo "❌ CocoaPods not found - install with: brew install cocoapods"
fi
```

## Troubleshooting

### "xcode-select: error: tool 'xcodebuild' requires Xcode"
- Make sure Xcode.app is installed (not just Command Line Tools)
- Run: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`

### "pod: command not found"
- Install CocoaPods: `brew install cocoapods` or `sudo gem install cocoapods`
- Make sure it's in your PATH

### "Permission denied" when installing CocoaPods
- Use Homebrew instead: `brew install cocoapods` (no sudo needed)
- Or use sudo: `sudo gem install cocoapods`

### "No such module 'React'"
- Run: `cd ios && pod install && cd ..`

