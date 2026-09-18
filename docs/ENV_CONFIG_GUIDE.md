# RESOLVE AI — Environment & Credential Setup Guide

## 1. Required Environment Variables

Configure these variables in your root `.env` file or n8n environment variables:

```bash
# ==============================================================================
# RESOLVE AI - Core Environment Configuration
# ==============================================================================

# Application Environment
ENVIRONMENT=development
LOG_LEVEL=INFO
DEBUG=True

# Database (PostgreSQL URL or SQLite fallback)
DATABASE_URL=sqlite+aiosqlite:///./resolve_ai.db
# For live PostgreSQL: postgresql+asyncpg://postgres:postgres@localhost:5432/resolve_ai

# Security & Authentication
JWT_SECRET=super_secret_jwt_key_change_me_in_production_min_32_chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Internal System Authentication (For n8n / Internal microservice calls)
INTERNAL_API_KEY=resolve_ai_internal_secure_token_change_in_production

# AI Orchestration (n8n Cloud / Local n8n)
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_placeholder
N8N_WEBHOOK_SECRET=resolve_ai_webhook_secret_key

# Knowledge / Memory Layer (Cognee Cloud)
COGNEE_API_URL=https://api.cognee.ai
COGNEE_API_KEY=your_cognee_api_key_placeholder

# LLM Provider Configuration
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key_placeholder
AI_MODEL_NAME=gemini-1.5-pro

# Frontend & Backend Ports
FRONTEND_URL=http://localhost:5173
BACKEND_PORT=8000
FASTAPI_BASE_URL=http://localhost:8000
```

---

## 2. n8n Credential Configuration

Inside your n8n workspace, configure these credentials:

1. **FastAPI Internal API Key Credential**:
   - **Type**: Header Auth
   - **Name**: `FastAPI Internal Auth`
   - **Header Name**: `X-Internal-API-Key`
   - **Header Value**: `resolve_ai_internal_secure_token_change_in_production`

2. **Cognee Cloud Credential** (Optional for cloud memory):
   - **Type**: Header Auth
   - **Name**: `Cognee API Auth`
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer your_cognee_api_key`

3. **Gemini / OpenAI LLM Credential** (Optional for LLM nodes):
   - **Type**: OpenAI API / Google Gemini API
   - **API Key**: Configured in n8n credential vault.

---

## 3. Security Best Practices
- **Never commit `.env` or credential secrets into Git.**
- **Use n8n Environment Variables** (`$env.FASTAPI_BASE_URL`) rather than hardcoded URLs.
- **All financial simulator actions require valid idempotency keys.**
