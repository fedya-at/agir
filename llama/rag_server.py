from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flasgger import Swagger
from langchain.chains import RetrievalQA
from langchain.callbacks.base import BaseCallbackHandler
from langchain_ollama import OllamaLLM
from langchain_ollama import OllamaEmbeddings
from langchain_chroma import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.prompts import PromptTemplate
from langchain.memory import ConversationSummaryBufferMemory
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor
from pydantic_settings import BaseSettings
import os
import logging
import queue
import json
import requests
from datetime import datetime, timezone
from typing import Any, Dict, List
import re
import string


# --- Configuration Management ---
class Settings(BaseSettings):
    ollama_base_url: str = "http://localhost:11434"
    default_model: str = "llama3.2:1b"
    embedding_model: str = "nomic-embed-text"
    persist_directory: str = "data"
    allowed_origins: list = ["http://localhost:5173", "http://127.0.0.1:5173"]

    class Config:
        env_file = ".env"


settings = Settings()


# --- Enhanced Error Handling & Logging ---
class StructuredLogger:
    @staticmethod
    def log(level, message, extra=None):
        log_entry = {
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "level": logging.getLevelName(level),
            "message": message,
            **({"extra": extra} if extra else {})
        }
        logging.log(level, json.dumps(log_entry))


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)

app = Flask(__name__)
CORS(app, origins=settings.allowed_origins)

# --- Rate Limiting ---
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour", "20 per minute"]
)

# --- API Documentation with Swagger ---
swagger = Swagger(app, template={
    "swagger": "2.0",
    "info": {
        "title": "Improved RAG Chatbot API",
        "description": "Enhanced API for computer troubleshooting chatbot using RAG",
        "version": "2.0.0"
    }
})


# --- Custom Streaming Callback Handler ---
class StreamingCallback(BaseCallbackHandler):
    def __init__(self):
        self.queue = queue.Queue()
        self.finished = False

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self.queue.put(token)

    def on_llm_end(self, response: Any, **kwargs: Any) -> None:
        self.finished = True
        self.queue.put(None)  # Signal end of stream

    def on_llm_error(self, error: Exception, **kwargs: Any) -> None:
        self.finished = True
        StructuredLogger.log(logging.ERROR, f"LLM Error: {str(error)}")
        self.queue.put(f"Error: {str(error)}")
        self.queue.put(None)  # Signal end of stream

    def get_tokens(self):
        """Generator that yields tokens from the queue"""
        while not self.finished or not self.queue.empty():
            try:
                token = self.queue.get(timeout=1)
                if token is None:  # End of stream signal
                    break
                yield token.encode("utf-8")
            except queue.Empty:
                continue


# --- RAG Setup ---
FILEPATHS = [
    "troubleshooting-macos-v1a.pdf",
    "CommonProblemsandSolutionsforWindowsOperatingSystems.pdf",
    "TroublesshootingandMaintenance.pdf",
    "Common-Computer-Issues-and-Solutions.pdf"
]

# Global variables for RAG components
vectorstore = None
memory = None
qa_chain = None


def check_ollama_connection():
    """Check if Ollama server is running"""
    try:
        response = requests.get(f"{settings.ollama_base_url}/api/tags", timeout=5)
        return response.status_code == 200
    except Exception as e:
        StructuredLogger.log(logging.ERROR, f"Ollama connection check failed: {str(e)}")
        return False


def preprocess_query(query: str) -> str:
    """Preprocess user query to improve retrieval accuracy"""
    # Remove extra whitespace and normalize
    query = re.sub(r'\s+', ' ', query.strip())

    # Expand common abbreviations
    abbreviations = {
        'pc': 'computer',
        'laptop': 'computer',
        'wifi': 'wireless network',
        'internet': 'network connection',
        'slow': 'performance issue',
        'freeze': 'system freeze',
        'crash': 'system crash',
        'boot': 'startup',
        'startup': 'boot',
        'error': 'problem',
        'issue': 'problem',
        'fix': 'solution',
        'repair': 'solution'
    }

    words = query.lower().split()
    expanded_words = []
    for word in words:
        # Remove punctuation for matching
        clean_word = word.translate(str.maketrans('', '', string.punctuation))
        if clean_word in abbreviations:
            expanded_words.append(abbreviations[clean_word])
        else:
            expanded_words.append(word)

    return ' '.join(expanded_words)


