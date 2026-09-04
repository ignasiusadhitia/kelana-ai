# ==============================================================================
# MAIN APPLICATION CONTROLLER (FastAPI Router & Lifecycle Entry Point)
# ==============================================================================

import os
import uvicorn
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import init_db, SessionLocal
from views.auth_views import router as auth_router
from views.trip_views import router as trip_router
from views.assistant_views import router as assistant_router
from views.conversation_views import router as conversation_router

app = FastAPI(
    title="KelanaAI API",
    description="Backend API for travel planning, budget calculation, and secure multi-user management.",
    version="1.2.0"
)

# Configure CORS middleware with strict origin validation
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database schema & run modular idempotent migrations on startup
init_db()

# Mount Modular API Routers
app.include_router(auth_router)
app.include_router(trip_router)
app.include_router(assistant_router)
app.include_router(conversation_router, prefix="/api/v1/conversations", tags=["Conversations"])


@app.get("/")
def home() -> dict[str, str]:
    """Root endpoint welcoming users."""
    return {
        "message": "Welcome to KelanaAI API"
    }


@app.get("/health")
def health(response: Response) -> dict[str, str]:
    """Health check endpoint to verify API and database connectivity."""
    db_status = "connected"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = f"disconnected: {e}"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "UNHEALTHY",
            "database": db_status
        }

    return {
        "status": "OK",
        "database": db_status
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)