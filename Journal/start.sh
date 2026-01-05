#!/bin/bash

# JournalApp - Start Script
# Starts both backend and frontend servers

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║    JournalApp - Starting Servers       ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}\n"

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to cleanup background processes
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}

# Trap Ctrl+C
trap cleanup INT TERM

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}⚠️  Backend virtual environment not found${NC}"
    echo -e "${BLUE}Setting up backend...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Check if frontend node_modules exists
if [ ! -d "JournalApp/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies not installed${NC}"
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd JournalApp
    npm install
    cd ..
fi

# Start Backend
echo -e "${BLUE}🚀 Starting Backend Server...${NC}"
cd backend
source venv/bin/activate
python -m app.main &
BACKEND_PID=$!
cd ..
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
echo -e "   📍 API: http://localhost:8000"
echo -e "   📚 Docs: http://localhost:8000/docs\n"

# Wait a bit for backend to start
sleep 3

# Start Frontend (Metro bundler)
echo -e "${BLUE}🚀 Starting Frontend (Metro Bundler)...${NC}"
cd JournalApp
npm start &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
echo -e "   📱 Ready for: npm run ios (or android)\n"

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    ✅ Both servers running!            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "   1. Open a new terminal"
echo "   2. Run: cd JournalApp && npm run ios"
echo "      or: cd JournalApp && npm run android"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for both processes
wait


