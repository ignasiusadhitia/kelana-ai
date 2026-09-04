# ==============================================================================
# 5. MODELS: User Entity (Traveler Profiles & Relationships)
# ==============================================================================

from sqlalchemy import Column, BigInteger, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from utils.nanoid_gen import generate_id

class User(Base):
    """
    User database model representing registered travelers in KelanaAI.
    Enforces uniqueness on email and establishes 1-to-Many relationship with Trips.
    Exposes secure public_id (usr_...) for client references.
    """
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    public_id = Column(String(32), unique=True, index=True, nullable=False, default=lambda: generate_id("usr"))
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    default_travel_style = Column(String(50), nullable=True, default="Family")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    trips = relationship("Trip", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
