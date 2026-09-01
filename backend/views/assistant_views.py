# ==============================================================================
# ASSISTANT VIEWS (FastAPI Router for RAG Travel Assistant & Knowledge Base)
# ==============================================================================

from fastapi import APIRouter, HTTPException, Depends, status
from schemas.assistant import QuestionRequest, AssistantResponse
from services.kb_service import ask_knowledge_base, ask_base_model
from services.auth_deps import get_current_user
from models.user import User

router = APIRouter(tags=["assistant"])

@router.post(
    "/api/v1/assistant",
    response_model=AssistantResponse,
    status_code=status.HTTP_200_OK,
    summary="Query RAG Travel Assistant Knowledge Base"
)
@router.post(
    "/api/v1/ask",
    response_model=AssistantResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def ask_assistant_endpoint(
    request: QuestionRequest,
    current_user: User = Depends(get_current_user),
) -> AssistantResponse:
    """
    RAG Assistant Endpoint:
    1. Receives user travel question.
    2. Queries Amazon Bedrock Knowledge Base (if use_rag=True) or Base Model (if use_rag=False).
    3. Returns grounded answer with supporting document citations.
    """
    if not request.question or not request.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question cannot be empty."
        )

    try:
        if request.use_rag:
            result = ask_knowledge_base(request.question.strip())
            mode = "rag"
        else:
            result = ask_base_model(request.question.strip())
            mode = "base_model"

        return AssistantResponse(
            question=request.question,
            answer=result.get("answer", ""),
            source=result.get("source"),
            citations=result.get("citations", []),
            session_id=request.session_id,
            user_id=current_user.id if current_user else None,
            use_rag=request.use_rag,
            mode=mode,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query knowledge base: {str(e)}"
        )
