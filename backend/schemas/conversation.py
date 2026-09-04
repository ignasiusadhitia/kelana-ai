# ==============================================================================
# 3. SCHEMAS: Conversation & Message DTOs (Validation via Pydantic)
# ==============================================================================

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class ConversationCreate(BaseModel):
    """Request schema for creating a new conversation session."""
    title: Optional[str] = Field(default=None, max_length=255, description="Optional custom conversation title")

class ConversationUpdate(BaseModel):
    """Request schema for updating an existing conversation title."""
    title: str = Field(min_length=1, max_length=255, description="New conversation title")

class MessageCreate(BaseModel):
    """Request schema for appending a new user message to a conversation."""
    content: str = Field(min_length=1, max_length=10000, description="User message content")

class MessageResponse(BaseModel):
    """Response schema representing a single persisted message turn."""
    id: str = Field(validation_alias="public_id")
    conversation_id: int
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}

class ConversationResponse(BaseModel):
    """Summary response schema for conversation list queries."""
    id: str = Field(validation_alias="public_id")
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True, "populate_by_name": True}

class ConversationDetailResponse(BaseModel):
    """Detailed response schema including complete message history for a conversation."""
    id: str = Field(validation_alias="public_id")
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    model_config = {"from_attributes": True, "populate_by_name": True}
