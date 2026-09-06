# ==============================================================================
# 2. VIEWS: Trip Controller (FastAPI Endpoints for Itinerary Management)
# ==============================================================================

import re
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from services.trip_services import (
    create_trip_db,
    get_all_trips_db,
    get_trip_by_id_db,
    update_trip_db,
    soft_delete_trip_db,
    restore_trip_db,
    hard_delete_trip_db,
    save_trip_ai_recommendation_db,
    create_trip_with_ai_db,
    get_all_trip_categories,
    get_all_recommended_places,
    get_all_transportation_recommendations,
)

from services.bedrock_service import (
    build_trip_prompt,
    generate_trip_recommendation,
)

from utils.rate_limiter import check_ai_rate_limit

from services.auth_deps import get_current_user
from models.user import User
from models.trip import Trip
from schemas.trip import TripRequest, TripResponse, UpdateTripRequest, GenerateTripResponse, UpdateTripRecommendationRequest
from database import get_db

router = APIRouter(tags=["trips"])


def _clean_itinerary_preamble(text: str) -> str:
    """Strip chat assistant pleasantries (e.g. 'Absolutely! Here is...') before saving to blueprint."""
    if not text:
        return text
    match = re.search(r'(?i)(?:^|\n)(#{1,3}\s+[\w\s:-]+|\*\*(?:Day|Hari)\s+\d+)', text)
    if match and match.start() > 0:
        preamble = text[:match.start()].strip()
        is_greeting = bool(re.match(
            r'(?i)^(?:absolutely|sure|certainly|of course|here(?:\'s| is)|i(?:\'ve| have) (?:created|updated|revised|prepared|tailored)|tentu|baik|ini|berikut)\b',
            preamble
        )) or (len(preamble) < 350 and not any(line.strip().startswith(('-', '*', '1.')) for line in preamble.splitlines()))
        if is_greeting:
            return text[match.start():].strip()
    return text.strip()



# ------------------------------------------------------------------------------
# Protected Trip Endpoints (Multi-User Security & Isolation)
# ------------------------------------------------------------------------------

@router.post("/api/v1/trips", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    request: TripRequest,
    http_request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TripResponse:
    """
    Create a new trip associated automatically with the authenticated user.
    Backend assigns user_id from verified JWT — frontend never sends user_id.
    """
    if not request.ai_recommendation:
        check_ai_rate_limit(http_request, current_user.id)
    else:
        request.ai_recommendation = _clean_itinerary_preamble(request.ai_recommendation)
    return create_trip_with_ai_db(db, request, current_user.id)


@router.get("/api/v1/trips", response_model=list[TripResponse])
def list_trips(
    status: str = "active",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[TripResponse]:
    """
    Retrieve trips owned by the authenticated user.
    - status="active" (default): Returns non-deleted active trips.
    - status="trash": Returns soft-deleted trips in trash bin.
    """
    trash_only = (status.lower() == "trash")
    return get_all_trips_db(db, current_user.id, trash_only=trash_only)


def _get_trip_with_ownership_or_raise(
    db: Session,
    trip_id: str | int,
    user_id: int,
    action: str = "view this itinerary."
) -> Trip:
    """Fetch trip by public_id or ID and enforce strict user ownership across all operations."""
    trip = get_trip_by_id_db(db, trip_id)
    if trip is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trip with id {trip_id} not found",
        )
    if trip.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: You do not have permission to {action}",
        )
    return trip


@router.get("/api/v1/trips/{trip_id}", response_model=TripResponse)
def get_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TripResponse:
    """
    Retrieve details of a specific trip by ID.
    Enforces authorization: returns 403 Forbidden if trip belongs to another user.
    """
    return _get_trip_with_ownership_or_raise(db, trip_id, current_user.id, "view this itinerary.")


