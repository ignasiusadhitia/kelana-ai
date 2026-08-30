# ==============================================================================
# 4. SERVICES (Business Logic Calculations & Database CRUD Operations - Session 8)
# ==============================================================================

from constants.categories import TRIP_CATEGORIES, DEFAULT_CATEGORY
from constants.places import RECOMMENDED_PLACES
from constants.seasons import TRAVEL_SEASONS, DEFAULT_SEASON
from constants.transportation import RECOMMENDED_TRANSPORTATION
from sqlalchemy import func
from sqlalchemy.orm import Session
from models.trip import Trip
from schemas.trip import TripRequest
from services.bedrock_service import build_trip_prompt, generate_trip_recommendation

# ------------------------------------------------------------------------------
# Part A: Domain Calculations & Lookups
# ------------------------------------------------------------------------------

def calculate_daily_budget(budget: float, days: int) -> float:
    """Calculate the average daily expenditure."""
    return budget / days

def get_trip_category(budget: float) -> str:
    """Classify the travel tier based on total budget thresholds."""
    for threshold, category in TRIP_CATEGORIES:
        if budget <= threshold:
            return category
    return DEFAULT_CATEGORY
    
def get_trip_transportation_recommendation(trip_category: str) -> str | ValueError:
    """Look up recommended transportation based on trip category."""
    transportation = RECOMMENDED_TRANSPORTATION.get(trip_category)
    if transportation is None:
        return ValueError(f"No transportation recommendation for category '{trip_category}'.")
    return transportation

def get_recommended_places(destinations: list[str]) -> dict[str, list | ValueError]:
    """Look up recommended places for each destination and return a result dict."""
    result = {}
    for destination in destinations:
        places = RECOMMENDED_PLACES.get(destination)
        if places is None:
            result[destination] = ValueError(f"Destination '{destination}' not found.")
        elif not places:
            result[destination] = ValueError(f"No recommended places listed for '{destination}'.")
        else:
            result[destination] = places
    return result

def get_travel_season(travel_month: str) -> str:
    """Look up the travel season classification based on the travel month."""
    return TRAVEL_SEASONS.get(travel_month, DEFAULT_SEASON)

def get_all_trip_categories() -> list[str]:
    """Return all available trip categories from constants."""
    return [category for _, category in TRIP_CATEGORIES] + [DEFAULT_CATEGORY]

def get_all_recommended_places() -> list[str]:
    """Return all available recommended places from constants."""
    return [place for places in RECOMMENDED_PLACES.values() for place in places]

def get_all_transportation_recommendations() -> list[str]:
    """Return all available transportation options from constants."""
    return list(RECOMMENDED_TRANSPORTATION.values())

# ------------------------------------------------------------------------------
# Part B: Database CRUD Services (User Ownership & Scoped Queries)
# ------------------------------------------------------------------------------

def create_trip_db(db: Session, request: TripRequest, user_id: int) -> Trip:
    """Compute business values, persist a new Trip entity owned by user_id, and return it."""
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)

    trip = Trip(
        destination         = request.destination,
        days                = request.days,
        budget              = request.budget,
        category            = category,
        daily_budget        = daily_budget,
        travel_style        = request.travel_style,
        user_id             = user_id,
    )

    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

def get_all_trips_db(db: Session, user_id: int, trash_only: bool = False) -> list[Trip]:
    """Query and return trip records belonging exclusively to the authenticated user."""
    query = db.query(Trip).filter(Trip.user_id == user_id)
    if trash_only:
        query = query.filter(Trip.deleted_at.isnot(None))
    else:
        query = query.filter(Trip.deleted_at.is_(None))
    return query.order_by(Trip.created_at.desc()).all()

def get_trip_by_id_db(db: Session, trip_id: int) -> Trip | None:
    """Fetch a single trip record by its primary key ID."""
    return db.query(Trip).filter(Trip.id == trip_id).first()

def get_user_trip_by_id_db(db: Session, trip_id: int, user_id: int, include_deleted: bool = False) -> Trip | None:
    """Fetch a single trip record by its ID verifying strict ownership by user_id."""
    query = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id)
    if not include_deleted:
        query = query.filter(Trip.deleted_at.is_(None))
    return query.first()

def count_user_trips_db(db: Session, user_id: int) -> int:
    """Count total active trips created by a specific user for /profile stats."""
    return db.query(Trip).filter(Trip.user_id == user_id, Trip.deleted_at.is_(None)).count()

def get_user_analytics_db(db: Session, user_id: int) -> dict:
    """
    Compute comprehensive travel statistics for the user profile (active trips only):
    - total_trips: Total count of saved active itineraries
    - total_budget: Sum of all active planned trip budgets
    - total_days: Sum of all active planned travel days
    - destinations: Unique list of planned destinations
    """
    active_filter = (Trip.user_id == user_id) & (Trip.deleted_at.is_(None))
    total_trips = db.query(func.count(Trip.id)).filter(active_filter).scalar() or 0
    total_budget = db.query(func.sum(Trip.budget)).filter(active_filter).scalar() or 0.0
    total_days = db.query(func.sum(Trip.days)).filter(active_filter).scalar() or 0

    dest_rows = (
        db.query(Trip.destination)
        .filter(active_filter)
        .distinct()
        .all()
    )
    destinations = [row[0].strip() for row in dest_rows if row[0] and row[0].strip()]

    return {
        "total_trips": int(total_trips),
        "total_budget": float(total_budget),
        "total_days": int(total_days),
        "destinations": destinations,
    }

def update_trip_db(db: Session, trip: Trip, new_budget: float) -> Trip:
    """Update trip budget and automatically recalculate derived budget metrics."""
    trip.budget         = new_budget
    trip.category       = get_trip_category(new_budget)
    trip.daily_budget   = calculate_daily_budget(new_budget, trip.days)

    db.commit()
    db.refresh(trip)
    return trip

def soft_delete_trip_db(db: Session, trip: Trip) -> Trip:
    """Mark a trip as soft-deleted (move to trash)."""
    trip.deleted_at = func.now()
    db.commit()
    db.refresh(trip)
    return trip

def restore_trip_db(db: Session, trip: Trip) -> Trip:
    """Restore a soft-deleted trip back to active status."""
    trip.deleted_at = None
    db.commit()
    db.refresh(trip)
    return trip

def hard_delete_trip_db(db: Session, trip: Trip) -> None:
    """Permanently delete a trip from the database."""
    db.delete(trip)
    db.commit()

def save_trip_ai_recommendation_db(db: Session, trip: Trip, recommendation: str) -> Trip:
    """Persist the AI-generated recommendation text into the trip database record."""
    trip.ai_recommendation = recommendation
    db.commit()
    db.refresh(trip)
    return trip

def create_trip_with_ai_db(db: Session, request: TripRequest, user_id: int) -> Trip:
    """
    Calculate metrics, generate Bedrock AI itinerary, and persist trip bound to user_id.
    """
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    
    prompt = build_trip_prompt(
        destination=request.destination,
        days=request.days,
        budget=request.budget,
        category=category,
        daily_budget=daily_budget,
        travel_style=request.travel_style
    )
    
    ai_recommendation = None
    try:
        ai_recommendation = generate_trip_recommendation(prompt)
    except Exception as e:
        print(f"Warning: AI generation failed on create: {e}")

    trip = Trip(
        destination       = request.destination,
        days              = request.days,
        budget            = request.budget,
        category          = category,
        daily_budget      = daily_budget,
        travel_style      = request.travel_style,
        ai_recommendation = ai_recommendation,
        user_id           = user_id,
    )
    
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip