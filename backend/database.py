# ==============================================================================
# 1. DATABASE CONFIGURATION (SQLAlchemy Connection & Session Management)
# ==============================================================================

import os
from typing import Generator
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session

# Load environment variables from .env file
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "FATAL: DATABASE_URL environment variable is not set. "
        "Example: postgresql://user:pass@localhost:5432/kelana"
    )

# Engine manages the connection pool to the database
engine_kwargs = {"pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20
    engine_kwargs["pool_recycle"] = 1800

engine = create_engine(DATABASE_URL, **engine_kwargs)

# SessionLocal is a factory that generates new database sessions
SessionLocal = sessionmaker(bind=engine, autoflush=False)

# Base class that maintains a catalog of ORM classes and database tables
Base = declarative_base()


def init_db() -> None:
    """Create all SQLAlchemy tables for the configured database."""
    # import all models so their metadata is registered before create_all
    import models.user  # noqa: F401
    import models.trip  # noqa: F401
    import models.conversation  # noqa: F401
    Base.metadata.create_all(bind=engine)


# FastAPI Dependency using Generator (yield) to ensure session cleanup
def get_db() -> Generator[Session, None, None]:
    """Provide a database session per request and close it after completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
