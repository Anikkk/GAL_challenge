# LLM Lab - Architecture Documentation

## System Overview

LLM Lab is a full-stack web application designed to help users experiment with Large Language Model parameters and understand their impact on response quality through custom programmatic metrics.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                          │
│                    http://localhost:3000                      │
└───────────────────────────┬───────────────────────────────────┘
                            │
                     HTTP REST API
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                      Next.js Frontend                          │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐     │
│  │   React     │  │  TanStack    │  │    Recharts     │     │
│  │ Components  │  │    Query     │  │ Visualizations  │     │
│  └─────────────┘  └──────────────┘  └─────────────────┘     │
│                                                                │
│  • Server-Side Rendering (SSR)                                │
│  • TypeScript for type safety                                 │
│  • Tailwind CSS for styling                                   │
└───────────────────────────┬───────────────────────────────────┘
                            │
                     HTTP/JSON (Port 8000)
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                     FastAPI Backend                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐     │
│  │   FastAPI   │  │  SQLAlchemy  │  │  Pydantic       │     │
│  │   Routes    │  │   ORM        │  │  Validation     │     │
│  └──────┬──────┘  └──────┬───────┘  └─────────────────┘     │
│         │                 │                                    │
│  ┌──────▼──────┐   ┌─────▼──────┐   ┌─────────────────┐     │
│  │LLM Service  │   │  Database  │   │Metrics Engine   │     │
│  │  Module     │   │   Layer    │   │                 │     │
│  └──────┬──────┘   └────────────┘   └─────────────────┘     │
└─────────┼───────────────────────────────────────────────────┘
          │
    ┌─────┴─────┬──────────────┐
    │           │              │
┌───▼────┐  ┌──▼───────┐  ┌──▼──────┐
│OpenAI  │  │Anthropic │  │ SQLite  │
│  API   │  │   API    │  │   DB    │
└────────┘  └──────────┘  └─────────┘
```

## Frontend Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS 3
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Component Structure

```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Main application page
├── providers.tsx       # TanStack Query setup
└── globals.css         # Global styles

components/
├── ExperimentForm.tsx      # Prompt input and parameter configuration
├── ResultsDisplay.tsx      # Response comparison and metrics visualization
└── ExperimentHistory.tsx   # Past experiments management

lib/
└── api.ts              # API client and type definitions
```

### Data Flow

1. **User Input** → ExperimentForm component
2. **Form Submission** → TanStack Query mutation
3. **API Call** → Backend via Axios
4. **Response** → Cache update via Query invalidation
5. **UI Update** → ResultsDisplay renders with new data

### State Management Strategy

- **Server State**: Managed by TanStack Query
  - Automatic caching
  - Background refetching
  - Optimistic updates
  
- **UI State**: React useState for form inputs and local toggles

- **No Global State**: All data flows through props or Query hooks

## Backend Architecture

### Technology Stack

- **Framework**: FastAPI 0.115
- **Language**: Python 3.13
- **ORM**: SQLAlchemy 2.0 (async)
- **Database**: SQLite (aiosqlite) - easily upgradeable to PostgreSQL
- **Validation**: Pydantic 2.9
- **LLM APIs**: OpenAI SDK, Anthropic SDK

### Module Structure

```
app/
├── __init__.py
├── main.py             # FastAPI app, routes, endpoints
├── database.py         # Database configuration and session management
├── models.py           # SQLAlchemy models (Experiment, Response)
├── schemas.py          # Pydantic schemas for request/response validation
├── llm_service.py      # LLM API integration and mock responses
└── metrics.py          # Custom quality metrics engine
```

### Database Schema

```sql
experiments
├── id (PK)
├── prompt (TEXT)
└── created_at (DATETIME)

