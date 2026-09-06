# ==============================================================================
# 5. MODELS: Trip Entity (Itinerary Ownership & Soft Delete)
# ==============================================================================

from sqlalchemy import Column, BigInteger, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from utils.nanoid_gen import generate_id

class Trip(Base):
    """
    Trip database model representing travel itineraries saved by registered users.
    Foreign key user_id strictly binds each trip to its creator.
    Supports soft delete via deleted_at timestamp.
    Exposes secure public_id (trp_...) for client references.
    """
    __tablename__   = "trips"
    id              = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    public_id       = Column(String(32), unique=True, index=True, nullable=False, default=lambda: generate_id("trp"))
    destination     = Column(String,    nullable=False)
    days            = Column(Integer,   nullable=False)
    budget          = Column(Float,     nullable=False)
    category        = Column(String,    nullable=False)
    daily_budget    = Column(Float,     nullable=False)
    travel_style    = Column(String,    nullable=True, default="Solo")
    created_at      = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    deleted_at      = Column(DateTime(timezone=True), nullable=True, default=None)
    ai_recommendation = Column(Text, nullable=True)

    # Foreign key binding trip to its owner
    user_id         = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Relationship to User
    user            = relationship("User", back_populates="trips")

    @property
    def user_public_id(self) -> str:
        """Public identifier (usr_...) of the owner, or empty string if unassigned."""
        return self.user.public_id if self.user else ""
