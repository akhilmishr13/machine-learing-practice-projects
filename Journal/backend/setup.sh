#!/bin/bash

# Backend Setup Script for JournalApp

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setting up JournalApp Backend...${NC}\n"

# Check Python
echo -e "${BLUE}📦 Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}❌ Python 3 not found. Please install Python 3.8+${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo -e "${GREEN}✅ $PYTHON_VERSION${NC}\n"

# Create virtual environment
echo -e "${BLUE}🔧 Creating virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment already exists${NC}"
fi
echo ""

# Activate virtual environment
echo -e "${BLUE}🔌 Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✅ Virtual environment activated${NC}\n"

# Upgrade pip
echo -e "${BLUE}📦 Upgrading pip...${NC}"
pip install --upgrade pip
echo -e "${GREEN}✅ pip upgraded${NC}\n"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies (this may take a while)...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Setup .env file
echo -e "${BLUE}🔧 Setting up .env file...${NC}"
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created from .env.example${NC}"
        echo -e "${YELLOW}⚠️  Please update .env with your configuration!${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi
echo ""

# Create uploads directory
echo -e "${BLUE}📁 Creating uploads directory...${NC}"
mkdir -p uploads
echo -e "${GREEN}✅ Uploads directory created${NC}\n"

echo -e "${GREEN}✅ Setup Complete!${NC}\n"
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. Update .env file with your configuration"
echo "2. Activate virtual environment: source venv/bin/activate"
echo "3. Run the server: python -m app.main"
echo "   or: uvicorn app.main:app --reload"
echo ""
echo "API will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
echo ""


