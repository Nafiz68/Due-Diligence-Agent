# Due Diligence Questionnaire Agent

AI-powered full-stack application that automates due diligence questionnaires using advanced AI technologies. The system indexes company documents, parses questionnaire files, generates accurate answers with citations, enables human review, and evaluates performance against ground truth data.

## 🎯 Features

### 1. **Document Management**
- Upload and process PDF documents
- Automatic text extraction and chunking
- Vector embeddings generation using HuggingFace
- Semantic search with ChromaDB

### 2. **Questionnaire Processing**
- Upload CSV/Excel questionnaire files
- Automatic parsing into structured questions
- Support for multiple question types
- Category and subcategory organization

### 3. **AI Answer Generation**
- Powered by Groq LLM (llama-3.1-70b-versatile)
- Context-aware answers based on document search
- Citations with relevance scores
- Confidence scoring

### 4. **Human Review**
- Review AI-generated answers
- Edit and refine responses
- Add review notes
- Approval workflow

### 5. **Evaluation & Metrics**
- Compare against ground truth data
- Similarity scoring (Jaccard, Levenshtein)
- Accuracy metrics and pass rates
- Detailed evaluation reports

## 🏗️ Architecture

```
Due Diligence Agent
├── backend-node/          # Node.js + Express backend
│   ├── src/
│   │   ├── config/        # DB, Redis, ChromaDB, Groq, HuggingFace
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API endpoints
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── queues/        # Bull job queues
│   │   └── middleware/    # Express middleware
│   └── uploads/           # Uploaded files
│
└── frontend/              # React + TypeScript frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── pages/         # Page components
    │   ├── lib/api/       # API client
    │   ├── store/         # Zustand stores
    │   └── utils/         # Helper functions
    └── public/
```

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express
- **Database**: MongoDB + Mongoose
- **Vector DB**: ChromaDB
- **Queue**: Bull + Redis
- **AI/ML**:
  - Groq API (llama-3.1-70b-versatile) for answer generation
  - HuggingFace Inference API (sentence-transformers/all-MiniLM-L6-v2) for embeddings
- **File Processing**: Multer, pdf-parse, xlsx, csv-parse
- **Validation**: Joi

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **HTTP**: Axios
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React, react-dropzone, react-pdf, react-markdown

## 📋 Prerequisites

- **Node.js** 18+
- **MongoDB** 4.4+
- **Redis** 6.0+
- **ChromaDB** server
- **API Keys**:
  - Groq API key
  - HuggingFace API key

## 🛠️ Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd DueDiligence
```

### 2. Backend Setup

```bash
cd backend-node

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your credentials
```

**Environment Variables** (`.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/due-diligence
REDIS_HOST=localhost
REDIS_PORT=6379
GROQ_API_KEY=your_groq_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
CHROMA_HOST=localhost
CHROMA_PORT=8000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env
```

**Environment Variables** (`.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Services

**Start MongoDB:**
```bash
mongod
```

**Start Redis:**
```bash
redis-server
```

**Start ChromaDB:**
```bash
# Option 1: Docker
docker run -p 8000:8000 chromadb/chroma

# Option 2: Python
pip install chromadb
chroma run --host localhost --port 8000
```

**Start Backend API:**
```bash
cd backend-node
npm run dev  # Development mode with nodemon
```

**Start Background Worker:**
```bash
cd backend-node
npm run worker  # In a separate terminal
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

## 📱 Usage

### Access the Application
Open your browser and navigate to: `http://localhost:5173`

### Workflow

1. **Upload Documents** 
   - Navigate to Documents page
   - Drag and drop PDF files or click to select
   - Documents are automatically processed, chunked, and embedded

2. **Upload Questionnaire**
   - Go to Questionnaires page
   - Upload CSV or Excel file with questions
   - File is parsed and questions are stored

3. **Generate Answers**
   - Select a questionnaire
   - Click "Generate Answers"
   - AI processes each question and searches relevant documents
   - Generates answers with citations and confidence scores

4. **Review & Edit**
   - Navigate to Review page
   - View AI-generated answers
   - Edit as needed and add review notes
   - Approve answers

5. **Evaluate Performance**
   - Go to Evaluation page
   - Set ground truth answers
   - Run evaluation to compare AI vs. ground truth
   - View metrics: similarity, accuracy, pass rates

## 🔌 API Endpoints

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/search?query=...` - Search documents
- `DELETE /api/documents/:id` - Delete document

### Questionnaires
- `POST /api/questionnaires` - Upload questionnaire
- `GET /api/questionnaires` - List questionnaires
- `GET /api/questionnaires/:id` - Get questionnaire
- `GET /api/questionnaires/:id/questions` - Get questions
- `DELETE /api/questionnaires/:id` - Delete questionnaire

### Answers
- `POST /api/answers/generate/question/:questionId` - Generate answer
- `POST /api/answers/generate/questionnaire/:questionnaireId` - Generate all
- `GET /api/answers/questionnaire/:questionnaireId` - Get answers
- `GET /api/answers/:id` - Get answer details
- `PATCH /api/answers/:id/review` - Review answer
- `DELETE /api/answers/:id` - Delete answer

### Evaluation
- `GET /api/evaluations/answer/:answerId` - Evaluate answer
- `GET /api/evaluations/questionnaire/:questionnaireId` - Evaluate all
- `POST /api/evaluations/ground-truth/question/:questionId` - Set ground truth
- `GET /api/evaluations/ground-truth/question/:questionId` - Get ground truth

## 🧪 Development

### Backend Development
```bash
cd backend-node
npm run dev  # Auto-reload with nodemon
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload with Vite
```

### Build for Production
```bash
# Backend
cd backend-node
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure Details

### Backend Models
- **Document**: PDF documents with extracted text and chunks
- **Questionnaire**: Uploaded questionnaire files
- **Question**: Individual questions from questionnaires
- **Answer**: AI-generated answers with citations
- **GroundTruth**: Reference answers for evaluation

### Frontend Components
- **Layout**: Sidebar navigation and main layout
- **Documents**: Upload and list components
- **Questionnaires**: Management interface
- **Answers**: Review and editing interface
- **Evaluation**: Metrics and comparison views

## 🔧 Configuration

### Questionnaire File Format

**CSV/Excel columns** (flexible naming):
- `question` / `Question` / `questionText`
- `number` / `questionNumber`
- `category` / `Category`
- `subcategory` / `Subcategory`
- `answerType` / `type`
- `required`

**Example CSV:**
```csv
Question,Category,Subcategory
"What is your company's revenue?",Financial,Revenue
"How many employees do you have?",Company Info,Team Size
```

## Dataset Testing
- Sample PDFs live in `data/` and are intended for ingestion and QA smoke tests.
- Use `data/ILPA_Due_Diligence_Questionnaire_v1.2.pdf` as the questionnaire input
  and the other PDFs as reference documents for answering.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT

## 🙏 Acknowledgments

- **Groq** for lightning-fast LLM inference
- **HuggingFace** for embedding models
- **ChromaDB** for vector storage
- **MongoDB** for document storage
- **React** and the amazing ecosystem

---

Built with ❤️ using Node.js, React, and AI
