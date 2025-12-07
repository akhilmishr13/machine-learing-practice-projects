"""
FastAPI Main Application - Conversational RAG API Backend

This module creates a FastAPI web server that provides REST API endpoints
for a conversational RAG (Retrieval-Augmented Generation) application.

The application:
1. Loads or creates a vector database from PDF documents on startup
2. Provides endpoints for chat interactions
3. Manages conversation history
4. Returns answers with source document citations

Author: Project 1 - LLM Practice Projects
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from .vector_db import VectorDB
from .chatbot import ConversationBot

# Load environment variables from .env file
# This allows us to store sensitive data like API keys outside the code
load_dotenv()

# Initialize FastAPI application
# FastAPI is a modern web framework for building APIs with Python
app = FastAPI(title="Conversational RAG API", version="1.0.0")

# CORS (Cross-Origin Resource Sharing) middleware
# This allows the frontend (Gradio UI) to make requests to this backend
# from a different port (frontend: 7860, backend: 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,  # Allow cookies/credentials
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Global instances - these are initialized once on startup and reused
# for all requests. This is more efficient than creating new instances
# for each request.
vector_db: Optional[VectorDB] = None  # Vector database for document storage
chatbot: Optional[ConversationBot] = None  # Chatbot for handling conversations

# Request/Response Models using Pydantic
# These define the structure of data sent to and received from the API
# Pydantic automatically validates the data structure

class ChatRequest(BaseModel):
    """
    Request model for chat endpoint.
    
    Attributes:
        message (str): The user's message/question
    """
    message: str

class ChatResponse(BaseModel):
    """
    Response model for chat endpoint.
    
    Attributes:
        answer (str): The AI-generated answer
        source_documents (list): List of source documents used to generate the answer
    """
    answer: str
    source_documents: list

class StatusResponse(BaseModel):
    """
    Response model for health check endpoint.
    
    Attributes:
        status (str): Status of the API (e.g., "healthy")
        message (str): Additional status message
    """
    status: str
    message: str


@app.on_event("startup")
async def startup_event():
    """
    Startup event handler - runs once when the FastAPI server starts.
    
    This function:
    1. Initializes the vector database
    2. Loads existing vector store OR creates new one from PDF
    3. Initializes the chatbot with the vector database
    
    The vector store is persistent - once created, it's saved to disk
    and loaded on subsequent startups (no re-ingestion needed).
    """
    global vector_db, chatbot
    
    try:
        # Step 1: Initialize vector DB instance
        # This creates the embedding model and text splitter
        vector_db = VectorDB()
        
        # Step 2: Determine paths
        # Get the absolute path to project root (folder 1)
        # __file__ is the current file (main.py)
        # We go up two levels: src/ -> 1/ -> project root
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        vector_store_path = os.path.join(base_dir, "vector_store")  # Where to save/load vector store
        sample_dir = os.path.join(base_dir, "data", "sample_documents")  # Where PDFs are stored
        
        # Step 3: Find PDF file dynamically
        # This allows us to work with any PDF in the sample_documents folder
        pdf_files = [f for f in os.listdir(sample_dir) if f.endswith('.pdf')]
        if not pdf_files:
            raise FileNotFoundError(f"No PDF files found in {sample_dir}")
        pdf_path = os.path.join(sample_dir, pdf_files[0])  # Use the first PDF found
        
        # Step 4: Check if vector store already exists
        # FAISS saves two files: index.faiss (vector data) and index.pkl (metadata)
        index_file = os.path.join(vector_store_path, "index.faiss")
        pkl_file = os.path.join(vector_store_path, "index.pkl")
        
        if os.path.exists(index_file) and os.path.exists(pkl_file):
            # Vector store exists - load it (fast, no re-ingestion)
            print("Loading existing vector store from disk...")
            try:
                vector_db.load(vector_store_path)
                print(f"✓ Vector store loaded successfully from {vector_store_path}")
            except Exception as e:
                # If loading fails, create a new one
                print(f"Error loading vector store: {e}")
                print("Creating new vector store from PDF...")
                vector_db.create_from_pdf(pdf_path)
                vector_db.save(vector_store_path)
                print(f"✓ Vector store created and saved to {vector_store_path}")
        else:
            # Vector store doesn't exist - create it from PDF
            # This is slow the first time (takes 1-2 minutes for large PDFs)
            print("Vector store not found. Creating from PDF (this may take a minute)...")
            vector_db.create_from_pdf(pdf_path)  # Process PDF and create embeddings
            vector_db.save(vector_store_path)  # Save to disk for future use
            print(f"✓ Vector store created and saved to {vector_store_path}")
        
        # Step 5: Initialize chatbot with the vector database
        # The chatbot uses the vector DB to find relevant documents
        chatbot = ConversationBot(vector_db)
        print("FastAPI server initialized successfully!")
        
    except Exception as e:
        # If anything fails during startup, log the error and stop the server
        print(f"Error during startup: {str(e)}")
        raise  # Re-raise to stop server startup


@app.get("/")
async def root():
    """
    Root endpoint - simple health check.
    
    Returns:
        dict: Simple message indicating the API is running
    """
    return {"message": "Conversational RAG API is running"}


@app.get("/health", response_model=StatusResponse)
async def health():
    """
    Health check endpoint.
    
    Used by monitoring systems and the frontend to verify the API is running
    and the vector database is loaded.
    
    Returns:
        StatusResponse: Status information about the API
    """
    return StatusResponse(
        status="healthy",
        message="API is running and vector DB is loaded"
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint for conversational interaction.
    
    This is the core endpoint that handles user questions. It:
    1. Receives the user's message
    2. Sends it to the chatbot for processing
    3. Returns the answer along with source documents
    
    The chatbot automatically:
    - Detects if it's casual chat or a document question
    - Generates standalone queries for follow-up questions
    - Retrieves relevant documents from the vector DB
    - Generates context-aware answers using OpenAI
    
    Args:
        request (ChatRequest): Request containing the user's message
        
    Returns:
        ChatResponse: Response containing the answer and source documents
        
    Raises:
        HTTPException: If chatbot is not initialized or processing fails
    """
    # Check if chatbot is initialized (should always be true after startup)
    if chatbot is None:
        raise HTTPException(
            status_code=503, 
            detail="Chatbot not initialized. Server may still be starting up."
        )
    
    try:
        # Process the message through the chatbot
        # This handles all the RAG logic, conversation memory, etc.
        result = chatbot.chat(request.message)
        
        # Return formatted response
        return ChatResponse(
            answer=result["answer"],  # The AI-generated answer
            source_documents=result["source_documents"]  # Documents used (empty for casual chat)
        )
    except Exception as e:
        # If anything goes wrong, return a 500 error with details
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing chat: {str(e)}"
        )


@app.post("/clear", response_model=StatusResponse)
async def clear_history():
    """
    Clear conversation history endpoint.
    
    This resets the chatbot's conversation memory, allowing users to
    start a fresh conversation without context from previous messages.
    
    Returns:
        StatusResponse: Confirmation that history was cleared
        
    Raises:
        HTTPException: If chatbot is not initialized or clearing fails
    """
    if chatbot is None:
        raise HTTPException(
            status_code=503, 
            detail="Chatbot not initialized"
        )
    
    try:
        # Clear the conversation history in the chatbot
        chatbot.clear_history()
        return StatusResponse(
            status="success",
            message="Conversation history cleared"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error clearing history: {str(e)}"
        )


# Entry point for running the server directly (not recommended - use run_server.py instead)
if __name__ == "__main__":
    import uvicorn
    # Run the FastAPI app using uvicorn ASGI server
    # host="0.0.0.0" means listen on all network interfaces
    # port=8000 is the port the server will run on
    uvicorn.run(app, host="0.0.0.0", port=8000)

