import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database: Async SQLAlchemy URL (Supports PostgreSQL and SQLite)
    DATABASE_URL: str = "sqlite+aiosqlite:///./resolve_ai.db"

    # MongoDB Atlas Connection
    MONGODB_URI: Optional[str] = None
    MONGODB_DB_NAME: str = "resolve_ai"

    # Security & JWT
    JWT_SECRET: str = "super_secret_jwt_key_change_me_in_production_min_32_chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # Internal API key for microservice & n8n workflow authentication
    INTERNAL_API_KEY: str = "resolve_ai_internal_secure_token_change_in_production"

    # n8n Orchestration Layer
    N8N_BASE_URL: Optional[str] = None
    N8N_WEBHOOK_URL: Optional[str] = None
    N8N_API_KEY: Optional[str] = None
    N8N_WEBHOOK_SECRET: Optional[str] = None

    # Cognee Knowledge Layer
    COGNEE_API_URL: Optional[str] = "https://api.cognee.ai"
    COGNEE_API_KEY: Optional[str] = None

    # AI Model Provider
    AI_PROVIDER: str = "gemini"
    AI_API_KEY: Optional[str] = None
    AI_MODEL_NAME: str = "gemini-1.5-pro"

    # Frontend URL for CORS
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
