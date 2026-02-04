# Chat System Setup Guide

The chat feature requires ALL these services running in parallel:

## Required Services

### 1. **ChromaDB** (Vector Database)
- **Command**: `python start_chroma.py`
- **Port**: 8000
- **Purpose**: Stores and searches document embeddings
- **Status Check**: Visit `http://localhost:8000/docs`

### 2. **MongoDB** (Document Store)
- **Must be running** at `mongodb://localhost:27017`
- **Purpose**: Stores uploaded documents and their metadata
- **Check**: MongoDBCompass or `mongosh`

### 3. **Redis** (Job Queue)
- **Must be running** at `localhost:6379`
- **Purpose**: Manages document processing jobs
- **Check**: `redis-cli ping`

### 4. **Backend Server** (Node.js API)
- **Command**: `cd backend-node && npm start`
- **Port**: 5000
- **Purpose**: API endpoints for chat, documents, etc.
- **Depends on**: ChromaDB, MongoDB, Redis

### 5. **Worker Process** (Node.js Job Processor)
- **Command**: `cd backend-node && npm run worker`
- **Purpose**: Processes queued documents (extracts text, generates embeddings, indexes in ChromaDB)
- **Critical for**: Document indexing - WITHOUT THIS, DOCUMENTS WON'T BE INDEXED
- **Depends on**: MongoDB, Redis, ChromaDB

### 6. **Frontend** (React/Vite)
- **Command**: `cd frontend && npm run dev`
- **Port**: 5174
- **Purpose**: User interface

## Quick Start Sequence

```powershell
# Terminal 1 - ChromaDB
python start_chroma.py

# Terminal 2 - Backend Server (wait for MongoDB/Redis connection logs)
cd backend-node
npm start

# Terminal 3 - Worker (ESSENTIAL for document processing)
cd backend-node
npm run worker

# Terminal 4 - Frontend
cd frontend
npm run dev
```

## How Chat Works

1. **User uploads document** → Saved to MongoDB with status "pending"
2. **Job queued in Redis** → Waiting for worker to process
3. **Worker picks up job** → (THIS IS CRITICAL!)
   - Extracts text from PDF
   - Chunks text into 1000-char pieces with 200-char overlap
   - Generates embeddings using HuggingFace model
   - Stores chunks in ChromaDB with embeddings
   - Updates MongoDB status to "completed"
4. **User asks question in chat**
   - Frontend sends message to `/api/chat/sessions/{id}/messages`
   - Backend searches ChromaDB for relevant chunks
   - Groq AI generates answer based on document chunks
   - Response includes citations and confidence scores
5. **Chat displays answer** with source citations

## Troubleshooting

### ❌ "No documents available" error in chat
**Solution**: 
- Ensure **worker process is running** (`npm run worker`)
- Check document status on Chat page
- Upload a PDF document
- Wait for status to show "Processing..."
- Status should change to "Ready for Chat" with indexed chunks

### ❌ "No documents in ChromaDB" error
**Causes**:
- Worker is not running
- ChromaDB is not running
- Documents failed to process

**Solution**:
1. Check backend logs for document processing errors
2. Verify ChromaDB is running: `http://localhost:8000/docs`
3. Start worker: `cd backend-node && npm run worker`

### ❌ Chat returns empty responses
**Causes**:
- Groq API key not set (missing `GROQ_API_KEY` in `.env`)
- ChromaDB not returning relevant chunks
- Groq API is down or rate limited

**Solution**:
1. Add `GROQ_API_KEY` to `backend-node/.env`
2. Check backend logs for Groq errors
3. Verify document chunks are in ChromaDB

### ❌ Backend crashes when uploading documents
**Causes**:
- MongoDB not connected
- Redis not connected
- Invalid file path

**Solution**:
1. Ensure MongoDB is running
2. Ensure Redis is running
3. Check that uploads folder exists

## Environment Variables

Create `backend-node/.env`:

```
# MongoDB
MONGODB_URI=mongodb://localhost:27017/due-diligence

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Groq API (required for chat)
GROQ_API_KEY=your_groq_api_key_here

# Optional
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5174
```

## Monitoring

### Check Document Status
Visit: `http://localhost:5174/chat` - Shows real-time document indexing status

### Backend Logs
- Document processing
- ChromaDB queries
- Groq API calls
- Worker job status

### Document Lifecycle
1. **MongoDB**: Upload document → stored with status
2. **Redis**: Job queued
3. **Worker**: Processes document
4. **ChromaDB**: Chunks indexed with embeddings
5. **Chat**: Searches and finds relevant chunks

## Document Processing Details

**Chunk Size**: 1000 characters with 200 character overlap
**Embeddings**: HuggingFace sentence-transformers (384-dimensional)
**Search**: Cosine similarity in ChromaDB
**Top K Results**: 5 most relevant chunks per query

This enables the AI to have context from all uploaded documents when answering questions!
