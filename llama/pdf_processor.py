from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OllamaEmbeddings
from langchain.vectorstores import Chroma
import os

def process_pdfs(pdf_paths, persist_directory="./chroma_db"):
    documents = []
    for pdf_path in pdf_paths:
        loader = PyPDFLoader(pdf_path)
        documents.extend(loader.load())

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    splits = text_splitter.split_documents(documents)

    # Initialize Ollama embeddings (assuming Ollama server is running locally)
    embeddings = OllamaEmbeddings(model="gemma3")

    # Create a Chroma vector store
    vectordb = Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory=persist_directory
    )
    vectordb.persist()
    print(f"Knowledge base created and saved to {persist_directory}")

if __name__ == "__main__":
    # User needs to place their PDF files in the same directory as this script
    # or provide the full paths to their PDFs.
    # For example:
    # pdf_files = ["Hardware.pdf", "Software.pdf"]
    # For now, I'll use placeholder names. User will replace these.
    pdf_files = ["Hardware.pdf", "Software.pdf"]

    # Check if PDF files exist
    for f in pdf_files:
        if not os.path.exists(f):
            print(f"Error: PDF file not found: {f}. Please make sure the PDF files are in the same directory as this script.")
            exit()

    process_pdfs(pdf_files)