from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os
from pathlib import Path

# Prefer a DATABASE_URL env var. If not provided, create a sqlite file inside
# a `data/` directory next to the `app` package so we avoid issues with
# relative working directories and permission problems.
env_db_url = os.getenv("DATABASE_URL")
if env_db_url:
    DATABASE_URL = env_db_url
else:
    # place DB under llm-lab/backend/data/llm_lab.db
    app_dir = Path(__file__).resolve().parent
    backend_dir = app_dir.parent
    data_dir = backend_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    db_file = data_dir / "llm_lab.db"
    DATABASE_URL = f"sqlite+aiosqlite:///{db_file}"

# Create async engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()


async def get_db():
    """Dependency for getting database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