def is_relevant_response(response: str, query: str) -> bool:
    """Check if response is relevant to the query"""
    # Convert to lowercase for comparison
    response_lower = response.lower()
    query_lower = query.lower()

    # Extract key terms from query
    query_terms = set(re.findall(r'\b\w+\b', query_lower))
    response_terms = set(re.findall(r'\b\w+\b', response_lower))

    # Remove common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are',
                  'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
                  'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
                  'we', 'they', 'me', 'him', 'her', 'us', 'them'}

    query_terms = query_terms - stop_words
    response_terms = response_terms - stop_words

    # Check for overlap
    overlap = len(query_terms.intersection(response_terms))
    overlap_ratio = overlap / len(query_terms) if query_terms else 0

    # Check for generic/irrelevant responses
    generic_phrases = [
        "i don't have enough information",
        "based on the context provided",
        "according to the documentation",
        "please contact your administrator",
        "consult the manual"
    ]

    is_generic = any(phrase in response_lower for phrase in generic_phrases)

    # Response is relevant if it has good overlap and isn't too generic
    return overlap_ratio >= 0.3 and not is_generic


def validate_and_improve_response(response: str, query: str, context_docs: List) -> str:
    """Validate response quality and improve if needed"""
    # Check if response is relevant
    if not is_relevant_response(response, query):
        # Try to extract more specific information from context
        relevant_info = []
        query_lower = query.lower()

        for doc in context_docs:
            doc_content = doc.page_content.lower()
            # Look for sentences that contain query terms
            sentences = re.split(r'[.!?]+', doc_content)
            for sentence in sentences:
                if any(term in sentence for term in query_lower.split()):
                    relevant_info.append(sentence.strip())

        if relevant_info:
            # Create a more focused response
            response = f"Based on the troubleshooting documentation: {'. '.join(relevant_info[:2])}."
        else:
            response = "I don't have specific information about this issue in my knowledge base. Please provide more details about the problem you're experiencing."

    # Ensure response is concise (max 200 words)
    words = response.split()
    if len(words) > 200:
        response = ' '.join(words[:200]) + "..."

    # Remove redundant phrases
    redundant_phrases = [
        "based on the context provided, ",
        "according to the documentation, ",
        "the context indicates that ",
        "from the information given, "
    ]

    for phrase in redundant_phrases:
        response = response.replace(phrase, "")

    return response.strip()


