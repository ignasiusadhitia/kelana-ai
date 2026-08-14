# ==============================================================================
# 3. BUSINESS LOGIC (Calculations and data lookup)
# ==============================================================================

from constants.categories import TRIP_CATEGORIES, DEFAULT_CATEGORY
from constants.places import RECOMMENDED_PLACES
from constants.seasons import TRAVEL_SEASONS, DEFAULT_SEASON
from constants.transportation import RECOMMENDED_TRANSPORTATION

def calculate_daily_budget(budget: float, days: int) -> float:
    """Calculate the average spending per day."""
    return budget/days

def get_trip_category(budget: float) -> str:
    """Classify the trip style based on total budget."""
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

