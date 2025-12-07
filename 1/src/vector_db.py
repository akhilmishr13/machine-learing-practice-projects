"""
Vector Database Module - FAISS and HuggingFace Embeddings

This module handles:
1. Converting text documents into vector embeddings
2. Storing embeddings in a FAISS vector database
3. Performing similarity searches to find relevant documents

Key Concepts:
- Embeddings: Numerical representations of text that capture meaning
- Vector Database: Database optimized for storing and searching vectors
- Similarity Search: Finding documents with similar meaning to a query

Author: Project 1 - LLM Practice Projects
"""

import os
from typing import List, Optional
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from sentence_transformers import SentenceTransformer
from langchain.embeddings.base import Embeddings


class HuggingFaceEmbeddingsWrapper(Embeddings):
    """
    Wrapper class to make HuggingFace sentence-transformers compatible with LangChain.
    
    LangChain expects embeddings to have specific methods (embed_documents, embed_query),
    but HuggingFace models have a different interface. This wrapper bridges the gap.
    
    Attributes:
        model_name (str): Name of the HuggingFace model to use
        model (SentenceTransformer): The actual embedding model
    """
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize the embedding model.
        
        Args:
            model_name (str): HuggingFace model name
                Default: "all-MiniLM-L6-v2" - fast, 384-dimensional embeddings
        """
        self.model_name = model_name
        # Load the pre-trained model from HuggingFace
        # This model converts text into 384-dimensional vectors
        self.model = SentenceTransformer(model_name)
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Convert a list of documents into embeddings.
        
        This is used when processing documents to store in the vector database.
        Each document becomes a vector (list of numbers).
        
        Args:
            texts (List[str]): List of text documents to embed
            
        Returns:
            List[List[float]]: List of embedding vectors (each is a list of 384 numbers)
        """
        # Encode all texts at once (more efficient than one-by-one)
        embeddings = self.model.encode(texts, show_progress_bar=False)
        # Convert numpy array to Python list
        return embeddings.tolist()
    
    def embed_query(self, text: str) -> List[float]:
        """
        Convert a single query text into an embedding.
        
        This is used when searching - we convert the user's question into
        a vector, then find documents with similar vectors.
        
        Args:
            text (str): Query text to embed
            
        Returns:
            List[float]: Embedding vector (list of 384 numbers)
        """
        # Encode the query (wrapped in a list, then take first element)
        embedding = self.model.encode([text], show_progress_bar=False)
        return embedding[0].tolist()


class VectorDB:
    """
    Vector Database Manager - Handles document storage and retrieval using FAISS.
    
    This class manages the entire lifecycle of the vector database:
    - Creating embeddings from PDF documents
    - Storing embeddings in FAISS
    - Saving/loading from disk (persistence)
    - Performing similarity searches
    
    Attributes:
        embeddings (HuggingFaceEmbeddingsWrapper): Embedding model
        vector_store (Optional[FAISS]): The FAISS vector database
        text_splitter (RecursiveCharacterTextSplitter): Splits documents into chunks
    """
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        """
        Initialize the vector database manager.
        
        Args:
            model_name (str): HuggingFace embedding model name
        """
        # Initialize embedding model (converts text to vectors)
        self.embeddings = HuggingFaceEmbeddingsWrapper(model_name)
        
        # Vector store will be created when we load/create documents
        self.vector_store: Optional[FAISS] = None
        
        # Text splitter configuration
        # Why split? Large documents are hard to search efficiently
        # Chunks allow finding specific relevant parts
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,      # Each chunk is ~1000 characters
            chunk_overlap=200,    # 200 characters overlap between chunks (for context)
            length_function=len,  # Use character count for length
        )
    
    def create_from_pdf(self, pdf_path: str) -> None:
        """
        Create vector database from a PDF file.
        
        Process:
        1. Load PDF and extract text
        2. Split text into chunks (for efficient searching)
        3. Convert chunks to embeddings (vectors)
        4. Store in FAISS vector database
        
        This is a one-time operation - the result is saved to disk
        and loaded on subsequent runs (no re-ingestion).
        
        Args:
            pdf_path (str): Path to the PDF file to process
            
        Raises:
            FileNotFoundError: If PDF file doesn't exist
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        # Step 1: Load PDF and extract text
        # PyPDFLoader reads the PDF page by page and extracts text
        print(f"Loading PDF: {pdf_path}")
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()  # Returns list of Document objects (one per page)
        
        # Step 2: Split documents into smaller chunks
        # Large pages are split into smaller pieces for better search results
        print(f"Split into chunks...")
        chunks = self.text_splitter.split_documents(documents)
        print(f"Created {len(chunks)} chunks")
        
        # Step 3: Create vector store from chunks
        # This converts each chunk to an embedding and stores in FAISS
        # FAISS is optimized for fast similarity search
        print("Creating vector store...")
        self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        print("Vector store created successfully!")
    
    def save(self, save_path: str) -> None:
        """
        Save vector store to disk for persistence.
        
        Saves two files:
        - index.faiss: The vector data
        - index.pkl: Metadata (document text, page numbers, etc.)
        
        This allows us to load the vector store on next startup
        without re-processing the PDF (much faster!).
        
        Args:
            save_path (str): Directory path where to save the vector store
            
        Raises:
            ValueError: If vector store hasn't been created yet
        """
        if self.vector_store is None:
            raise ValueError("No vector store to save. Create one first.")
        
        # Create directory if it doesn't exist
        os.makedirs(save_path, exist_ok=True)
        # Save to disk
        self.vector_store.save_local(save_path)
        print(f"Vector store saved to {save_path}")
    
    def load(self, load_path: str) -> None:
        """
        Load vector store from disk.
        
        This is much faster than creating from PDF (takes < 2 seconds vs minutes).
        The vector store must have been previously saved using save().
        
        Args:
            load_path (str): Directory path where the vector store is saved
            
        Raises:
            FileNotFoundError: If vector store doesn't exist at the path
        """
        if not os.path.exists(load_path):
            raise FileNotFoundError(f"Vector store not found at {load_path}")
        
        # Load from disk
        # allow_dangerous_deserialization=True is needed for FAISS to load
        # (it's safe as long as you trust the source of the files)
        self.vector_store = FAISS.load_local(
            load_path, 
            self.embeddings,  # Need embeddings to decode the vectors
            allow_dangerous_deserialization=True
        )
        print(f"Vector store loaded from {load_path}")
    
    def get_retriever(self, k: int = 4):
        """
        Get a retriever object for searching the vector database.
        
        A retriever is a LangChain abstraction that provides a consistent
        interface for searching, regardless of the underlying vector store.
        
        Args:
            k (int): Number of documents to retrieve (default: 4)
                    This is the "top k" most similar documents
            
        Returns:
            VectorStoreRetriever: Retriever object for searching
            
        Raises:
            ValueError: If vector store hasn't been initialized
        """
        if self.vector_store is None:
            raise ValueError("Vector store not initialized. Load or create one first.")
        
        # Create retriever with k documents to return
        return self.vector_store.as_retriever(search_kwargs={"k": k})
    
    def similarity_search(self, query: str, k: int = 4):
        """
        Perform similarity search directly (without retriever).
        
        This is a lower-level method. Usually you'd use get_retriever() instead.
        
        Args:
            query (str): Search query text
            k (int): Number of similar documents to return
            
        Returns:
            List[Document]: List of most similar document chunks
            
        Raises:
            ValueError: If vector store hasn't been initialized
        """
        if self.vector_store is None:
            raise ValueError("Vector store not initialized")
        
        # Convert query to embedding, find k most similar document embeddings
        return self.vector_store.similarity_search(query, k=k)

