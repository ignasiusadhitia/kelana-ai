# ==============================================================================
# MAIN CONTROLLER
# ==============================================================================
# Note: Section numbers follow the app execution order:
# 1. trip_services.py   -> Business logic
# 2. main.py            -> API endpoints + Entry point
# ==============================================================================

import uvicorn

# FastAPI dependencies for building the REST API endpoints.
from fastapi import FastAPI
from pydantic import BaseModel, Field
from services.trip_services import (
    calculate_daily_budget,
    get_trip_category,
    get_trip_transportation_recommendation,
    get_all_trip_categories,
    get_all_recommended_places,
    get_all_transportation_recommendations
    )

# FastAPI validates the JSON body against this model
# If a field is missing or wrong type, it returns 422 automatically
class TripRequest(BaseModel):
    """Request body schema for creating a trip summary."""
    destination     : str   = Field(min_length=2, max_length=100, description="Name of the destination (e.g. Japan)")
    days            : int   = Field(ge=1, le=365, description="Trip duration in days (1-365)")
    budget          : float = Field(gt=0, le=1_000_000, description="Total trip budget in selected currency")
    travel_style    : str   = Field(min_length=2, max_length=50, description="Travel style preference (e.g. Family)")

app = FastAPI()

# A GET endpoint at the root path
@app.get("/")
def home() -> dict[str, str]:
    return {
        "message" : "Welcome to KelanaAI"
    }

# A GET endpoint for health check - used to verify the server is running.
@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status" : "OK"
    }

# A POST endpoint to calculate and return a trip summary based on the request body.
@app.post("/api/v1/trips")
def create_trip(request: TripRequest) -> dict[str, str | float]:
    daily_budget = calculate_daily_budget(
        request.budget, request.days
    )
    category = get_trip_category(
        request.budget
    )
    recommendation_transport = get_trip_transportation_recommendation(
        category
    )
    return {
        "destination"               : request.destination,
        "budget"                    : request.budget,
        "daily_budget"              : daily_budget,
        "category"                  : category,
        "travel_style"              : request.travel_style,
        "recommendation_transport"  : recommendation_transport,
    }

# A GET endpoint to retrieve all available trip categories.
@app.get("/api/v1/trip-categories")
def list_trip_categories() -> list[str]:
    return get_all_trip_categories()

# A GET endpoint to retrieve all available recommended places.
@app.get("/api/v1/recommendations")
def list_recommended_places() -> list[str]:
    return get_all_recommended_places()

# A GET endpoint to retrieve all available transportation options.
@app.get("/api/v1/transportations")
def list_transportation_recommendations() -> list[str]:
    return get_all_transportation_recommendations()



# ==============================================================================
# ENTRY POINT
# ==============================================================================

# Run the FastAPI app directly with 'python main.py' as an alternative to uvicorn CLI
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)