@router.put("/api/v1/trips/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: str,
    request: UpdateTripRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TripResponse:
    """
    Update trip details (budget, destination, duration, travel style):
    - Verifies trip existence (404).
    - Verifies ownership (403).
    - Recalculates daily budget and category tier.
    """
    trip = _get_trip_with_ownership_or_raise(db, trip_id, current_user.id, "modify this itinerary.")
    return update_trip_db(
        db,
        trip,
        new_budget=request.budget,
        new_destination=request.destination,
        new_days=request.days,
        new_travel_style=request.travel_style,
    )


@router.delete("/api/v1/trips/{trip_id}")
def delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Soft-delete a specific trip by ID (moves to Trash bin).
    Enforces ownership (403 if attempting to delete another user's trip).
    """
    trip = _get_trip_with_ownership_or_raise(db, trip_id, current_user.id, "delete this itinerary.")
    soft_delete_trip_db(db, trip)
    return {"message": f"Trip #{trip.public_id} moved to trash successfully.", "id": trip.public_id}


@router.post("/api/v1/trips/{trip_id}/restore", response_model=TripResponse)
def restore_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TripResponse:
    """
    Restore a soft-deleted trip back to the active dashboard.
    Enforces ownership (403 if attempting to restore another user's trip).
    """
    trip = _get_trip_with_ownership_or_raise(db, trip_id, current_user.id, "restore this itinerary.")
    return restore_trip_db(db, trip)


@router.delete("/api/v1/trips/{trip_id}/permanent")
def permanent_delete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Permanently delete a trip from the database (Irreversible Hard Delete).
    Enforces ownership (403).
    """
    trip = _get_trip_with_ownership_or_raise(db, trip_id, current_user.id, "permanently delete this itinerary.")
    hard_delete_trip_db(db, trip)
    return {"message": f"Trip #{trip.public_id} permanently deleted.", "id": trip.public_id}


@router.patch("/api/v1/trips/{trip_id}/recommendation", response_model=TripResponse)
def update_trip_recommendation(
    trip_id: str,
    request: UpdateTripRecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TripResponse:
    """
    Apply a new AI itinerary text to an existing trip Blueprint (Chat-to-Blueprint promotion).
    - Verifies trip existence (404).
    - Verifies ownership (403).
    - Updates ONLY ai_recommendation — destination, days, budget, category, daily_budget,
      and travel_style are intentionally left unchanged.
    - Does NOT trigger any Bedrock AI generation.
    """
    trip = _get_trip_with_ownership_or_raise(db, trip_id, current_user.id, "update this itinerary.")
    return save_trip_ai_recommendation_db(db, trip, request.ai_recommendation)


@router.post("/api/v1/trips/{trip_id}/generate", response_model=GenerateTripResponse)
def generate_ai_itinerary(
    trip_id: str,
    http_request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GenerateTripResponse:
    """
    Generate travel recommendations for an existing trip:
    - Validates ownership (403).
    - Invokes Amazon Bedrock Converse API.
    - Saves recommendation to database.
    """
    check_ai_rate_limit(http_request, current_user.id)
    trip = _get_trip_with_ownership_or_raise(db, trip_id, current_user.id, "regenerate this itinerary.")
    
    prompt = build_trip_prompt(
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        category=trip.category,
        daily_budget=trip.daily_budget,
        travel_style=trip.travel_style,
    )

    try:
        ai_recommendation = generate_trip_recommendation(prompt)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate itinerary from Amazon Bedrock: {str(e)}",
        )
        
    updated_trip = save_trip_ai_recommendation_db(db, trip, ai_recommendation)

    return GenerateTripResponse(
        trip_id=updated_trip.public_id,
        destination=updated_trip.destination,
        recommendation=updated_trip.ai_recommendation,
    )


# ------------------------------------------------------------------------------
# Public Metadata Endpoints
# ------------------------------------------------------------------------------

@router.get("/api/v1/trip-categories")
def list_trip_categories() -> list[str]:
    """Retrieve all available trip categories."""
    return get_all_trip_categories()


@router.get("/api/v1/recommendations")
def list_recommended_places() -> list[str]:
    """Retrieve all available recommended places."""
    return get_all_recommended_places()


@router.get("/api/v1/transportations")
def list_transportation_recommendations() -> list[str]:
    """Retrieve all available transportation options."""
    return get_all_transportation_recommendations()
