# Deployment Guide

This guide provides step-by-step instructions for deploying LLM Lab to production.

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Pros**: Easy setup, automatic deployments, free tier available  
**Cons**: Cold starts on free tier

### Option 2: Vercel (Frontend) + Render (Backend)

**Pros**: Similar to Railway, good free tier  
**Cons**: Slower cold starts

### Option 3: Netlify (Frontend) + Railway/Render (Backend)

**Pros**: Alternative to Vercel  
**Cons**: More configuration needed

## Step-by-Step Deployment

### 1. Prepare Repository

```bash
# Initialize git repository
cd llm-lab
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin <your-github-url>
git branch -M main
git push -u origin main
```

### 2. Deploy Backend (Railway)

#### Via Railway CLI

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

#### Via Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:
   ```
   OPENAI_API_KEY=your_key_here          # Optional
   ANTHROPIC_API_KEY=your_key_here       # Optional
   DATABASE_URL=sqlite+aiosqlite:///./llm_lab.db
   ```

6. Deploy and note your backend URL (e.g., `https://your-app.railway.app`)

### 3. Deploy Frontend (Vercel)

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts:
# - Project name: llm-lab
# - Framework: Next.js
# - Build settings: default
```

#### Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

6. Deploy

### 4. Verify Deployment

1. Visit your frontend URL (e.g., `https://llm-lab.vercel.app`)
2. Test creating an experiment
3. Check browser console for errors
4. Verify backend API at `https://your-backend.railway.app/docs`

## Backend Deployment (Render)

Alternative to Railway:

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: llm-lab-backend
   - **Region**: Choose closest to your users
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables (same as Railway)

6. Create Web Service

## Environment Variables Reference

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No | - | OpenAI API key for GPT models |
| `ANTHROPIC_API_KEY` | No | - | Anthropic API key for Claude models |
| `DATABASE_URL` | No | SQLite | Database connection string |
| `PORT` | Auto-set | 8000 | Server port (set by hosting platform) |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | - | Backend API URL |

## Database Configuration

### SQLite (Default)

- Works out of the box
- Stored in container filesystem
- **Data persists** if using Railway volumes

### PostgreSQL (Production Recommended)

1. Create PostgreSQL database (Railway/Render provide free tier)

2. Update `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
   ```

3. Install additional dependency:
   ```bash
   # Add to requirements.txt
   asyncpg==0.29.0
   ```

4. Deploy with new configuration

## Custom Domain Setup

### Frontend (Vercel)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Backend (Railway)

1. Go to Project Settings → Domains
2. Add custom domain
3. Update frontend `NEXT_PUBLIC_API_URL` to use new domain

## CORS Configuration

For production, update CORS settings in `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-domain.com",
        "https://www.your-domain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Monitoring Setup

### Railway/Render Logs

Both platforms provide built-in log viewing:
- Railway: View logs in dashboard
- Render: View logs under "Logs" tab

### Error Tracking (Optional)

Add Sentry for error tracking:

1. Install Sentry:
   ```bash
   # Backend
   pip install sentry-sdk[fastapi]
   
   # Frontend
   npm install @sentry/nextjs
   ```

2. Configure Sentry in your code

3. Add `SENTRY_DSN` environment variable

## Performance Optimization

### Frontend

1. **Enable Analytics** (Vercel):
   - Go to Project Settings → Analytics
   - Monitor Web Vitals

2. **Image Optimization**:
   - Use Next.js Image component
   - Configure image domains in `next.config.js`

### Backend

1. **Increase Concurrency**:
   ```bash
   # Update start command
   uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
   ```

2. **Add Redis Caching** (optional):
   - Add Redis database on Railway/Render
   - Implement caching layer

## Troubleshooting

### Frontend Can't Connect to Backend

**Problem**: CORS errors or network failures

**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend is deployed and healthy
3. Verify CORS settings allow frontend domain
4. Check backend logs for errors

### Database Errors

**Problem**: SQLite locked or connection errors

**Solutions**:
1. For SQLite: Enable Railway volumes for persistence
2. For production: Migrate to PostgreSQL
3. Check `DATABASE_URL` format

### Cold Starts

**Problem**: First request takes long time

**Solutions**:
1. Upgrade to paid tier (no cold starts)
2. Use a health check service to ping periodically
3. Implement warming strategy

### API Key Errors

**Problem**: LLM API calls failing

**Solutions**:
1. Verify API keys are set correctly
2. Check API key has sufficient credits
3. Use Mock mode for testing without keys

## CI/CD Setup

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g railway
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

## Backup Strategy

### Database Backup

For PostgreSQL:
```bash
# Automated backups available on Railway/Render
# Or manual backup:
pg_dump $DATABASE_URL > backup.sql
```

For SQLite:
```bash
# Download from Railway/Render:
railway run sqlite3 llm_lab.db ".backup backup.db"
```

### Code Backup

- GitHub repository serves as primary backup
- Tag releases: `git tag v1.0.0 && git push --tags`

## Scaling Considerations

### Horizontal Scaling

1. **Backend**: Increase number of instances
2. **Database**: Use connection pooling
3. **Caching**: Add Redis for API response caching

### Vertical Scaling

1. **Backend**: Increase CPU/RAM on Railway/Render
2. **Database**: Upgrade PostgreSQL plan

## Cost Estimation

### Free Tier

- **Vercel**: Free for personal projects
- **Railway**: $5 credit/month (enough for small apps)
- **Render**: Free tier available (with cold starts)

### Estimated Monthly Cost (Light Usage)

- Frontend (Vercel): $0 (free tier)
- Backend (Railway/Render): $5-10
- Database (PostgreSQL): $0-5
- **Total**: $5-15/month

## Security Checklist

- [ ] API keys stored in environment variables only
- [ ] CORS configured for production domains
- [ ] HTTPS enabled (automatic on Vercel/Railway/Render)
- [ ] Database connection encrypted
- [ ] Input validation enabled (Pydantic)
- [ ] Error messages sanitized (no stack traces)
- [ ] Rate limiting (recommended for production)

## Post-Deployment

1. **Test all features**:
   - Create experiment
   - View results
   - Export data
   - Check history

2. **Monitor performance**:
   - Check response times
   - Monitor error rates
   - Review logs

3. **Update documentation**:
   - Add deployed URLs to README
   - Update demo video with live URL

## Support

For deployment issues:
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Render: [render.com/docs](https://render.com/docs)

---

**Deployment Checklist Complete** ✓

