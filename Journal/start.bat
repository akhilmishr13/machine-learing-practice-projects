@echo off
REM JournalApp - Start Script (Windows)
REM Starts both backend and frontend servers

echo.
echo ╔════════════════════════════════════════╗
echo ║    JournalApp - Starting Servers       ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if backend venv exists
if not exist "backend\venv" (
    echo ⚠️  Backend virtual environment not found
    echo 📦 Setting up backend...
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    cd ..
)

REM Check if frontend node_modules exists
if not exist "JournalApp\node_modules" (
    echo ⚠️  Frontend dependencies not installed
    echo 📦 Installing frontend dependencies...
    cd JournalApp
    call npm install
    cd ..
)

REM Start Backend
echo 🚀 Starting Backend Server...
cd backend
start "JournalApp Backend" cmd /k "venv\Scripts\activate.bat && python -m app.main"
cd ..
echo ✅ Backend started
echo    📍 API: http://localhost:8000
echo    📚 Docs: http://localhost:8000/docs
echo.

timeout /t 3 /nobreak >nul

REM Start Frontend
echo 🚀 Starting Frontend (Metro Bundler)...
cd JournalApp
start "JournalApp Frontend" cmd /k "npm start"
cd ..
echo ✅ Frontend started
echo    📱 Ready for: npm run ios (or android)
echo.

echo ╔════════════════════════════════════════╗
echo ║    ✅ Both servers running!            ║
echo ╚════════════════════════════════════════╝
echo.
echo 📝 Next Steps:
echo    1. Run: cd JournalApp && npm run android
echo    2. Or open Android Studio for Android
echo    3. Or open Xcode for iOS (macOS only)
echo.
echo Close the server windows to stop them.
echo.

pause


