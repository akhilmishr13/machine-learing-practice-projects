# Installation Guide

This guide will help you set up the complete development environment for JournalApp.

## Quick Setup (Automated)

Run the setup script to install everything automatically:

```bash
npm run setup
```

Or using the shell script:

```bash
chmod +x setup.sh
./setup.sh
```

## Manual Setup Steps

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **npm**: Comes with Node.js
- **Xcode 14+** (macOS only): [Mac App Store](https://apps.apple.com/app/xcode/id497799835)
- **CocoaPods** (macOS only): `sudo gem install cocoapods`
- **Android Studio**: [Download Android Studio](https://developer.android.com/studio)

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- React Native core libraries
- Navigation libraries
- Skia for canvas rendering
- Reanimated for animations
- Gesture Handler for touch interactions
- Calendar integration libraries
- Image picker and media libraries
- API clients (Notion, Google Calendar)
- And more...

### 3. Setup Environment Variables

Copy the template file:

```bash
cp env.template .env
```

Then edit `.env` and add your API keys:

```env
# Notion API
NOTION_API_KEY=secret_your_actual_key_here
NOTION_DATABASE_ID=your_database_id_here

# Google Calendar API
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=com.journalapp:/oauth2callback

# App Configuration
APP_NAME=JournalApp
APP_BUNDLE_ID=com.journalapp
```

### 4. Get API Keys

#### Notion API

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Give it a name (e.g., "JournalApp")
4. Copy the "Internal Integration Token" → This is your `NOTION_API_KEY`
5. Create a database in Notion
6. Share the database with your integration
7. Copy the Database ID from the URL → This is your `NOTION_DATABASE_ID`

#### Google Calendar API

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable "Google Calendar API":
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "iOS" or "Android" (create one for each platform)
   - Bundle ID: `com.journalapp`
   - Copy Client ID and Client Secret

### 5. Install iOS Dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

### 6. Start Metro Bundler

```bash
npm start
```

Keep this terminal open. Metro is the JavaScript bundler for React Native.

### 7. Run the App

**iOS (macOS only):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## Troubleshooting

### Issue: CocoaPods not found
**Solution**: Install CocoaPods
```bash
sudo gem install cocoapods
```

### Issue: Pod install fails
**Solution**: Clean and reinstall
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Issue: Metro bundler cache issues
**Solution**: Reset cache
```bash
npm start -- --reset-cache
```

### Issue: Environment variables not loading
**Solution**: 
1. Ensure `react-native-config` is installed
2. For iOS: Run `pod install` after installing
3. Restart Metro bundler

### Issue: Build errors
**Solution**: Clean build
```bash
# iOS
cd ios
rm -rf build
pod install
cd ..

# Android
cd android
./gradlew clean
cd ..
```

## Project Structure

After setup, your project structure should look like:

```
JournalApp/
├── src/                    # Source code (to be created)
├── ios/                    # iOS native code
├── android/                # Android native code
├── node_modules/           # Dependencies
├── .env                    # Environment variables (your API keys)
├── env.template            # Template for .env
├── package.json            # Dependencies and scripts
├── babel.config.js         # Babel configuration
├── metro.config.js         # Metro bundler configuration
├── tailwind.config.js      # NativeWind/Tailwind configuration
└── setup.js                # Setup script
```

## Next Steps

After successful installation:

1. ✅ Update `.env` with your API keys
2. ✅ Test the app runs on iOS/Android
3. ✅ Start building the app screens and components

See `README.md` for more information about the app architecture and features.


