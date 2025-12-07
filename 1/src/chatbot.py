"""OpenAI-powered conversational chatbot with RAG."""

import os
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage

from .vector_db import VectorDB

load_dotenv()


class ConversationBot:
    """Conversational bot powered by OpenAI with RAG capabilities."""
    
    def __init__(self, vector_db: VectorDB, model: str = "gpt-3.5-turbo"):
        """
        Initialize the conversation bot.
        
        Args:
            vector_db: VectorDB instance
            model: OpenAI model name
        """
        self.vector_db = vector_db
        self.model = model
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        # Initialize LangChain components
        self.llm = ChatOpenAI(
            model=model,
            temperature=0.7,
            openai_api_key=api_key
        )
        
        # Conversation history
        self.chat_history: List[Dict[str, str]] = []
        
        # Initialize RAG chain
        self.retriever = self.vector_db.get_retriever(k=4)
        self._initialize_chain()
    
    def _initialize_chain(self) -> None:
        """Initialize the RAG chain using LCEL with standalone query generation."""
        # Standalone query generation prompt
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
        
        # Answer generation prompt
        answer_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful AI assistant that answers questions based on the provided context from documents.
Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that you don't know, don't try to make up an answer.

Context: {context}

Previous conversation:
{chat_history}"""),
            ("human", "{question}")
        ])
        
        # Create standalone query generator
        self.standalone_query_chain = (
            standalone_query_prompt
            | self.llm
            | StrOutputParser()
        )
        
        # Create the answer chain
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)
        
        def get_context(standalone_query: str):
            # Use the standalone query to search the vector DB
            docs = self.retriever.invoke(standalone_query)
            return format_docs(docs)
        
        self.answer_chain = (
            {
                "context": lambda x: get_context(x["standalone_query"]),
                "question": lambda x: x["question"],
                "chat_history": lambda x: self._format_chat_history()
            }
            | answer_prompt
            | self.llm
            | StrOutputParser()
        )
    
    def _format_chat_history(self) -> str:
        """Format chat history as a string for the prompt."""
        if not self.chat_history:
            return "No previous conversation."
        
        history_text = ""
        for msg in self.chat_history[-6:]:  # Last 6 messages (3 exchanges)
            role = "User" if msg["role"] == "user" else "Assistant"
            history_text += f"{role}: {msg['content']}\n"
        return history_text
    
    def _is_document_question(self, message: str) -> bool:
        """
        Determine if the message is asking about the document content.
        
        Args:
            message: User's message
            
        Returns:
            True if it's a document-related question, False for casual chat
        """
        # Keywords that suggest document-related questions
        document_keywords = [
            'book', 'document', 'pdf', 'text', 'chapter', 'page', 'author', 'content',
            'what is', 'tell me about', 'explain', 'describe', 'how does', 'what are',
            'interview', 'product manager', 'pm', 'case study', 'example', 'scenario'
        ]
        
        # Casual chat indicators
        casual_keywords = [
            'hi', 'hello', 'hey', 'thanks', 'thank you', 'bye', 'goodbye',
            'how are you', 'what\'s up', 'sup', 'nice', 'cool', 'ok', 'okay'
        ]
        
        message_lower = message.lower().strip()
        
        # Check for casual greetings/chit-chat
        if message_lower in casual_keywords or len(message_lower.split()) <= 3:
            # Very short messages are likely casual
            if any(word in message_lower for word in casual_keywords):
                return False
        
        # Check if message contains document-related keywords
        if any(keyword in message_lower for keyword in document_keywords):
            return True
        
        # Check conversation history - if previous messages were about the document
        if self.chat_history:
            last_few = self.chat_history[-4:]  # Last 2 exchanges
            for msg in last_few:
                if msg["role"] == "user":
                    if any(keyword in msg["content"].lower() for keyword in document_keywords):
                        return True
        
        # Default: treat as document question if message is substantial
        return len(message_lower.split()) > 3
    
    def chat(self, message: str) -> dict:
        """
        Process a chat message and return response.
        
        Args:
            message: User's message
            
        Returns:
            Dictionary with 'answer' and 'source_documents'
        """
        # Format chat history for standalone query generation
        chat_history_str = self._format_chat_history()
        
        # Check if this is a document question or casual chat
        is_doc_question = self._is_document_question(message)
        
        print(f"Original question: {message}")
        print(f"Is document question: {is_doc_question}")
        
        if is_doc_question:
            # Step 1: Generate standalone query from conversation context
            standalone_query = self.standalone_query_chain.invoke({
                "question": message,
                "chat_history": chat_history_str
            })
            
            print(f"Standalone query: {standalone_query}")
            
            # Step 2: Use standalone query to retrieve relevant documents
            docs = self.retriever.invoke(standalone_query)
            
            # Step 3: Generate answer using context and conversation history
            response = self.answer_chain.invoke({
                "question": message,
                "standalone_query": standalone_query,
                "chat_history": chat_history_str
            })
            
            # Add to history
            self.chat_history.append({"role": "user", "content": message})
            self.chat_history.append({"role": "assistant", "content": response})
            
            return {
                "answer": response,
                "source_documents": [
                    {
                        "content": doc.page_content[:500] + "..." if len(doc.page_content) > 500 else doc.page_content,
                        "metadata": doc.metadata
                    }
                    for doc in docs[:3]  # Top 3 sources
                ]
            }
        else:
            # Casual chat - use OpenAI directly without RAG
            casual_prompt = f"""You are a friendly AI assistant. The user is having a casual conversation.
Previous conversation:
{chat_history_str}

User: {message}
Assistant:"""
            
            response = self.llm.invoke(casual_prompt)
            if hasattr(response, 'content'):
                answer = response.content
            else:
                answer = str(response)
            
            print(f"Casual chat response: {answer[:50]}...")
            
            # Add to history
            self.chat_history.append({"role": "user", "content": message})
            self.chat_history.append({"role": "assistant", "content": answer})
            
            return {
                "answer": answer,
                "source_documents": []  # No sources for casual chat
            }
    
    def clear_history(self) -> None:
        """Clear conversation history."""
        self.chat_history = []
        print("Conversation history cleared")
