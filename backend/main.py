# ==============================================================================
# MAIN APPLICATION CONTROLLER (FastAPI Router & Lifecycle Entry Point)
# ==============================================================================

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from views.auth_views import router as auth_router
from views.trip_views import router as trip_router
from views.assistant_views import router as assistant_router

app = FastAPI(
    title="KelanaAI API",
    description="Backend API for travel planning, budget calculation, and secure multi-user management.",
    version="1.1.0"
)

# Configure CORS middleware to allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
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


@app.get("/")
def home() -> dict[str, str]:
    """Root endpoint welcoming users."""
    return {
        "message": "Welcome to KelanaAI API"
    }


@app.get("/health")
def health() -> dict[str, str]:
    """Health check endpoint to verify service availability."""
    return {
        "status": "OK"
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)