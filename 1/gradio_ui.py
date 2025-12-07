"""
Gradio UI for Conversational RAG Application

This module creates a web-based user interface using Gradio that connects
to the FastAPI backend. The UI provides:
- Chat interface for asking questions
- Source document display
- Backend status checking
- Conversation history management

The UI communicates with the backend via HTTP REST API calls.

Author: Project 1 - LLM Practice Projects
"""

import gradio as gr
import requests
import json
from typing import Tuple, List

# FastAPI backend URL - the UI calls this backend for all operations
API_BASE_URL = "http://localhost:8000"


def chat_with_backend(message: str, history: List) -> Tuple[str, List]:
    """
    Send message to FastAPI backend and update chat history.
    
    This function:
    1. Formats the chat history for Gradio (dict format)
    2. Sends HTTP POST request to FastAPI backend
    3. Formats the response with source documents
    4. Updates and returns the chat history
    
    Args:
        message (str): User's message/question
        history (List): Previous chat history in Gradio format
        
    Returns:
        Tuple[str, List]: Empty string (to clear input) and updated history
    """
    # Validate input - don't process empty messages
    if not message.strip():
        return "", history or []
    
    # Initialize history if None or empty
    if history is None:
        history = []
    
    # Ensure history is a list (safety check)
    if not isinstance(history, list):
        history = []
    
    # Convert history to dict format - Gradio 6.0.2 requires dicts with 'role' and 'content'
    # Handle different input formats for compatibility
    formatted_history = []
    for h in history:
        if isinstance(h, dict) and 'role' in h and 'content' in h:
            # Already in correct dict format - use as is
            formatted_history.append({'role': str(h['role']), 'content': str(h['content'])})
        elif isinstance(h, list) and len(h) == 2:
            # Convert list format [user_msg, bot_msg] to dict format
            formatted_history.append({'role': 'user', 'content': str(h[0])})
            formatted_history.append({'role': 'assistant', 'content': str(h[1])})
        elif isinstance(h, tuple) and len(h) == 2:
            # Convert tuple format to dict format
            formatted_history.append({'role': 'user', 'content': str(h[0])})
            formatted_history.append({'role': 'assistant', 'content': str(h[1])})
    
    try:
        # Send HTTP POST request to FastAPI backend
        # This is how the frontend communicates with the backend
        response = requests.post(
            f"{API_BASE_URL}/chat",              # Backend endpoint
            json={"message": message},           # Request body (JSON)
            headers={"Content-Type": "application/json"},
            timeout=60                           # Wait up to 60 seconds for response
        )
        
        if response.status_code == 200:
            # Success - parse the response
            data = response.json()
            answer = data.get("answer", "Sorry, I couldn't get a response.")
            
            # Add source documents info to the answer for display
            # This shows users which parts of the document were used
            source_docs = data.get("source_documents", [])
            if source_docs:
                sources_text = "\n\n**Sources:**\n"
                for i, doc in enumerate(source_docs[:3], 1):  # Show top 3 sources
                    source_info = f"{i}. "
                    # Add page number if available
                    if "source" in doc.get("metadata", {}):
                        source_info += f"Page {doc['metadata'].get('page', 'N/A')} - "
                    # Add content preview (first 150 characters)
                    source_info += doc["content"][:150] + "..."
                    sources_text += source_info + "\n"
                answer += sources_text
            
            # Update history - Gradio 6.0.2 expects list of dicts with 'role' and 'content'
            formatted_history.append({'role': 'user', 'content': str(message)})
            formatted_history.append({'role': 'assistant', 'content': str(answer)})
            
            return "", formatted_history  # Return empty string to clear input field
        else:
            # Backend returned an error status code
            error_msg = f"Error: {response.status_code} - {response.text}"
            formatted_history.append({'role': 'user', 'content': str(message)})
            formatted_history.append({'role': 'assistant', 'content': str(error_msg)})
            return "", formatted_history
            
    except requests.exceptions.ConnectionError:
        # Backend is not running or not reachable
        error_msg = "❌ Cannot connect to FastAPI backend. Please make sure the server is running on http://localhost:8000"
        formatted_history.append({'role': 'user', 'content': str(message)})
        formatted_history.append({'role': 'assistant', 'content': str(error_msg)})
        return "", formatted_history
    except Exception as e:
        # Any other error
        error_msg = f"❌ Error: {str(e)}"
        formatted_history.append({'role': 'user', 'content': str(message)})
        formatted_history.append({'role': 'assistant', 'content': str(error_msg)})
        return "", formatted_history


