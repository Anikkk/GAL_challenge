# LLM Lab - Response Quality Analyzer

A professional full-stack web application for experimenting with Large Language Model parameters and analyzing response quality through custom programmatic metrics.

![LLM Lab](https://img.shields.io/badge/LLM-Lab-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🌟 Features

- **Parameter Experimentation**: Generate multiple LLM responses with different temperature and top_p combinations
- **Custom Quality Metrics**: 6 programmatic metrics that evaluate response quality without using another LLM
- **Visual Comparison**: Interactive charts and visualizations to compare responses
- **Data Persistence**: Save and retrieve experiments for later analysis
- **Export Functionality**: Export experiments to JSON or CSV format
- **Modern UI/UX**: Responsive design with smooth animations and professional styling
- **Mock Mode**: Test the application without API keys using intelligent mock responses

## 📊 Quality Metrics

Our custom metrics evaluate responses across multiple dimensions:

### 1. **Coherence Score** (0.0 - 1.0)
- **What it measures**: Text coherence based on transition words and repetition patterns
- **Rationale**: Coherent text uses logical connectors and avoids excessive repetition
- **How it works**: Analyzes transition word usage and detects phrase repetition using n-gram analysis

### 2. **Lexical Diversity** (0.0 - 1.0)
- **What it measures**: Type-Token Ratio (TTR) - ratio of unique words to total words
- **Rationale**: Higher diversity indicates richer vocabulary and less repetitive responses
- **How it works**: Calculates unique word ratio with adjustments for text length using moving-average TTR

### 3. **Completeness Score** (0.0 - 1.0)
- **What it measures**: Whether response appears complete based on structural cues
- **Rationale**: Complete responses end with proper punctuation and have logical conclusions
- **How it works**: Checks for proper endings, sentence count, and conclusion indicators

### 4. **Structure Score** (0.0 - 1.0)
- **What it measures**: Structural quality (paragraphs, lists, formatting)
- **Rationale**: Well-structured responses use paragraphs, lists, and proper formatting
- **How it works**: Detects paragraphs, lists, headers, and analyzes sentence length variation

### 5. **Readability Score** (0.0 - 1.0)
- **What it measures**: Simplified Flesch Reading Ease approximation
- **Rationale**: Readable text balances sentence and word length appropriately
- **How it works**: Evaluates average words per sentence and characters per word against optimal ranges

### 6. **Length Appropriateness** (0.0 - 1.0)
- **What it measures**: Whether response length is appropriate (not too short or verbose)
- **Rationale**: Quality responses are typically 75-300 words for most prompts
- **How it works**: Scores based on word count with optimal range of 75-300 words

### 7. **Overall Score** (0.0 - 1.0)
- **What it measures**: Weighted average of all metrics
- **Weights**: Coherence (25%), Completeness (25%), Lexical Diversity (15%), Structure (15%), Readability (10%), Length (10%)

## 🏗️ Architecture

### Technology Stack

**Frontend**
- Next.js 15 with App Router (SSR)
- TypeScript for type safety
- TanStack Query for state management
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons

**Backend**
- FastAPI (Python)
- SQLAlchemy with async support
- SQLite database (easily upgradeable to PostgreSQL)
- OpenAI & Anthropic API integration
- Pydantic for data validation

### System Architecture

```
┌─────────────────┐
│   Next.js UI    │
│  (Port 3000)    │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  FastAPI Server │
│  (Port 8000)    │
└────────┬────────┘
         │
    ┌────┴────┬──────────┐
    │         │          │
┌───▼──┐  ┌──▼───┐  ┌──▼────┐
│SQLite│  │OpenAI│  │Metrics│
│  DB  │  │ API  │  │Engine │
└──────┘  └──────┘  └───────┘
```

### Data Flow

1. User submits prompt + parameters via UI
2. Frontend sends request to FastAPI backend
3. Backend generates responses using LLM API (or mock)
4. For each response, metrics engine calculates quality scores
5. All data persisted to SQLite database
6. Results returned to frontend with metrics
7. UI displays interactive visualizations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+ (3.13 recommended)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd llm-lab
```

2. **Backend Setup**
```bash
cd backend

# Create virtual environment
python3.13 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Optional: Configure API keys
cp .env.example .env
# Edit .env and add your API keys (optional - app works without them)
```

3. **Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Configure API URL (optional)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

4. **Run the Application**

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

5. **Access the Application**

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs

## 📖 Usage Guide

### Creating an Experiment

1. **Enter your prompt** in the text area
2. Click "Show Advanced Settings" to customize:
   - Model selection (GPT-3.5, GPT-4, Claude, or Mock)
   - Temperature values (comma-separated, e.g., `0.3, 0.7, 1.0`)
   - Top P values (comma-separated, e.g., `0.9, 1.0`)
3. Click "Generate & Analyze Responses"
4. Wait for responses to be generated and analyzed

### Analyzing Results

- **Best Response Banner**: Shows the highest-scoring response
- **Overall Quality Chart**: Bar chart comparing all responses
- **Response Selector**: Click any response to view detailed metrics
- **Radar Chart**: Visual representation of metric breakdown
- **Individual Metrics**: Progress bars for each quality metric
- **Response Content**: Full text of selected response

### Managing Experiments

- **History Tab**: View all past experiments
- **View Button**: Load and analyze previous experiments
- **Delete Button**: Remove experiments from database
- **Export Button**: Download experiment data as JSON

## 🌐 Deployment

### Backend Deployment (Railway / Render)

1. **Create `railway.toml` or Render service**
```toml
[build]
builder = "nixpacks"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
restartPolicyType = "always"
```

2. **Set environment variables**:
   - `OPENAI_API_KEY` (optional)
   - `ANTHROPIC_API_KEY` (optional)
   - `DATABASE_URL` (optional, defaults to SQLite)

### Frontend Deployment (Vercel)

1. **Push to GitHub**
2. **Import to Vercel**
3. **Configure**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Framework Preset: Next.js
4. **Add environment variable**:
   - `NEXT_PUBLIC_API_URL`: Your backend URL

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`)
```env
OPENAI_API_KEY=your_key_here          # Optional
ANTHROPIC_API_KEY=your_key_here       # Optional
DATABASE_URL=sqlite+aiosqlite:///./llm_lab.db
```

