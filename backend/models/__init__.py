# ==============================================================================
# MODELS REGISTRY: Import all SQLAlchemy ORM models for declarative resolution
# ==============================================================================

from models.user import User
from models.trip import Trip
from models.conversation import Conversation, Message

__all__ = ["User", "Trip", "Conversation", "Message"]
