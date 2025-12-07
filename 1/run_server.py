"""
FastAPI Server Launcher

This script starts the FastAPI backend server using uvicorn.
It's the recommended way to run the server (better than running main.py directly).

Usage:
    python run_server.py

The server will:
- Start on http://0.0.0.0:8000 (accessible from all network interfaces)
- Auto-reload on code changes (reload=True)
- Initialize vector DB and chatbot on startup

Author: Project 1 - LLM Practice Projects
"""

import uvicorn

if __name__ == "__main__":
    # Run the FastAPI application using uvicorn ASGI server
    # uvicorn is a fast ASGI server implementation
    uvicorn.run(
        "src.main:app",      # Path to FastAPI app (module:variable)
        host="0.0.0.0",      # Listen on all network interfaces (accessible from other devices)
        port=8000,           # Port number
        reload=True          # Auto-reload on code changes (useful for development)
    )

