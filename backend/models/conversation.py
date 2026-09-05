# ==============================================================================
# 5. MODELS: Conversation & Message Entities (Multi-Turn Conversational Memory)
# ==============================================================================

from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
from utils.nanoid_gen import generate_id

class Conversation(Base):
    """
    Conversation database model representing a multi-turn chat session with KelanaAI.
    Belongs to a User and contains many Messages.
    Exposes secure public_id (conv_...) for client references.
    """
    __tablename__ = "conversations"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    public_id = Column(String(32), unique=True, index=True, nullable=False, default=lambda: generate_id("conv"))
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="New Conversation")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    context_summary = Column(Text, nullable=True, default=None)
    trip_id = Column(BigInteger, ForeignKey("trips.id", ondelete="SET NULL"), nullable=True, index=True, default=None)

    # Relationships - strictly ordered by message ID ascending for deterministic chronology
    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", passive_deletes=True, order_by="Message.id.asc()")
    trip = relationship("Trip", foreign_keys=[trip_id], lazy="select")

    @property
    def trip_public_id(self) -> str | None:
        return self.trip.public_id if self.trip else None

    @property
    def trip_destination(self) -> str | None:
        return self.trip.destination if self.trip else None


class Message(Base):
    """
    Message database model representing individual user/assistant turns in a conversation.
    Exposes secure public_id (msg_...) for client references.
    """
    __tablename__ = "messages"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    public_id = Column(String(32), unique=True, index=True, nullable=False, default=lambda: generate_id("msg"))
    conversation_id = Column(BigInteger, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(16), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
