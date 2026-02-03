# Quick Start Guide - Due Diligence Agent

Get up and running in 5 minutes!

## Prerequisites Check

Make sure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] MongoDB installed and running
- [ ] Redis installed and running
- [ ] Groq API key ([Get one here](https://console.groq.com))
- [ ] HuggingFace API key ([Get one here](https://huggingface.co/settings/tokens))

## Step 1: Install Backend Dependencies

```bash
cd backend-node
npm install
```

## Step 2: Configure Backend

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```env
GROQ_API_KEY=your_actual_groq_key_here
HUGGINGFACE_API_KEY=your_actual_huggingface_key_here
```

## Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Step 4: Configure Frontend

```bash
cp .env.example .env
```

The default configuration should work:
```env
VITE_API_URL=http://localhost:5000/api
```

## Step 5: Start Required Services

### Terminal 1: MongoDB
```bash
mongod
```

### Terminal 2: Redis
```bash
redis-server
```

### Terminal 3: ChromaDB
```bash
# Using Docker (recommended)
docker run -p 8000:8000 chromadb/chroma

# OR using Python
pip install chromadb
chroma run --host localhost --port 8000
```

## Step 6: Start Backend

### Terminal 4: Backend API Server
```bash
cd backend-node
npm run dev
```

You should see:
```
Server is running on port 5000
MongoDB Connected: localhost
Redis Connected
```

### Terminal 5: Background Worker
```bash
cd backend-node
npm run worker
```

You should see:
```
Worker is running and processing jobs
Queues: document-processing, questionnaire-processing, answer-generation
```

## Step 7: Start Frontend

### Terminal 6: Frontend Dev Server
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

## Step 8: Access the Application

Open your browser and go to: **http://localhost:5173**

You should see the Due Diligence Agent dashboard with:
- Documents page (default)
- Sidebar navigation
- Upload interface

## Quick Test

1. **Upload a Document**:
   - Go to Documents page
   - Drag and drop a PDF file or click to select
   - Wait for processing to complete (status: "completed")

2. **Upload a Questionnaire** (coming soon):
   - Go to Questionnaires page
   - Upload a CSV file with questions

3. **Generate Answers** (coming soon):
   - Select a questionnaire
   - Click "Generate Answers"
   - View generated answers with citations

## Troubleshooting

### Backend won't start
- Check if MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
- Check if Redis is running: `redis-cli ping` (should return "PONG")
- Check if port 5000 is available

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check if port 5173 is available

### Document processing fails
- Verify ChromaDB is running: visit `http://localhost:8000/api/v1`
- Check HuggingFace API key is valid
- Check backend logs for errors

### Answer generation fails
- Verify Groq API key is valid
- Check if documents are uploaded and processed
- Check worker logs for errors

### CORS errors
- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Default: `CORS_ORIGIN=http://localhost:5173`

## Next Steps

Once everything is running:

1. Upload some test documents from the `data/` folder
2. Wait for them to be processed (check status on Documents page)
3. Create a simple CSV questionnaire or use the sample
4. Generate answers and explore the features!

## Useful Commands

```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Check Redis status
redis-cli ping

# Check ChromaDB
curl http://localhost:8000/api/v1/heartbeat

# View backend logs
cd backend-node && npm run dev

# View worker logs
cd backend-node && npm run worker

# Build frontend for production
cd frontend && npm run build
```

## Getting Help

- Check the main README.md for detailed documentation
- Review backend-node/README.md for backend specifics
- Review frontend/README.md for frontend details
- Open an issue on GitHub for bugs or questions

---

Happy coding! 🚀