responses
├── id (PK)
├── experiment_id (FK → experiments.id)
├── temperature (FLOAT)
├── top_p (FLOAT)
├── model (STRING)
├── content (TEXT)
├── metrics (JSON)
└── created_at (DATETIME)
```

### API Endpoints

#### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Detailed health status |
| POST | `/api/generate` | Generate responses with metrics |
| GET | `/api/experiments` | List all experiments |
| GET | `/api/experiments/{id}` | Get specific experiment |
| DELETE | `/api/experiments/{id}` | Delete experiment |
| POST | `/api/export` | Export experiments (JSON/CSV) |
| GET | `/api/metrics/info` | Get metrics documentation |

#### Request/Response Flow

**Generate Responses Flow**:
```
1. Client sends GenerateRequest
   {
     prompt: string,
     model: string,
     temperature_range: [0.3, 0.7, 1.0],
     top_p_range: [0.9, 1.0]
   }

2. Backend creates Experiment record

3. For each parameter combination:
   - Call LLM API (or mock)
   - Calculate quality metrics
   - Create Response record
   
4. Return ExperimentResponse with all responses and metrics
```

## Metrics Engine

### Design Philosophy

The metrics engine provides **programmatic, reproducible, and transparent** quality assessment without relying on another LLM call.

### Metric Calculation Pipeline

```
Input: Response Text
        ↓
┌───────────────────┐
│  Text Preprocessing│
│  - Tokenization   │
│  - Sentence split │
│  - Word extraction│
└────────┬──────────┘
         ↓
┌────────────────────────────────────────┐
│      Parallel Metric Calculation       │
├────────────────────────────────────────┤
│ • Coherence Score                      │
│   → Transition words detection         │
│   → N-gram repetition analysis         │
│                                        │
│ • Lexical Diversity                    │
│   → Type-Token Ratio                   │
│   → Moving average for long texts      │
│                                        │
│ • Completeness Score                   │
│   → Ending punctuation check           │
│   → Conclusion indicators              │
│                                        │
│ • Structure Score                      │
│   → Paragraph detection                │
│   → List/formatting analysis           │
│                                        │
│ • Readability Score                    │
│   → Sentence length analysis           │
│   → Word complexity estimation         │
│                                        │
│ • Length Appropriateness               │
│   → Word count vs optimal range        │
└────────┬───────────────────────────────┘
         ↓
┌────────────────────┐
│  Overall Score     │
│  (Weighted Avg)    │
└────────┬───────────┘
         ↓
    Return Metrics
```

### Metric Formulas

**Coherence Score**:
```python
transition_ratio = min(transition_count / sentence_count, 1.0)
repetition_penalty = min((max_trigram_count - 1) * 0.1, 0.5)
coherence = (transition_ratio * 0.6) + (0.4 * (1 - repetition_penalty))
```

**Lexical Diversity**:
```python
ttr = unique_words / total_words
# For long texts (>100 words), use moving-average TTR
```

**Overall Score**:
```python
weights = {
    coherence: 0.25,
    lexical_diversity: 0.15,
    completeness: 0.25,
    structure: 0.15,
    readability: 0.10,
    length_appropriateness: 0.10
}
overall = sum(metric * weight for metric, weight in weights.items())
```

## LLM Service Integration

### Multi-Provider Support

```python
class LLMService:
    def __init__(self):
        self.openai_client = AsyncOpenAI() if OPENAI_KEY else None
        self.anthropic_client = AsyncAnthropic() if ANTHROPIC_KEY else None
    
    async def generate_response(self, prompt, model, temp, top_p):
        if model.startswith("gpt") and self.openai_client:
            return await self.generate_response_openai(...)
        elif model.startswith("claude") and self.anthropic_client:
            return await self.generate_response_anthropic(...)
        else:
            return await self.generate_mock_response(...)
