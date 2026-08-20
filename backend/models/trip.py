# ==============================================================================
# 2. ORM MODELS (Database Table Definition via SQLAlchemy)
# ==============================================================================

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

# WHY: Models define the exact database schema and handle table persistence.
class Trip(Base):
    __tablename__   = "trips"
    id              = Column(Integer,   primary_key=True)
    destination     = Column(String,    nullable=False)
    days            = Column(Integer,   nullable=False)
    budget          = Column(Float,     nullable=False)
    category        = Column(String,    nullable=False)
    daily_budget    = Column(Float,     nullable=False)

    # CONCEPT: server_default=func.now() tells database server (e.g. Postgres)
    # to generate the timestamp upon INSERT, keeping it timezone-aware.    
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

