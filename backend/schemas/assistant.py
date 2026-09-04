# ==============================================================================
# 3. SCHEMAS: Assistant DTOs (Data Transfer Objects & Validation via Pydantic)
# ==============================================================================

from typing import Any
from pydantic import BaseModel, Field

class QuestionRequest(BaseModel):
    """Request schema for asking travel assistant questions."""
    question: str = Field(min_length=3, max_length=1000, description="The travel question to ask the Knowledge Base")
    session_id: str | None = Field(default=None, description="Client session identifier for conversational context")
    use_rag: bool = Field(default=True, description="Toggle between Grounded RAG (True) and Base Model Zero-Shot (False)")

class Citation(BaseModel):
    """Model for source citations returned by Bedrock Knowledge Base."""
    content: str | None = None
    source: str | None = None

class AssistantResponse(BaseModel):
    """Response schema returned by the RAG assistant endpoint matching mentor specification."""
    question: str
    answer: str
    source: list[dict[str, Any]] | str | None = None
    citations: list[Citation] = []
    session_id: str | None = None
    user_id: int | None = None
    use_rag: bool = True
    mode: str = "rag"
