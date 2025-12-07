# Conversational RAG Application

A conversational Retrieval-Augmented Generation (RAG) application with FastAPI backend and Gradio frontend.

## Features

- 📄 **Document Processing**: Process PDF documents and create vector embeddings
- 🔍 **Intelligent Retrieval**: FAISS-based vector search for efficient document retrieval
- 💬 **Smart Conversation**: Distinguishes between casual chat and document questions
- 🎯 **Multi-turn Conversations**: Context-aware conversations with conversation memory
- 🚀 **Easy to Use**: Simple start script for both backend and frontend

## Technology Stack

- **FastAPI**: Backend API server
- **Gradio**: Web-based UI
- **LangChain**: RAG framework and conversation management
- **HuggingFace**: Sentence-transformers for embeddings
- **OpenAI API**: GPT models for text generation
- **FAISS**: Vector database for efficient similarity search

## Quick Start

### 1. Setup

```bash
# Create virtual environment (if not exists)
cd /Users/kh/Projects
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
cd 1
pip install -r requirements.txt

# Create .env file with your OpenAI API key
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

### 2. Start Application

```bash
# Start both backend and frontend
./start.sh
```

This will:
- Start FastAPI backend on `http://localhost:8000`
- Start Gradio UI on `http://localhost:7860`
- Show status and access URLs

### 3. Stop Application

```bash
./stop.sh
```

Or manually:
```bash
pkill -f "run_server.py"
pkill -f "gradio_ui.py"
```

## Manual Start (Alternative)

### Start Backend
```bash
source ../venv/bin/activate
python run_server.py
```

### Start Frontend (in another terminal)
```bash
source ../venv/bin/activate
python gradio_ui.py
```

## Project Structure

```
1/
├── start.sh              # Start both services
├── stop.sh               # Stop both services
├── run_server.py         # FastAPI server launcher
├── gradio_ui.py          # Gradio UI
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables (create this)
├── src/
│   ├── main.py           # FastAPI application
│   ├── chatbot.py        # Conversation bot with RAG
│   └── vector_db.py      # Vector database management
└── data/
    └── sample_documents/ # PDF documents
```

## API Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check
- `POST /chat` - Send message and get response
  ```json
  {
    "message": "your question"
  }
  ```
- `POST /clear` - Clear conversation history

## Features

### Smart Detection
- **Casual Chat**: Messages like "hi", "thanks" → Direct OpenAI response (no RAG)
- **Document Questions**: Questions about the book → RAG with vector DB retrieval

### Multi-turn Conversations
- Maintains conversation context
- Generates standalone queries from follow-up questions
- Example: "What is this book?" → "Who wrote it?" (understands "it" refers to the book)

### Vector DB Persistence
- Embeddings are saved to `./vector_store`
- No re-ingestion on restart
- Fast loading (< 2 seconds)

## Access Points

- **Gradio UI**: http://localhost:7860
- **FastAPI Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Logs

- Backend logs: `backend.log`
- Frontend logs: `frontend.log`

## Troubleshooting

### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:8000 | xargs kill -9
lsof -ti:7860 | xargs kill -9
```

### Vector DB Not Found
The vector store will be created automatically from PDFs in `data/sample_documents/` on first run.

### OpenAI API Key Error
Make sure `.env` file exists with:
```
OPENAI_API_KEY=your_key_here
```
