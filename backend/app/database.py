import os
import re
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from backend.app.config import settings

# Normalize database URL for async drivers
database_url = settings.DATABASE_URL
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif database_url.startswith("sqlite:///") and not database_url.startswith("sqlite+aiosqlite:///"):
    database_url = database_url.replace("sqlite:///", "sqlite+aiosqlite:///", 1)

# Async engine
engine = create_async_engine(
    database_url,
    echo=False,
    future=True,
    pool_pre_ping=True if not database_url.startswith("sqlite") else False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI Dependency for database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create all database tables on startup if they don't exist and ensure new columns exist."""
    # Import all models to register with Base.metadata
    from backend.app import models  # noqa
    from sqlalchemy import text
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Safe column additions for existing SQLite/PostgreSQL databases
        for col, col_type in [("screenshot_url", "TEXT"), ("customer_phone", "VARCHAR(32)"), ("screenshot_analysis", "TEXT")]:
            try:
                await conn.execute(text(f"ALTER TABLE cases ADD COLUMN {col} {col_type}"))
            except Exception:
                pass
