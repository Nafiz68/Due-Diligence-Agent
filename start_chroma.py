import chromadb
from chromadb.config import Settings
import uvicorn
import os

# Start ChromaDB HTTP server
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting ChromaDB server on http://0.0.0.0:{port}")
    uvicorn.run(
        "chromadb.app:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    )
