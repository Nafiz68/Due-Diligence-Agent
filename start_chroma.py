import chromadb
from chromadb.config import Settings
import uvicorn

# Start ChromaDB HTTP server
if __name__ == "__main__":
    print("Starting ChromaDB server on http://localhost:8000")
    uvicorn.run(
        "chromadb.app:app",
        host="localhost",
        port=8000,
        log_level="info"
    )