def initialize_rag_system():
    """Initialize the RAG system with enhanced configuration"""
    global vectorstore, memory, qa_chain

    try:
        if not check_ollama_connection():
            StructuredLogger.log(logging.ERROR, "Ollama server is not running")
            return False

        StructuredLogger.log(logging.INFO, "Initializing Ollama embeddings...")
        ollama_embeddings = OllamaEmbeddings(
            base_url=settings.ollama_base_url,
            model=settings.embedding_model
        )

        StructuredLogger.log(logging.INFO, "Loading/creating vectorstore...")
        if os.path.exists(settings.persist_directory) and os.listdir(settings.persist_directory):
            StructuredLogger.log(logging.INFO, "Loading existing vectorstore from disk...")
            vectorstore = Chroma(
                embedding_function=ollama_embeddings,
                persist_directory=settings.persist_directory
            )
        else:
            StructuredLogger.log(logging.INFO, "Creating new vectorstore from documents...")
            all_documents = []
            for pdf_path in FILEPATHS:
                if not os.path.exists(pdf_path):
                    StructuredLogger.log(logging.WARNING, f"PDF file not found at {pdf_path}. Skipping...")
                    continue
                try:
                    loader = PyPDFLoader(pdf_path)
                    documents = loader.load()

                    # Add metadata to help with filtering
                    for doc in documents:
                        doc.metadata['source_file'] = pdf_path
                        doc.metadata['doc_type'] = 'troubleshooting_guide'

                    all_documents.extend(documents)
                    StructuredLogger.log(logging.INFO, f"Successfully loaded {pdf_path}")
                except Exception as e:
                    StructuredLogger.log(logging.ERROR, f"Error loading {pdf_path}: {e}")
                    continue

            if not all_documents:
                StructuredLogger.log(logging.ERROR, "No documents loaded. RAG system cannot be initialized.")
                return False

            # Improved text splitting strategy
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=800,  # Smaller chunks for better precision
                chunk_overlap=100,  # Reduced overlap
                length_function=len,
                separators=["\n\n", "\n", ". ", "? ", "! ", " ", ""]  # Better separators
            )
            all_splits = text_splitter.split_documents(all_documents)

            # Add chunk metadata
            for i, chunk in enumerate(all_splits):
                chunk.metadata['chunk_id'] = i
                chunk.metadata['chunk_size'] = len(chunk.page_content)

            vectorstore = Chroma.from_documents(
                documents=all_splits,
                embedding=ollama_embeddings,
                persist_directory=settings.persist_directory
            )
            vectorstore.persist()
            StructuredLogger.log(logging.INFO, "Vectorstore created and persisted successfully.")

        # Initialize LLM with better parameters
        llm = OllamaLLM(
            base_url=settings.ollama_base_url,
            model=settings.default_model,
            verbose=False,
            temperature=0.1,  # Very low for factual responses
            top_k=5,  # More focused
            top_p=0.9,  # Nucleus sampling
            num_ctx=4096,  # Larger context window
            repeat_penalty=1.1  # Reduce repetition
        )

        # Enhanced memory management
        memory = ConversationSummaryBufferMemory(
            llm=llm,
            max_token_limit=1500,  # Reduced to focus on recent context
            memory_key="history",
            return_messages=True,
            input_key="question"
        )

        # Enhanced retriever with more documents and compression
        base_retriever = vectorstore.as_retriever(
            search_type="mmr",  # Maximum Marginal Relevance for diversity
            search_kwargs={
                "k": 6,  # Retrieve more documents initially
                "lambda_mult": 0.7  # Balance between relevance and diversity
            }
        )

        # Add contextual compression to improve relevance
        compressor = LLMChainExtractor.from_llm(llm)
        retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=base_retriever
        )

        # Improved prompt template
        template = """You are a computer repair technician assistant. Answer questions about computer troubleshooting using ONLY the provided context.

IMPORTANT RULES:
1. Give direct, specific answers based on the context
2. If the context doesn't contain relevant information, say "I don't have information about this specific issue"
3. Keep answers concise (1-3 sentences maximum)
4. Focus on actionable solutions
5. Don't make up information not in the context

Context: {context}

Previous conversation: {history}

Question: {question}

Answer (be specific and concise):"""

        prompt = PromptTemplate(
            input_variables=["history", "context", "question"],
            template=template,
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            verbose=False,
            return_source_documents=True,
            chain_type_kwargs={
                "verbose": False,
                "prompt": prompt,
                "memory": memory,
            }
        )

        StructuredLogger.log(logging.INFO, "Enhanced RAG system initialized successfully.")
        return True

    except Exception as e:
        StructuredLogger.log(logging.ERROR, f"Error initializing RAG system: {e}")
        return False


@app.route("/health")
def health_check():
    rag_initialized = all([
        qa_chain is not None,
        vectorstore is not None,
        memory is not None,
        check_ollama_connection()
    ])

    # Get sample document count
    doc_count = 0
    if vectorstore:
        try:
            doc_count = len(vectorstore.get()["documents"])
        except:
            pass

    return jsonify({
        "status": "healthy" if rag_initialized else "initializing",
        "ollama_connected": check_ollama_connection(),
        "vectorstore_ready": vectorstore is not None,
        "documents_loaded": doc_count,
        "memory_ready": memory is not None,
        "qa_chain_ready": qa_chain is not None,
        "rag_initialized": rag_initialized,
        "version": "2.0.0"
    })


@app.route("/api/rag_query", methods=["POST"])
@limiter.limit("10 per minute")
def rag_query():
    """
    Process RAG query with enhanced accuracy
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        user_question = data.get("question")
        selected_model = data.get("model", settings.default_model)

        if not user_question:
            StructuredLogger.log(logging.WARNING, "No question provided in the request.")
            return jsonify({"error": "No question provided"}), 400

        if qa_chain is None:
            StructuredLogger.log(logging.ERROR, "RAG system not initialized")
            return jsonify({"error": "RAG system not initialized"}), 500

        # Preprocess the query for better retrieval
        processed_question = preprocess_query(user_question)

        StructuredLogger.log(logging.INFO, f"Original question: {user_question}")
        StructuredLogger.log(logging.INFO, f"Processed question: {processed_question}")

        # Create a new LLM instance with the selected model
        llm = OllamaLLM(
            base_url=settings.ollama_base_url,
            model=selected_model,
            verbose=False,
            temperature=0.1,
            top_k=5,
            top_p=0.9,
            num_ctx=4096,
            repeat_penalty=1.1
        )

        # Create enhanced retriever
        base_retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 6,
                "lambda_mult": 0.7
            }
        )

        compressor = LLMChainExtractor.from_llm(llm)
        retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=base_retriever
        )

        # Enhanced prompt template
        template = """You are a computer repair technician assistant. Answer questions about computer troubleshooting using ONLY the provided context.

