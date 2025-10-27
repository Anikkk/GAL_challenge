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

```



