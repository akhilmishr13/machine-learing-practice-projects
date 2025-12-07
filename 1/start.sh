#!/bin/bash
# Start script for Conversational RAG Application
# Starts both FastAPI backend and Gradio frontend

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Starting Conversational RAG Application${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ ! -d "../venv" ]; then
    echo -e "${RED}Error: Virtual environment not found at ../venv${NC}"
    echo "Please create it first: python3 -m venv ../venv"
    exit 1
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source ../venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found${NC}"
    echo "Please create .env file with your OPENAI_API_KEY"
fi

# Kill any existing processes
echo -e "${YELLOW}Cleaning up existing processes...${NC}"
pkill -f "run_server.py" 2>/dev/null || true
pkill -f "gradio_ui.py" 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:7860 | xargs kill -9 2>/dev/null || true
sleep 2

# Start FastAPI backend
echo -e "${GREEN}Starting FastAPI backend on port 8000...${NC}"
nohup python run_server.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 5
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
    sleep 10
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is running${NC}"
    else
        echo -e "${RED}❌ Backend failed to start. Check backend.log${NC}"
        exit 1
    fi
fi

# Start Gradio frontend
echo -e "${GREEN}Starting Gradio frontend on port 7860...${NC}"
nohup python gradio_ui.py > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 5
if curl -s http://localhost:7860/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
    sleep 15
    if curl -s http://localhost:7860/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is running${NC}"
    else
        echo -e "${RED}❌ Frontend failed to start. Check frontend.log${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Application Started Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "Frontend: ${GREEN}http://localhost:7860${NC}"
echo ""
echo -e "Logs:"
echo "  - Backend:  backend.log"
echo "  - Frontend: frontend.log"
echo ""
echo -e "To stop the application, run: ${YELLOW}./stop.sh${NC} or press Ctrl+C"
echo ""

