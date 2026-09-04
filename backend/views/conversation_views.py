# ==============================================================================
# 2. VIEWS: Conversation Controller (FastAPI Endpoints for Multi-Turn AI Chat)
# ==============================================================================

from typing import List
from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from services.auth_deps import get_current_user
from schemas.conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationDetailResponse,
    MessageCreate,
    MessageResponse
)
from services.conversation_service import (
    create_conversation,
    list_conversations,
    get_conversation_with_messages,
    update_conversation_title,
    delete_conversation,
    send_message_and_get_response,
    stream_message_and_get_response,
    edit_user_message_and_regenerate,
    regenerate_latest_response
)
from utils.rate_limiter import check_ai_rate_limit

router = APIRouter()


# ------------------------------------------------------------------------------
# Conversation Endpoints (Multi-Turn Chat Sessions & Messages)
# ------------------------------------------------------------------------------


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation_endpoint(
    payload: ConversationCreate = ConversationCreate(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a new conversation session for the authenticated user."""
    conv = create_conversation(db, current_user.id, payload.title)
    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "message_count": 0
    }


@router.get("", response_model=List[ConversationResponse])
def list_conversations_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all previous conversation threads for the authenticated user."""
    return list_conversations(db, current_user.id)


@router.get("/{id}", response_model=ConversationDetailResponse)
def get_conversation_endpoint(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a specific conversation thread and all its messages."""
    conv = get_conversation_with_messages(db, id, current_user.id)
    return conv


@router.patch("/{id}", response_model=ConversationResponse)
def update_conversation_title_endpoint(
    id: int,
    payload: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Rename a conversation title (Bonus Challenge)."""
    conv = update_conversation_title(db, id, current_user.id, payload.title)
    msg_count = len(conv.messages) if conv.messages else 0
    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at,
        "updated_at": conv.updated_at,
        "message_count": msg_count
    }


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation_endpoint(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a conversation and all its messages."""
    delete_conversation(db, id, current_user.id)
    return None


@router.post("/{id}/messages")
def send_message_endpoint(
    id: int,
    payload: MessageCreate,
    request: Request,
    stream: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to a conversation thread, orchestrate context with previous messages,
    call Amazon Bedrock, and return the AI response.
    Supports ?stream=true for real-time Server-Sent Events (SSE).
    """
    check_ai_rate_limit(request, current_user.id)

    if stream:
        return StreamingResponse(
            stream_message_and_get_response(db, id, current_user.id, payload.content),
            media_type="text/event-stream"
        )

    ai_message = send_message_and_get_response(db, id, current_user.id, payload.content)
    return {
        "id": ai_message.id,
        "conversation_id": ai_message.conversation_id,
        "role": ai_message.role,
        "content": ai_message.content,
        "created_at": ai_message.created_at
    }


@router.post("/{id}/messages/{message_id}/edit", response_model=ConversationDetailResponse)
def edit_message_endpoint(
    id: int,
    message_id: int,
    payload: MessageCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Edit a past user message, truncate subsequent messages from that point,
    and generate a fresh assistant response. Returns updated conversation details.
    """
    check_ai_rate_limit(request, current_user.id)
    conversation = edit_user_message_and_regenerate(
        db=db,
        conversation_id=id,
        message_id=message_id,
        user_id=current_user.id,
        new_text=payload.content
    )
    return conversation


@router.post("/{id}/regenerate", response_model=ConversationDetailResponse)
def regenerate_response_endpoint(
    id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Regenerate the latest assistant message. Returns updated conversation details.
    """
    check_ai_rate_limit(request, current_user.id)
    conversation = regenerate_latest_response(
        db=db,
        conversation_id=id,
        user_id=current_user.id
    )
    return conversation

