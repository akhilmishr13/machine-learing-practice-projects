# 🚀 JournalApp - Start Guide

## Quick Start

### Option 1: Using Start Script (Recommended)

**macOS/Linux:**
```bash
./start.sh
```

**Windows:**
```batch
start.bat
```

**Python (Cross-platform):**
```bash
python start.py
```

**npm (if you have package.json in root):**
```bash
npm start
```

This will:
- ✅ Check and setup backend if needed
- ✅ Check and setup frontend if needed
- ✅ Start backend server (http://localhost:8000)
- ✅ Start Metro bundler for frontend
- ✅ Run both in background

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m app.main
```

**Terminal 2 - Frontend:**
```bash
cd JournalApp
npm start
```

**Terminal 3 - Run App:**
```bash
cd JournalApp
npm run ios      # iOS (macOS only)
npm run android  # Android
```

## What Gets Started

### Backend Server
- **URL**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Database**: SQLite at `backend/journalapp.db`

### Frontend Metro Bundler
- **Port**: 8081 (default)
- **Status**: Shows connection info for iOS/Android
- **Ready**: For `npm run ios` or `npm run android`

## Stopping Servers

### Using Start Scripts:
- Press `Ctrl+C` in the terminal running the script
- Both servers will stop automatically

### Manual Stop:
- Find the process and kill it:
  ```bash
  # Find processes
  lsof -ti:8000  # Backend
  lsof -ti:8081  # Metro
  
  # Kill processes
  kill -9 $(lsof -ti:8000)
  kill -9 $(lsof -ti:8081)
  ```

## Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify Python virtual environment is activated
- Check if dependencies are installed: `pip install -r backend/requirements.txt`

### Frontend won't start
- Check if port 8081 is already in use
- Verify node_modules exists: `cd JournalApp && npm install`
- Check Node.js version: Should be 18+

### Can't connect from app
- **iOS Simulator**: Use `http://localhost:8000`
- **Android Emulator**: Use `http://10.0.2.2:8000`
- **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.XXX:8000`)

Update `JournalApp/src/services/api.ts` with the correct URL.

## First Time Setup

If running for the first time:

1. **Backend Setup:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **Frontend Setup:**
   ```bash
   cd JournalApp
   npm install
   ```

3. **iOS Setup (macOS only):**
   ```bash
   cd JournalApp/ios
   pod install
   cd ..
   ```

Then run the start script!

---

**Happy Journaling!** 📱📝✨


