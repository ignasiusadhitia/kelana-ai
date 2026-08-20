# ==============================================================================
# 1. DATABASE CONFIGURATION (SQLAlchemy Connection & Session Management)
# ==============================================================================

from typing import Generator
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
import os

# Load evironment variables from .env file (never hardcode connection strings)
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# CONCEPT: Engine manages the connection pool to the database.
engine = create_engine(DATABASE_URL)

# CONCEPT: SessionLocal is a factory that generates new database sessions.
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# CONCEPT: Base class that maintains a catalog of ORM classes and database tables.
Base = declarative_base()

def init_db() -> None:
    """Create all database tables defined by models inheriting from Base."""
    Base.metadata.create_all(bind=engine)

# CONCEPT: FastAPI Dependency using Generator (yield) to ensure session cleanup.
def get_db() -> Generator[Session, None, None]:
    """Provide a database session per request and close it after completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
