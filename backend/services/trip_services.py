# ==============================================================================
# 4. SERVICES (Business Logic Calculations & Database CRUD Operations)
# ==============================================================================

from constants.categories import TRIP_CATEGORIES, DEFAULT_CATEGORY
from constants.places import RECOMMENDED_PLACES
from constants.seasons import TRAVEL_SEASONS, DEFAULT_SEASON
from constants.transportation import RECOMMENDED_TRANSPORTATION
from sqlalchemy.orm import Session
from models.trip import Trip
from schemas.trip import TripRequest

# ------------------------------------------------------------------------------
# Part A: Domain Calculations & Lookups
# ------------------------------------------------------------------------------

def calculate_daily_budget(budget: float, days: int) -> float:
    """Calculate the average daily expenditure."""
    return budget/days

def get_trip_category(budget: float) -> str:
    """Classify the travel tier based on total budget thresholds."""
    # Iterate through each threshold in order.
    # Return the first category whose threshold the budget does not exceed.
    for threshold, category in TRIP_CATEGORIES:
        if budget <= threshold:
            return category
    
    # If budget exceeds all thresholds, return the default category.
    return DEFAULT_CATEGORY
    
def get_trip_transportation_recommendation(trip_category: str) -> str | ValueError:
    """Look up recommended transportation based on trip category."""
    transportation = RECOMMENDED_TRANSPORTATION.get(trip_category)
    
    if transportation is None:
        # Store the exception as the value so the view can handle and display it.
        return ValueError(f"No transportation recommendation for category '{trip_category}'.")
    
    return transportation

def get_recommended_places(destinations: list[str]) -> dict[str, list | ValueError]:
    """Look up recommended places for each destination and return a result dict.

    Returns a dict where each value is either a list of places or a ValueError instance.
    e.g. {"Japan": ["Tokyo Tower", ...], "Korea": ValueError(...)}
    """
    # destinations is now a list, e.g. ["Japan", "Korea", "US"]    
    # Build a result dict mapping each destination to its places or an error message.
    # e.g. {"Japan": ["Tokyo Tower", ...], "Korea": ValueError(...)}
    result = {}

    for destination in destinations:
        places = RECOMMENDED_PLACES.get(destination)
        
        if places is None:
            # Store the exception as the value so the view can handle and display it.
            result[destination] = ValueError(f"Destination '{destination}' not found.")
        elif not places:
            result[destination] = ValueError(f"No recommended places listed for '{destination}'.")
        else:
            result[destination] = places
    
    return result

def get_travel_season(travel_month: str) -> str:
    """Look up the travel season classification based on the travel month."""
    # use DEFAULT_SEASON as fallback if the month is not listed in TRAVEL_SEASONS.
    return TRAVEL_SEASONS.get(travel_month, DEFAULT_SEASON)

def get_all_trip_categories() -> list[str]:
    """Return all available trip categories from constants."""
    # Extract only the category names from TRIP_CATEGORIES tuples, then add the default.
    # e.g. [(999, "Backpacker"), (3000, "Standard")] -> ["Backpacker", "Standard", "Luxury"]
    return [category for _, category in TRIP_CATEGORIES] + [DEFAULT_CATEGORY]

def get_all_recommended_places() -> list[str]:
    """Return all available recommended places from constants."""
    # Flatten all place lists from every destination into a single list.
    # e.g. {"Japan": ["Tokyo Tower", "Shibuya"], "Korea": []} -> ["Tokyo Tower", "Shibuya"]
    return [place for places in RECOMMENDED_PLACES.values() for place in places]

def get_all_transportation_recommendations() -> list[str]:
    """Return all available transportation options from constants."""
    # Extract only the transportation values from the dict.
    # e.g. {"Backpacker": "Bus", ...} -> ["Bus", "Train", "Flight"]
    return list(RECOMMENDED_TRANSPORTATION.values())


# ------------------------------------------------------------------------------
# Part B: Database CRUD Services
# ------------------------------------------------------------------------------

def create_trip_db(db: Session, request:TripRequest) -> Trip:
    """Compute business values, persist a new Trip entity, and return it."""
    # Step 1: Calculate derived domain attributes
    daily_budget = calculate_daily_budget(
        request.budget, request.days        
    )
    category = get_trip_category(
        request.budget
    )

    # Step 2: Instantiate SQLAlchemy ORM Model
    trip = Trip(
        destination         = request.destination,
        days                = request.days,
        budget              = request.budget,
        category            = category,
        daily_budget        = daily_budget,
    )

    # Step 3: Persist transaction and refresh instance to fetch generated ID/timestamps
    db.add(trip)
    db.commit()
    db.refresh(trip)    # get the auto-generated id
    return trip

def get_all_trips_db(db: Session) -> list[Trip]:
    """Query and return all trip records from the database."""
    return db.query(Trip).all()

def get_trip_by_id_db(db: Session, trip_id: int) -> Trip | None:
    """Fetch a single trip record by its primary key ID."""
    return db.query(Trip).filter(Trip.id == trip_id).first()

def update_trip_db(db: Session, trip: Trip, new_budget: float) -> Trip:
    """Update trip budget and automatically recalculate derived budget metrics."""
    # Step 1: Update budget and recalculate derived properties
    trip.budget         = new_budget
    trip.category       = get_trip_category(new_budget)
    trip.daily_budget   = calculate_daily_budget(new_budget, trip.days)

    # Step 2: Commit changes to database and refresh memory state
    db.commit()
    db.refresh(trip)
    return trip

def delete_trip_db(db: Session, trip: Trip) -> None:
    """Delete a trip from the database."""
    db.delete(trip)
    db.commit()