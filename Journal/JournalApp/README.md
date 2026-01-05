# JournalApp - Digital Creative Journaling App

A beautiful, feature-rich journaling app for iOS and Android that combines the functionality of Notion, Canva, and iPad creative tools.

## Features

- 📅 **Today's Summary Screen**: View all tasks, habits, and events for the day with creative journaling (images, stickers, sketches)
- 📆 **Calendar Views**: Month, week, and day views with dynamic sizing based on events
- ⚙️ **Management Screen**: Upload events, track habits, sync with Google Calendar, Apple Calendar, and Notion

## Tech Stack

### Core Libraries
- **React Native Skia**: High-performance 2D graphics for sketching and canvas
- **React Native Reanimated**: Smooth animations for draggable, resizable, rotatable stickers
- **React Native Gesture Handler**: Native gesture recognition
- **Zustand**: State management for canvas and app state
- **NativeWind**: Utility-first styling with Tailwind CSS

### Key Dependencies
- React Navigation (Bottom Tabs + Stack)
- React Native Calendars
- React Native Calendar Events (Google/Apple Calendar sync)
- React Native Image Picker
- AsyncStorage (Data persistence)
- Notion API Client
- Google Calendar API

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Xcode 14+ (for iOS development on macOS)
- CocoaPods (for iOS dependencies)
- Android Studio (for Android development)

## Quick Start

### 1. Setup Environment

Run the setup script to install all dependencies:

```bash
# Using Node.js script
npm run setup

# OR using shell script
chmod +x setup.sh
./setup.sh
```

### 2. Configure API Keys

Edit `.env` file and add your API keys:

```env
# Notion API
NOTION_API_KEY=secret_your_key_here
NOTION_DATABASE_ID=your_database_id_here

# Google Calendar API
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=com.journalapp:/oauth2callback
```

**Get API Keys:**
- **Notion**: https://www.notion.so/my-integrations
- **Google Calendar**: https://console.cloud.google.com/

### 3. Install iOS Dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

### 4. Start Metro Bundler

```bash
npm start
```

### 5. Run the App

**iOS:**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

## Project Structure

```
JournalApp/
├── src/
│   ├── screens/          # Main app screens
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation setup
│   ├── services/         # API services, storage
│   ├── stores/           # Zustand state stores
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── ios/                  # iOS native code
├── android/              # Android native code
├── .env                  # Environment variables (not in git)
└── package.json
```

## Key Features Implementation

### Canvas/Journal Entry (Instagram Stories-like)
- Uses React Native Skia for high-performance rendering
- Stickers are draggable, resizable, and rotatable (Reanimated + Gesture Handler)
- Free-hand sketching with multiple brush styles
- Image layering from gallery
- State managed with Zustand

### Calendar Integration
- Sync with Google Calendar (via googleapis)
- Sync with Apple Calendar (via react-native-calendar-events)
- Sync with Notion (via @notionhq/client)

### Data Persistence
- All data stored locally using AsyncStorage
- No data is erased unless explicitly deleted by user
- Automatic backup and restore

## Development

### Available Scripts

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Adding New Dependencies

After installing new native dependencies:
- iOS: Run `cd ios && pod install && cd ..`
- Android: No extra step needed (autolinking)

## Troubleshooting

### iOS Build Issues
- Clear build: `cd ios && rm -rf build && cd ..`
- Clean pods: `cd ios && pod deintegrate && pod install && cd ..`
- Reset Metro: `npm start -- --reset-cache`

### Android Build Issues
- Clean build: `cd android && ./gradlew clean && cd ..`
- Reset Metro: `npm start -- --reset-cache`

### Environment Variables Not Loading
- Ensure `react-native-config` is properly linked
- For iOS: Run `pod install` after installing
- Restart Metro bundler after changing `.env`

## License

Private project


