#!/bin/bash

# Quick run script for JournalApp Backend

cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Run the server
echo "🚀 Starting JournalApp Backend Server..."
echo "📍 API: http://localhost:8000"
echo "📚 Docs: http://localhost:8000/docs"
echo ""

python -m app.main