def clear_conversation() -> Tuple[List, str]:
    """
    Clear conversation history via backend.
    
    Calls the /clear endpoint on the FastAPI backend to reset
    the conversation history. This allows users to start fresh.
    
    Returns:
        Tuple[List, str]: Empty history list and status message
    """
    try:
        # Send POST request to clear endpoint
        response = requests.post(f"{API_BASE_URL}/clear", timeout=5)
        if response.status_code == 200:
            return [], "✅ Conversation history cleared!"
        else:
            return [], f"⚠️ Error clearing history: {response.status_code}"
    except Exception as e:
        return [], f"⚠️ Error: {str(e)}"


def check_backend_status() -> str:
    """
    Check if FastAPI backend is running and healthy.
    
    This is called when the UI loads and when the user clicks
    the "Check Backend Status" button.
    
    Returns:
        str: Status message indicating backend health
    """
    try:
        # Send GET request to health check endpoint
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            # Backend is healthy
            data = response.json()
            return f"✅ {data.get('message', 'Backend is healthy')}"
        else:
            # Backend returned an error
            return f"⚠️ Backend returned status {response.status_code}"
    except requests.exceptions.ConnectionError:
        # Backend is not reachable (not running or wrong port)
        return "❌ Backend not reachable. Please start the FastAPI server first."
    except Exception as e:
        # Any other error
        return f"❌ Error checking backend: {str(e)}"


def create_ui():
    """
    Create and configure the Gradio user interface.
    
    This function builds the entire UI including:
    - Header with description
    - Backend status checker
    - Chat interface
    - Input field and buttons
    - Information accordion
    
    Returns:
        gr.Blocks: The Gradio application object
    """
    
    # Create the Gradio Blocks application
    # Blocks allows us to create custom layouts (not just simple interfaces)
    with gr.Blocks() as app:
        gr.Markdown("""
        # 🤖 Conversational RAG Application
        
        Ask questions about the document using Retrieval-Augmented Generation (RAG).
        The system uses OpenAI, LangChain, HuggingFace embeddings, and FAISS vector search.
        
        **Backend**: FastAPI server running on `http://localhost:8000`
        """)
        
        # Status check
        with gr.Row():
            status_btn = gr.Button("Check Backend Status", variant="secondary", size="sm")
            status_text = gr.Textbox(
                label="Backend Status",
                value="Click to check",
                interactive=False
            )
        
        # Chat interface
        chatbot = gr.Chatbot(
            label="Conversation",
            height=500
        )
        
        with gr.Row():
            msg = gr.Textbox(
                label="Your Message",
                placeholder="Ask a question about the document...",
                lines=2,
                scale=4
            )
            with gr.Column(scale=1):
                submit_btn = gr.Button("Send", variant="primary", size="lg")
                clear_btn = gr.Button("Clear History", variant="stop")
        
        # Info section
        with gr.Accordion("ℹ️ How it works", open=False):
            gr.Markdown("""
            ### Multi-Turn Conversation Support
            
            1. **Standalone Query Generation**: The system automatically converts follow-up questions 
               (like "Who wrote it?") into standalone queries using conversation context.
            
            2. **Vector DB Search**: Uses FAISS to find relevant document chunks based on the standalone query.
            
            3. **RAG Response**: OpenAI generates answers using retrieved context and conversation history.
            
            4. **Conversation Memory**: Maintains context across multiple turns for natural conversations.
            
            ### Example Conversation
            
            - **You**: "What is this book about?"
            - **Bot**: [Answers about the book]
            - **You**: "Who wrote it?"
            - **Bot**: [Generates standalone query: "Who wrote the book about PM interviews?"] → [Answers with authors]
            """)
        
        # Event handlers
        msg.submit(
            fn=chat_with_backend,
            inputs=[msg, chatbot],
            outputs=[msg, chatbot]
        )
        
        submit_btn.click(
            fn=chat_with_backend,
            inputs=[msg, chatbot],
            outputs=[msg, chatbot]
        )
        
        clear_btn.click(
            fn=clear_conversation,
            outputs=[chatbot, status_text]
        )
        
        status_btn.click(
            fn=check_backend_status,
            outputs=[status_text]
        )
        
        # Check status on load
        app.load(
            fn=check_backend_status,
            outputs=[status_text]
        )
    
    return app


if __name__ == "__main__":
    app = create_ui()
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )

