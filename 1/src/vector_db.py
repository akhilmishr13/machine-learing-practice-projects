"""Vector database creation and management using FAISS and HuggingFace embeddings."""

import os
from typing import List, Optional
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from sentence_transformers import SentenceTransformer
from langchain.embeddings.base import Embeddings


class HuggingFaceEmbeddingsWrapper(Embeddings):
    """Wrapper for HuggingFace sentence-transformers to work with LangChain."""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = SentenceTransformer(model_name)
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, show_progress_bar=False)
        return embeddings.tolist()
    
    def embed_query(self, text: str) -> List[float]:
        embedding = self.model.encode([text], show_progress_bar=False)
        return embedding[0].tolist()


class VectorDB:
    """Manage vector database for document storage and retrieval."""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.embeddings = HuggingFaceEmbeddingsWrapper(model_name)
        self.vector_store: Optional[FAISS] = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
    
    def create_from_pdf(self, pdf_path: str) -> None:
        """
        Create vector database from a PDF file.
        
        Args:
            pdf_path: Path to the PDF file
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")
        
        print(f"Loading PDF: {pdf_path}")
        loader = PyPDFLoader(pdf_path)
        documents = loader.load()
        
        print(f"Split into chunks...")
        chunks = self.text_splitter.split_documents(documents)
        print(f"Created {len(chunks)} chunks")
        
        print("Creating vector store...")
        self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        print("Vector store created successfully!")
    
    def save(self, save_path: str) -> None:
        """Save vector store to disk."""
        if self.vector_store is None:
            raise ValueError("No vector store to save. Create one first.")
        
        os.makedirs(save_path, exist_ok=True)
        self.vector_store.save_local(save_path)
        print(f"Vector store saved to {save_path}")
    
    def load(self, load_path: str) -> None:
        """Load vector store from disk."""
        if not os.path.exists(load_path):
            raise FileNotFoundError(f"Vector store not found at {load_path}")
        
        self.vector_store = FAISS.load_local(
            load_path, 
            self.embeddings, 
            allow_dangerous_deserialization=True
        )
        print(f"Vector store loaded from {load_path}")
    
    def get_retriever(self, k: int = 4):
        """Get a retriever from the vector store."""
        if self.vector_store is None:
            raise ValueError("Vector store not initialized")
        
        return self.vector_store.as_retriever(search_kwargs={"k": k})
    
    def similarity_search(self, query: str, k: int = 4):
        """Perform similarity search."""
        if self.vector_store is None:
            raise ValueError("Vector store not initialized")
        
        return self.vector_store.similarity_search(query, k=k)

