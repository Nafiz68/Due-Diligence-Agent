# Due Diligence Backend (Node.js + Express)

AI-powered backend for automating due diligence questionnaires with document analysis, AI answer generation, and evaluation capabilities.

## Features

- **Document Management**: Upload and process PDF documents
- **Vector Search**: Semantic search using ChromaDB and HuggingFace embeddings
- **Questionnaire Parsing**: Parse CSV/Excel files into structured questions
- **AI Answer Generation**: Generate answers using Groq LLM with citations
- **Human Review**: Review and edit AI-generated answers
- **Evaluation**: Evaluate answers against ground-truth data
- **Async Processing**: Background job processing with Bull and Redis

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express
- **Database**: MongoDB + Mongoose
- **Vector Database**: ChromaDB
- **Queue**: Bull + Redis
- **AI/ML**: 
  - Groq API (llama-3.1-70b-versatile)
  - HuggingFace Inference API (sentence-transformers/all-MiniLM-L6-v2)
- **File Processing**: Multer, pdf-parse, xlsx, csv-parse

## Prerequisites

- Node.js 18+
- MongoDB
- Redis
- ChromaDB server
- Groq API key
- HuggingFace API key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
```env
MONGODB_URI=mongodb://localhost:27017/due-diligence
REDIS_HOST=localhost
REDIS_PORT=6379
GROQ_API_KEY=your_groq_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
CHROMA_HOST=localhost
CHROMA_PORT=8000
```

## Running the Application

### Start ChromaDB (if not running):
```bash
# Using Docker
docker run -p 8000:8000 chromadb/chroma

# Or using Python
pip install chromadb
chroma run --host localhost --port 8000
```

### Start MongoDB and Redis:
```bash
# MongoDB
mongod

# Redis
redis-server
```

### Start the API server:
```bash
npm run dev
```

### Start the worker (in a separate terminal):
```bash
npm run worker
```

## API Endpoints

### Documents
- `POST /api/documents` - Upload PDF document
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `GET /api/documents/search?query=...` - Search documents
- `DELETE /api/documents/:id` - Delete document

### Questionnaires
- `POST /api/questionnaires` - Upload questionnaire (CSV/Excel)
- `GET /api/questionnaires` - Get all questionnaires
- `GET /api/questionnaires/:id` - Get questionnaire by ID
- `GET /api/questionnaires/:id/questions` - Get questions
- `DELETE /api/questionnaires/:id` - Delete questionnaire

### Answers
- `POST /api/answers/generate/question/:questionId` - Generate answer for a question
- `POST /api/answers/generate/questionnaire/:questionnaireId` - Generate all answers
- `GET /api/answers/questionnaire/:questionnaireId` - Get answers
- `GET /api/answers/:id` - Get answer by ID
- `PATCH /api/answers/:id/review` - Review and update answer
- `DELETE /api/answers/:id` - Delete answer

### Evaluation
- `GET /api/evaluations/answer/:answerId` - Evaluate single answer
- `GET /api/evaluations/questionnaire/:questionnaireId` - Evaluate all answers
- `POST /api/evaluations/ground-truth/question/:questionId` - Set ground truth
- `GET /api/evaluations/ground-truth/question/:questionId` - Get ground truth
- `GET /api/evaluations/ground-truth/questionnaire/:questionnaireId` - Get all ground truths

## Project Structure

```
backend-node/
├── src/
│   ├── config/          # Configuration files (DB, Redis, ChromaDB, etc.)
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── queues/          # Bull job queues
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   ├── server.js        # Main server file
│   └── worker.js        # Background worker
├── uploads/             # Uploaded files
├── package.json
└── .env
```

## Workflow

1. **Upload Documents**: Upload company PDFs → Extracted and chunked → Embedded → Stored in ChromaDB
2. **Upload Questionnaire**: Upload CSV/Excel → Parsed into questions → Stored in MongoDB
3. **Generate Answers**: Questions + Document search → AI generates answers with citations
4. **Review Answers**: Human reviews and edits AI-generated answers
5. **Evaluate**: Compare answers against ground truth → Calculate metrics

## Development

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## License

MIT