```

### Concurrent Generation

```python
# Generate all parameter combinations in parallel
tasks = [
    generate_response(prompt, model, temp, top_p)
    for temp in temperature_range
    for top_p in top_p_range
]
responses = await asyncio.gather(*tasks, return_exceptions=True)
```

## Data Persistence

### Database Layer

- **Async Operations**: All database operations use async/await
- **Session Management**: Dependency injection for session handling
- **Transactions**: Automatic rollback on errors
- **Relationships**: Cascade delete for experiments and responses

### Migration Path

Current SQLite can be migrated to PostgreSQL by:
1. Update `DATABASE_URL` environment variable
2. Install `asyncpg` driver
3. No code changes required (SQLAlchemy abstraction)

## Security Considerations

### API Security

- **CORS**: Configurable allowed origins
- **Input Validation**: Pydantic schemas validate all inputs
- **Error Handling**: Sanitized error messages (no stack traces to client)
- **Rate Limiting**: Recommended for production (not implemented in MVP)

### Data Privacy

- **API Keys**: Stored in environment variables, never in code
- **User Data**: Prompts and responses stored locally (SQLite)
- **No Telemetry**: No data sent to third parties (except LLM APIs)

## Performance Optimizations

### Frontend

1. **Server-Side Rendering**: Initial page load optimized
2. **Code Splitting**: Next.js automatic code splitting
3. **Image Optimization**: Next.js image component
4. **Caching**: TanStack Query caches API responses

### Backend

1. **Async/Await**: Non-blocking I/O for concurrent requests
2. **Connection Pooling**: SQLAlchemy async session pooling
3. **Lazy Loading**: Relationships loaded only when needed
4. **Response Streaming**: Potential future enhancement

## Scalability Considerations

### Current Limitations

- SQLite: Single writer limitation
- No caching layer (Redis)
- No load balancing
- No queue system for long-running tasks

### Scaling Path

1. **Database**: Migrate to PostgreSQL
2. **Caching**: Add Redis for API response caching
3. **Queue**: Add Celery/RQ for async task processing
4. **Load Balancing**: Add Nginx/Traefik
5. **Containerization**: Docker + Kubernetes

## Error Handling Strategy

### Frontend

- **Network Errors**: Show user-friendly messages
- **Validation Errors**: Inline form validation
- **API Errors**: Display error details from backend
- **Loading States**: Clear feedback during operations

### Backend

- **Try-Catch Blocks**: All API endpoints wrapped
- **HTTP Status Codes**: Appropriate codes for each error type
- **Logging**: Comprehensive logging (not shown in MVP)
- **Graceful Degradation**: Mock responses when APIs unavailable

## Testing Strategy

### Current Implementation

- Manual testing during development
- API testing via FastAPI docs (Swagger UI)
- Browser testing for UI/UX

### Future Testing

- **Unit Tests**: pytest for backend, Jest for frontend
- **Integration Tests**: Test full request/response cycle
- **E2E Tests**: Playwright/Cypress for user flows
- **Performance Tests**: Load testing with Locust

## Deployment Architecture

### Development

```
localhost:3000 (Frontend) → localhost:8000 (Backend)
```

### Production (Recommended)

```
┌─────────────┐
│   Vercel    │  (Frontend)
└──────┬──────┘
       │ HTTPS
┌──────▼──────┐
│  Railway/   │  (Backend)
│   Render    │
└─────────────┘
```

## Configuration Management

### Environment Variables

**Backend**:
- `OPENAI_API_KEY`: Optional, for OpenAI models
- `ANTHROPIC_API_KEY`: Optional, for Anthropic models
- `DATABASE_URL`: SQLite by default, PostgreSQL for production

**Frontend**:
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Configuration Files

- `requirements.txt`: Python dependencies
- `package.json`: Node.js dependencies
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `next.config.js`: Next.js configuration

## Monitoring and Observability

### Current Implementation

- Console logging in development
- FastAPI automatic OpenAPI docs
- Network tab debugging in browser

### Production Recommendations

- **Logging**: Structured logging with JSON format
- **Monitoring**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Performance**: New Relic / DataDog
- **Uptime**: Pingdom / UptimeRobot

## Conclusion

This architecture provides a solid foundation for the LLM Lab application with:
- Clear separation of concerns
- Type safety throughout the stack
- Scalable design patterns
- Production-ready error handling
- Comprehensive metric evaluation

The modular design allows for easy extension and maintenance as requirements evolve.