**Frontend** (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

The application includes comprehensive error handling and works in multiple modes:

- **With API Keys**: Full LLM functionality
- **Without API Keys**: Intelligent mock responses that vary by parameters
- **Error Handling**: Graceful degradation on API failures

## 📁 Project Structure

```
llm-lab/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI application
│   │   ├── database.py       # Database configuration
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── llm_service.py    # LLM API integration
│   │   └── metrics.py        # Quality metrics engine
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Main page
│   │   ├── providers.tsx     # React Query setup
│   │   └── globals.css
│   ├── components/
│   │   ├── ExperimentForm.tsx
│   │   ├── ResultsDisplay.tsx
│   │   └── ExperimentHistory.tsx
│   ├── lib/
│   │   └── api.ts            # API client
│   ├── package.json
│   └── tsconfig.json
├── time_estimates.csv         # Project time tracking
└── README.md
```

## 🎯 Key Design Decisions

### 1. **Metrics Design**
- **Programmatic approach**: No LLM-based evaluation ensures reproducibility and cost-effectiveness
- **Multi-dimensional**: 6 metrics cover different aspects of quality
- **Weighted scoring**: Overall score prioritizes coherence and completeness
- **Transparent**: All metrics have clear rationale and implementation

### 2. **Architecture Choices**
- **Separation of concerns**: Backend handles LLM calls and metrics, frontend focuses on UX
- **Async operations**: FastAPI with async/await for concurrent LLM requests
- **Type safety**: TypeScript frontend, Pydantic backend validation
- **Scalability**: SQLAlchemy allows easy migration to PostgreSQL

### 3. **UI/UX Decisions**
- **Gradual disclosure**: Advanced settings hidden by default
- **Real-time feedback**: Loading states and error messages
- **Visual hierarchy**: Color coding for best responses
- **Responsive design**: Works on mobile, tablet, and desktop
- **Accessibility**: Semantic HTML and ARIA labels

### 4. **Performance Optimizations**
- **Parallel generation**: Multiple LLM requests run concurrently
- **Client-side caching**: TanStack Query reduces unnecessary API calls
- **Server-side rendering**: Next.js SSR for better initial load
- **Lazy loading**: Charts render only when needed

## 🚧 Trade-offs and Future Improvements

### Current Trade-offs

1. **SQLite Database**: Easy setup but not ideal for production scale
   - **Future**: Migrate to PostgreSQL for better concurrency

2. **Mock Responses**: Simplified when no API keys available
   - **Future**: More sophisticated mock engine with greater variety

3. **Single Prompt Analysis**: One prompt at a time
   - **Future**: Batch processing for multiple prompts

4. **Limited Model Support**: OpenAI and Anthropic only
   - **Future**: Add support for other providers (Cohere, Llama, etc.)

### Future Enhancements

- **Comparison Mode**: Side-by-side comparison of two responses
- **Custom Metrics**: Allow users to define their own metrics
- **A/B Testing**: Statistical significance testing between parameter sets
- **Prompt Templates**: Save and reuse common prompts
- **Team Collaboration**: Share experiments with team members
- **Advanced Analytics**: Trends over time, parameter optimization suggestions
- **API Rate Limiting**: Built-in rate limiting for API protection
- **User Authentication**: Secure multi-user support

## 🧩 Challenges Faced & Solutions

### Challenge 1: Python 3.14 Compatibility
- **Problem**: Initial venv used Python 3.14, incompatible with pydantic-core
- **Solution**: Downgraded to Python 3.13 for better library support

### Challenge 2: Metrics Design
- **Problem**: Defining meaningful metrics without LLM evaluation
- **Solution**: Research into NLP techniques (TTR, coherence analysis, structural patterns)

### Challenge 3: Parameter Combination Management
- **Problem**: Handling multiple parameter combinations efficiently
- **Solution**: Async/await pattern for concurrent generation

### Challenge 4: Real-time UI Updates
- **Problem**: Showing progress during long-running generations
- **Solution**: TanStack Query with loading states and optimistic updates

## 📝 API Documentation

API documentation is automatically available via FastAPI's built-in Swagger UI:
- Local: http://localhost:8000/docs
- Interactive API testing included

### Key Endpoints

- `POST /api/generate` - Generate responses with metrics
- `GET /api/experiments` - List all experiments
- `GET /api/experiments/{id}` - Get specific experiment
- `DELETE /api/experiments/{id}` - Delete experiment
- `POST /api/export` - Export experiments (JSON/CSV)
- `GET /api/metrics/info` - Get metrics documentation

## 📄 License

This project was created for the GenAI-Labs Challenge.

## 🙏 Acknowledgments

- OpenAI and Anthropic for LLM APIs
- FastAPI and Next.js communities for excellent frameworks
- Recharts for beautiful visualizations

## 📧 Contact

For questions or feedback about this submission, please refer to the demo video or source code comments.

---

**Built with ❤️ for the GenAI-Labs Challenge**

