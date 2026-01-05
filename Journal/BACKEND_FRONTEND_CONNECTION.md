# Backend & Frontend Connection Setup

## ✅ Backend Setup Complete

### Database Models Created
- ✅ `Habit` - Habit tracking
- ✅ `HabitCheck` - Daily habit completions
- ✅ `Event` - Calendar events
- ✅ `JournalEntry` - Journal entries with canvas layers

### API Endpoints Implemented
- ✅ Journal entries (GET, POST, PUT, DELETE)
- ✅ Habits (GET, POST, PUT, DELETE)
- ✅ Habit checks (GET, POST)
- ✅ Habit streaks (GET)
- ✅ Events (GET, POST, PUT, DELETE)
- ✅ Daily logs (POST)

### Database Initialized
- ✅ SQLite database created
- ✅ All tables created
- ✅ Ready for data storage

## 🔌 Frontend-Backend Connection

### Frontend API Service
- ✅ `src/services/api.ts` - API client for backend communication
- ✅ `src/services/storageApi.ts` - Storage service using API (replaces MMKV)
- ✅ All stores updated to use API service

### Connection Configuration

**For iOS Simulator:**
- Backend URL: `http://localhost:8000/api/v1`

**For Android Emulator:**
- Backend URL: `http://10.0.2.2:8000/api/v1`

**For Physical Device:**
- Use your computer's local IP address (e.g., `http://192.168.1.100:8000/api/v1`)

## 🚀 Running the Complete Stack

### 1. Start Backend Server

```bash
cd backend
source venv/bin/activate
python -m app.main
# Or: uvicorn app.main:app --reload
```

Backend will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 2. Start Frontend

```bash
cd JournalApp
npm start
# Then in another terminal:
npm run ios    # iOS
npm run android  # Android
```

### 3. Update API URL for Device Testing

If testing on a physical device, update `src/services/api.ts`:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:8000/api/v1'  // e.g., http://192.168.1.100:8000/api/v1
  : Config.API_BASE_URL || 'http://localhost:8000/api/v1';
```

## 📊 Data Flow

1. **User Action** → Frontend component
2. **Store Action** → Zustand store calls `storageApiService`
3. **API Call** → `api.ts` makes HTTP request to backend
4. **Backend Processing** → FastAPI endpoint processes request
5. **Database Storage** → SQLAlchemy saves to SQLite
6. **Response** → Backend returns data
7. **Store Update** → Zustand store updates state
8. **UI Update** → React components re-render

## 🔒 Data Persistence

All user data is now stored in the backend database:
- ✅ Habits and habit checks persist across app restarts
- ✅ Journal entries with canvas layers are saved
- ✅ Events are stored in database
- ✅ Daily logs are preserved
- ✅ Data structure maintained exactly as entered

## 🧪 Testing the Connection

1. **Start backend server**
2. **Start frontend app**
3. **Create a habit** → Should appear in backend database
4. **Complete a habit** → Check saved in backend
5. **Create journal entry** → Saved with all layers
6. **Check backend logs** → Should see API requests

## 📝 Notes

- Backend uses SQLite by default (can be upgraded to PostgreSQL/MySQL)
- All endpoints return JSON with consistent structure
- Frontend handles date conversions automatically
- Error handling in place for network failures
- CORS configured to allow React Native app

---

**Backend and Frontend are now connected!** 🎉


