#!/bin/bash
# Stop script for Conversational RAG Application

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Stopping Conversational RAG Application...${NC}"

# Kill backend
pkill -f "run_server.py" 2>/dev/null && echo -e "${GREEN}✅ Backend stopped${NC}" || echo "Backend not running"

# Kill frontend
pkill -f "gradio_ui.py" 2>/dev/null && echo -e "${GREEN}✅ Frontend stopped${NC}" || echo "Frontend not running"

# Kill processes on ports
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:7860 | xargs kill -9 2>/dev/null || true

echo -e "${GREEN}Application stopped${NC}"

