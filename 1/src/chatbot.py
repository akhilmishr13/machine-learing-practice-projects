"""
Conversational Chatbot with RAG (Retrieval-Augmented Generation)

This module implements an intelligent chatbot that:
1. Distinguishes between casual chat and document questions
2. Uses RAG for document questions (retrieves relevant context)
3. Maintains conversation memory for multi-turn conversations
4. Generates standalone queries from follow-up questions

Key Features:
- Smart Detection: Knows when to use RAG vs direct OpenAI
- Standalone Query Generation: Converts "Who wrote it?" to "Who wrote the book about PM interviews?"
- Conversation Memory: Maintains context across multiple turns
- Source Citation: Returns which documents were used

Author: Project 1 - LLM Practice Projects
"""

import os
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

from .vector_db import VectorDB

# Load environment variables (especially OPENAI_API_KEY)
load_dotenv()


class ConversationBot:
    """
    Conversational bot powered by OpenAI with RAG capabilities.
    
    This bot combines:
    - OpenAI GPT models for text generation
    - Vector database for document retrieval
    - Conversation memory for context
    - Smart routing (casual chat vs document questions)
    """
    
    def __init__(self, vector_db: VectorDB, model: str = "gpt-3.5-turbo"):
        """
        Initialize the conversation bot.
        
        Sets up:
        - OpenAI LLM connection
        - Vector database retriever
        - RAG chains for query generation and answer generation
        - Conversation history storage
        
        Args:
            vector_db (VectorDB): Vector database instance for document retrieval
            model (str): OpenAI model name (default: "gpt-3.5-turbo")
                        Options: "gpt-3.5-turbo", "gpt-4", etc.
            
        Raises:
            ValueError: If OPENAI_API_KEY is not found in environment
        """
        self.vector_db = vector_db  # Store reference to vector database
        self.model = model  # Store model name
        
        # Get OpenAI API key from environment variables
        # This is more secure than hardcoding it in the code
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables. "
                           "Please create a .env file with your API key.")
        
        # Initialize OpenAI LLM (Large Language Model)
        # This is the AI that generates responses
        self.llm = ChatOpenAI(
            model=model,              # Which GPT model to use
            temperature=0.7,         # Creativity level (0.0 = deterministic, 1.0 = creative)
            openai_api_key=api_key   # API key for authentication
        )
        
        # Conversation history - stores all messages in the current conversation
        # Format: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}, ...]
        self.chat_history: List[Dict[str, str]] = []
        
        # Initialize retriever - this is used to search the vector database
        # k=4 means retrieve top 4 most similar documents
        self.retriever = self.vector_db.get_retriever(k=4)
        
        # Set up the RAG chains (pipelines for processing)
        self._initialize_chain()
    
    def _initialize_chain(self) -> None:
        """
        Initialize the RAG chains using LangChain Expression Language (LCEL).
        
        Creates two chains:
        1. Standalone Query Chain: Converts follow-up questions to standalone queries
        2. Answer Chain: Generates answers using retrieved context
        
        LCEL uses the pipe operator (|) to chain operations together.
        """
        # Chain 1: Standalone Query Generation
        # This converts questions like "Who wrote it?" into "Who wrote the book about PM interviews?"
        # Why? Vector search works better with complete, standalone questions
        standalone_query_prompt = ChatPromptTemplate.from_messages([
            ("system", """Given a conversation history and a follow-up question, rephrase the follow-up question to be a standalone question that can be understood without the conversation history. 
If the follow-up question is already standalone, return it as is. If it references previous conversation, incorporate the necessary context to make it standalone.

Examples:
- Follow-up: "Who wrote it?" with history "User: What is this book about? Assistant: It's about PM interviews."
  Standalone: "Who wrote the book about PM interviews?"

- Follow-up: "What are the main topics?" (already standalone)
  Standalone: "What are the main topics?"""),
            ("human", """Conversation history:
{chat_history}

Follow-up question: {question}

Standalone question:""")
        ])
        
        # Chain 2: Answer Generation
        # This generates the final answer using retrieved context
        answer_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful AI assistant that answers questions based on the provided context from documents.
Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: {context}

