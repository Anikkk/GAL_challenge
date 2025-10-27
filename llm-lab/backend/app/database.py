from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import StaticPool

# Use in-memory SQLite database with StaticPool to ensure the same connection
# is reused across async calls (prevents "database table is locked" issues)
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create async engine with StaticPool for in-memory database
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Flag to track if tables have been initialized
_tables_initialized = False


async def _initialize_tables():
    """Initialize database tables on first use"""
    global _tables_initialized
    if not _tables_initialized:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        _tables_initialized = True


async def get_db():
    """Dependency for getting database session"""
    # Initialize tables on first session request
    await _initialize_tables()
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


