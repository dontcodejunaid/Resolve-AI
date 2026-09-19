from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.database import init_db, AsyncSessionLocal
from backend.app.database_seeder import seed_database
from backend.app.mongodb import init_mongo, close_mongo, sync_entire_db_to_mongo
from backend.app.routes import (
    api_v1,
    auth,
    cases,
    orders,
    employee,
    merchant,
    internal,
    demo,
    simulator,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database and Seed Baseline Data
    print("Starting RESOLVE AI Backend Engine...")
    await init_db()
    await init_mongo()
    await seed_database()
    
    # Sync full state to MongoDB Atlas
    try:
        async with AsyncSessionLocal() as session:
            await sync_entire_db_to_mongo(session)
    except Exception as e:
        print(f"[MongoDB Startup Sync Warning] {e}")

    yield
    # Shutdown
    print("Shutting down RESOLVE AI Backend Engine...")
    await close_mongo()


app = FastAPI(
    title="RESOLVE AI — Autonomous AI Customer-Service Teammate API",
    description="One Teammate. One Case. A Verified Outcome. Autonomous payment and order mismatch resolution engine.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev & demo flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(orders.router)
app.include_router(employee.router)
app.include_router(merchant.router)
app.include_router(internal.router)
app.include_router(demo.router)
app.include_router(simulator.router)
app.include_router(api_v1.router)


@app.get("/", tags=["System"])
async def root():
    return {
        "service": "RESOLVE AI API Engine",
        "tagline": "One teammate. One case. A verified outcome.",
        "environment": "SIMULATED PAYMENT ENVIRONMENT",
        "status": "OPERATIONAL",
        "version": "1.0.0"
    }


@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "HEALTHY",
        "database": "CONNECTED",
        "rules_engine": "ACTIVE",
        "ai_orchestrator": "READY",
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[UNHANDLED EXCEPTION] {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal Server Error: {str(exc)}"},
    )
