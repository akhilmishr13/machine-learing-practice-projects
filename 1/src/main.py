"""FastAPI main application."""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from .vector_db import VectorDB
from .chatbot import ConversationBot

load_dotenv()

app = FastAPI(title="Conversational RAG API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
vector_db: Optional[VectorDB] = None
chatbot: Optional[ConversationBot] = None

# Request/Response models
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str
    source_documents: list

class StatusResponse(BaseModel):
    status: str
    message: str


@app.on_event("startup")
async def startup_event():
    """Initialize vector DB and chatbot on startup."""
    global vector_db, chatbot
    
    try:
        # Initialize vector DB
        vector_db = VectorDB()
        
        # Check if vector store exists, if not create from PDF
        # Get absolute path to project root
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        vector_store_path = os.path.join(base_dir, "vector_store")
        sample_dir = os.path.join(base_dir, "data", "sample_documents")
        
        # Find PDF file dynamically
        pdf_files = [f for f in os.listdir(sample_dir) if f.endswith('.pdf')]
        if not pdf_files:
            raise FileNotFoundError(f"No PDF files found in {sample_dir}")
        pdf_path = os.path.join(sample_dir, pdf_files[0])
        
        # Check if vector store directory exists and has required files
        index_file = os.path.join(vector_store_path, "index.faiss")
        pkl_file = os.path.join(vector_store_path, "index.pkl")
        
        if os.path.exists(index_file) and os.path.exists(pkl_file):
            print("Loading existing vector store from disk...")
            try:
                vector_db.load(vector_store_path)
                print(f"✓ Vector store loaded successfully from {vector_store_path}")
            except Exception as e:
                print(f"Error loading vector store: {e}")
                print("Creating new vector store from PDF...")
                vector_db.create_from_pdf(pdf_path)
                vector_db.save(vector_store_path)
                print(f"✓ Vector store created and saved to {vector_store_path}")
        else:
            print("Vector store not found. Creating from PDF (this may take a minute)...")
            vector_db.create_from_pdf(pdf_path)
            vector_db.save(vector_store_path)
            print(f"✓ Vector store created and saved to {vector_store_path}")
        
        # Initialize chatbot
        chatbot = ConversationBot(vector_db)
        print("FastAPI server initialized successfully!")
        
    except Exception as e:
        print(f"Error during startup: {str(e)}")
        raise


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Conversational RAG API is running"}


@app.get("/health", response_model=StatusResponse)
async def health():
    """Health check endpoint."""
    return StatusResponse(
        status="healthy",
        message="API is running and vector DB is loaded"
    )


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat endpoint for conversational interaction.
    
    Args:
        request: Chat request with message
        
    Returns:
        Chat response with answer and source documents
    """
    if chatbot is None:
        raise HTTPException(status_code=503, detail="Chatbot not initialized")
    
    try:
        result = chatbot.chat(request.message)
        return ChatResponse(
            answer=result["answer"],
            source_documents=result["source_documents"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@app.post("/clear", response_model=StatusResponse)
async def clear_history():
    """Clear conversation history."""
    if chatbot is None:
        raise HTTPException(status_code=503, detail="Chatbot not initialized")
    
    try:
        chatbot.clear_history()
        return StatusResponse(
            status="success",
            message="Conversation history cleared"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing history: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