Previous conversation:
{chat_history}"""),
            ("human", "{question}")
        ])
        
        # Build standalone query chain
        # Flow: prompt → LLM → parse output as string
        self.standalone_query_chain = (
            standalone_query_prompt  # Template with placeholders
            | self.llm              # Send to OpenAI GPT
            | StrOutputParser()     # Convert response to string
        )
        
        # Helper function: Format retrieved documents into a single text block
        def format_docs(docs):
            """
            Combine multiple document chunks into a single text string.
            
            Args:
                docs: List of Document objects from vector search
                
            Returns:
                str: Combined text from all documents
            """
            return "\n\n".join(doc.page_content for doc in docs)
        
        # Helper function: Get context from vector database
        def get_context(standalone_query: str):
            """
            Search vector database and format results.
            
            Args:
                standalone_query (str): The standalone query to search for
                
            Returns:
                str: Formatted context from retrieved documents
            """
            # Search vector DB for similar documents
            docs = self.retriever.invoke(standalone_query)
            # Combine into single text
            return format_docs(docs)
        
        # Build answer generation chain
        # Flow: prepare inputs → search vector DB → format context → generate answer
        self.answer_chain = (
            {
                # Prepare inputs for the prompt
                "context": lambda x: get_context(x["standalone_query"]),  # Search vector DB
                "question": lambda x: x["question"],                        # Original question
                "chat_history": lambda x: self._format_chat_history()      # Conversation history
            }
            | answer_prompt    # Fill in the prompt template
            | self.llm         # Send to OpenAI GPT
            | StrOutputParser()  # Convert to string
        )
    
    def _format_chat_history(self) -> str:
        """
        Format chat history as a readable string for prompts.
        
        Only includes the last 6 messages (3 user-assistant exchanges) to:
        - Keep prompts manageable in size
        - Focus on recent context
        - Avoid token limits
        
        Returns:
            str: Formatted conversation history
        """
        if not self.chat_history:
            return "No previous conversation."
        
        # Get last 6 messages (most recent context)
        history_text = ""
        for msg in self.chat_history[-6:]:  # Last 6 messages = 3 exchanges
            role = "User" if msg["role"] == "user" else "Assistant"
            history_text += f"{role}: {msg['content']}\n"
        return history_text
    
    def _is_document_question(self, message: str) -> bool:
        """
        Determine if the message is asking about the document content.
        
        This function implements smart routing:
        - Casual chat ("hi", "thanks") → False (use direct OpenAI)
        - Document questions ("What is this book about?") → True (use RAG)
        
        Detection logic:
        1. Check for casual keywords (hi, thanks, etc.)
        2. Check for document keywords (book, chapter, author, etc.)
        3. Check conversation history for context
        4. Default: treat substantial messages as document questions
        
        Args:
            message (str): User's message to classify
            
        Returns:
            bool: True if document-related question, False for casual chat
        """
        # Keywords that suggest the user is asking about the document
        document_keywords = [
            'book', 'document', 'pdf', 'text', 'chapter', 'page', 'author', 'content',
            'what is', 'tell me about', 'explain', 'describe', 'how does', 'what are',
            'interview', 'product manager', 'pm', 'case study', 'example', 'scenario'
        ]
        
        # Keywords that indicate casual conversation
        casual_keywords = [
            'hi', 'hello', 'hey', 'thanks', 'thank you', 'bye', 'goodbye',
            'how are you', 'what\'s up', 'sup', 'nice', 'cool', 'ok', 'okay'
        ]
        
        message_lower = message.lower().strip()
        
        # Rule 1: Check for casual greetings/chit-chat
        # Very short messages (3 words or less) with casual keywords are likely casual
        if message_lower in casual_keywords or len(message_lower.split()) <= 3:
            if any(word in message_lower for word in casual_keywords):
                return False  # It's casual chat
        
        # Rule 2: Check for document-related keywords
        # If message contains words like "book", "chapter", "author", etc.
        if any(keyword in message_lower for keyword in document_keywords):
            return True  # It's a document question
        
        # Rule 3: Check conversation history for context
        # If previous messages were about the document, follow-ups likely are too
        if self.chat_history:
            last_few = self.chat_history[-4:]  # Last 2 exchanges
            for msg in last_few:
                if msg["role"] == "user":
                    # If previous user message had document keywords, this might be a follow-up
                    if any(keyword in msg["content"].lower() for keyword in document_keywords):
                        return True
        
        # Rule 4: Default behavior
        # Substantial messages (> 3 words) are treated as document questions
        # Very short messages without clear intent default to casual
        return len(message_lower.split()) > 3
    
    def chat(self, message: str) -> dict:
        """
        Main chat method - processes user messages and returns responses.
        
        This is the core method that handles all chat interactions. It:
        1. Detects if the message is casual chat or a document question
        2. Routes to appropriate handler (direct OpenAI or RAG)
        3. Maintains conversation history
        4. Returns formatted response with sources
        
        Args:
            message (str): User's message/question
            
        Returns:
            dict: Response dictionary with:
                - answer (str): The AI-generated answer
                - source_documents (list): List of source documents (empty for casual chat)
        """
        # Format chat history for use in prompts
        chat_history_str = self._format_chat_history()
        
        # Smart detection: Is this casual chat or a document question?
        is_doc_question = self._is_document_question(message)
        
        # Log for debugging
        print(f"Original question: {message}")
        print(f"Is document question: {is_doc_question}")
        
        if is_doc_question:
            # ============================================================
            # RAG PATH: Document Question
            # ============================================================
            # Uses Retrieval-Augmented Generation:
            # 1. Generate standalone query
            # 2. Search vector database
            # 3. Generate answer with context
            
            # Step 1: Generate standalone query from conversation context
            # Converts "Who wrote it?" → "Who wrote the book about PM interviews?"
            standalone_query = self.standalone_query_chain.invoke({
                "question": message,
                "chat_history": chat_history_str
            })
            
            print(f"Standalone query: {standalone_query}")
            
            # Step 2: Use standalone query to retrieve relevant documents
            # Searches the vector database for chunks similar to the query
            docs = self.retriever.invoke(standalone_query)
            
            # Step 3: Generate answer using retrieved context
            # Combines: retrieved documents + user question + conversation history
            # → Sends to OpenAI → Gets intelligent, context-aware answer
            response = self.answer_chain.invoke({
                "question": message,                    # Original question
                "standalone_query": standalone_query,   # Standalone version
                "chat_history": chat_history_str        # Previous conversation
            })
            
            # Update conversation history
            self.chat_history.append({"role": "user", "content": message})
            self.chat_history.append({"role": "assistant", "content": response})
            
            # Return response with source documents
            return {
                "answer": response,
                "source_documents": [
                    {
                        # Truncate long content for display (first 500 chars)
                        "content": doc.page_content[:500] + "..." if len(doc.page_content) > 500 else doc.page_content,
                        "metadata": doc.metadata  # Page number, source file, etc.
                    }
                    for doc in docs[:3]  # Top 3 most relevant sources
                ]
            }
        else:
            # ============================================================
            # CASUAL CHAT PATH: Direct OpenAI Response
            # ============================================================
            # For casual chat, we don't need document retrieval
            # Just use OpenAI directly for a friendly response
            
            # Create a simple prompt for casual conversation
            casual_prompt = f"""You are a friendly AI assistant. The user is having a casual conversation.
Previous conversation:
{chat_history_str}

User: {message}
Assistant:"""
            
            # Get response from OpenAI (no RAG, no document search)
            response = self.llm.invoke(casual_prompt)
            
            # Extract content from response object
            if hasattr(response, 'content'):
                answer = response.content  # LangChain message object
            else:
                answer = str(response)  # Fallback
            
            print(f"Casual chat response: {answer[:50]}...")
            
            # Update conversation history
            self.chat_history.append({"role": "user", "content": message})
            self.chat_history.append({"role": "assistant", "content": answer})
            
            # Return response without sources (casual chat doesn't need them)
            return {
                "answer": answer,
                "source_documents": []  # No sources for casual chat
            }
    
    def clear_history(self) -> None:
        """
        Clear conversation history.
        
        This resets the chat history, allowing users to start a fresh
        conversation without any context from previous messages.
        """
        self.chat_history = []
        print("Conversation history cleared")