IMPORTANT RULES:
1. Give direct, specific answers based on the context
2. If the context doesn't contain relevant information, say "I don't have information about this specific issue"
3. Keep answers concise (1-3 sentences maximum)
4. Focus on actionable solutions
5. Don't make up information not in the context

Context: {context}

Previous conversation: {history}

Question: {question}

Answer (be specific and concise):"""

        prompt = PromptTemplate(
            input_variables=["history", "context", "question"],
            template=template,
        )

        current_qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            verbose=False,
            return_source_documents=True,
            chain_type_kwargs={
                "verbose": False,
                "prompt": prompt,
                "memory": memory,
            }
        )

        def generate():
            try:
                # Get the full response first
                result = current_qa_chain({"query": processed_question})
                response = result.get("result", "")
                source_docs = result.get("source_documents", [])

                # Validate and improve the response
                improved_response = validate_and_improve_response(response, user_question, source_docs)

                StructuredLogger.log(
                    logging.INFO,
                    f"Query processed successfully",
                    {
                        "original_question": user_question[:100],
                        "processed_question": processed_question[:100],
                        "model": selected_model,
                        "response_length": len(improved_response),
                        "source_docs_count": len(source_docs)
                    }
                )

                # Stream the improved response
                yield improved_response.encode("utf-8")

            except Exception as e:
                StructuredLogger.log(
                    logging.ERROR,
                    f"Error during RAG query: {e}",
                    {"question": user_question[:100], "model": selected_model}
                )
                yield f"Error: {str(e)}".encode("utf-8")

        # Return streaming response
        return Response(
            stream_with_context(generate()),
            mimetype="text/plain",
            headers={"Cache-Control": "no-cache"}
        )

    except Exception as e:
        StructuredLogger.log(logging.ERROR, f"Unexpected error in rag_query: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route("/api/models", methods=["GET"])
def get_available_models():
    """Get available Ollama models"""
    try:
        response = requests.get(f"{settings.ollama_base_url}/api/tags", timeout=10)
        if response.status_code == 200:
            models_data = response.json()
            return jsonify({"models": models_data.get("models", [])})
        else:
            return jsonify({"error": "Failed to fetch models from Ollama"}), 500
    except Exception as e:
        StructuredLogger.log(logging.ERROR, f"Error fetching models: {e}")
        return jsonify({"error": "Failed to connect to Ollama"}), 500


@app.route("/api/clear_memory", methods=["POST"])
def clear_memory():
    """Clear conversation memory"""
    global memory
    if memory:
        memory.clear()
        StructuredLogger.log(logging.INFO, "Conversation memory cleared")
        return jsonify({"message": "Memory cleared successfully"})
    return jsonify({"error": "Memory not initialized"}), 500


@app.route("/api/debug_query", methods=["POST"])
def debug_query():
    """Debug endpoint to see what documents are retrieved for a query"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        user_question = data.get("question")
        if not user_question:
            return jsonify({"error": "No question provided"}), 400

        if vectorstore is None:
            return jsonify({"error": "Vectorstore not initialized"}), 500

        # Preprocess query
        processed_question = preprocess_query(user_question)

        # Get retrieved documents
        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={"k": 6, "lambda_mult": 0.7}
        )

        docs = retriever.get_relevant_documents(processed_question)

        debug_info = {
            "original_question": user_question,
            "processed_question": processed_question,
            "retrieved_docs_count": len(docs),
            "retrieved_docs": [
                {
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "metadata": doc.metadata
                }
                for doc in docs
            ]
        }

        return jsonify(debug_info)

    except Exception as e:
        StructuredLogger.log(logging.ERROR, f"Error in debug_query: {e}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    StructuredLogger.log(logging.INFO, "Starting Enhanced Flask RAG server...")

    # Initialize RAG system
    if not initialize_rag_system():
        StructuredLogger.log(logging.ERROR, "Failed to initialize RAG system. Exiting...")
        exit(1)

    if not check_ollama_connection():
        StructuredLogger.log(logging.WARNING, "Ollama server not accessible. Some features may not work.")

    StructuredLogger.log(logging.INFO, "Starting Enhanced Flask RAG server on http://0.0.0.0:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)

