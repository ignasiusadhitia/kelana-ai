# ==============================================================================
# 5. MAIN CONTROLLER (FastAPI Router & Application Entry Point)
# ==============================================================================
# Note: Execution flow across layers:
# 1. database.py        -> Connection & Session dependency
# 2. models/trip.py     -> Database ORM entities
# 3. schemas/trip.py    -> Validation & serialization contracts
# 4. trip_services.py   -> Business rules & CRUD execution
# 5. main.py            -> HTTP Endpoints & Dependency Injection
# ==============================================================================

import uvicorn

# FastAPI dependencies for building the REST API endpoints.
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session

from services.trip_services import (
    create_trip_db,
    get_all_trips_db,
    get_trip_by_id_db,
    update_trip_db,
    delete_trip_db,
    save_trip_ai_recommendation_db,
    create_trip_with_ai_db,
    get_all_trip_categories,
    get_all_recommended_places,
    get_all_transportation_recommendations,
)

from services.bedrock_service import (
    build_trip_prompt,
    generate_trip_recommendation
)

from schemas.trip import TripRequest, TripResponse, UpdateTripRequest, GenerateTripResponse
from database import init_db, get_db


app = FastAPI(
    title="KelanaAI API",
    description="Backend API for travel planning and budget calculation.",
    version="1.0.0"
)

# Initialize database tables on application startup
init_db()

@app.get("/")
def home() -> dict[str, str]:
    """Root endpoint welcoming users."""
    return {
        "message": "Welcome to KelanaAI"
    }

@app.get("/health")
def health() -> dict[str, str]:
    """Health check endpoint to verify service availability."""
    return {
        "status": "OK"
    }

# ------------------------------------------------------------------------------
# Trip Resource Endpoints
# ------------------------------------------------------------------------------

@app.post("/api/v1/trips", response_model=TripResponse)
def create_trip(request: TripRequest, db: Session = Depends(get_db)) -> TripResponse:
    """
    Create a new trip and immediately generate AI itinerary in a single request.
    """
    return create_trip_with_ai_db(db, request)

@app.get("/api/v1/trips", response_model=list[TripResponse])
def list_trips(db: Session = Depends(get_db)) -> list[TripResponse]:
    """Retrieve a list of all saved trips."""
    return get_all_trips_db(db)

@app.get("/api/v1/trips/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db)) -> TripResponse:
    """Retrieve details of a specific trip by its ID."""
    trip = get_trip_by_id_db(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip

@app.put("/api/v1/trips/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, request: UpdateTripRequest, db: Session = Depends(get_db)) -> TripResponse:
    """
    Update trip budget:
    - Verifies trip existence (returns 404 if not found).
    - Updates budget and recalculates daily budget and category tier.
    """
    trip = get_trip_by_id_db(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    return update_trip_db(db, trip, request.budget)

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    """Delete a specific trip by its ID."""
    trip = get_trip_by_id_db(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    delete_trip_db(db, trip)
    return {"message": f"Trip with id {trip_id} deleted successfully."}

@app.post("/api/v1/trips/{trip_id}/generate", response_model=GenerateTripResponse)
def generate_ai_itinerary(trip_id: int, db: Session = Depends(get_db)) -> GenerateTripResponse:
    """
    Generate AI-powered travel recommendations for an existing trip:
    - Step 1: Retrieve existing trip record by ID.
    - Step 2: Build enhanced contextual prompt.
    - Step 3: Call Amazon Bedrock Converse API.
    - Step 4: Save AI recommendation to database.
    - Step 5: Return structured response.
    """
    # Step 1: Validate trip existence
    trip = get_trip_by_id_db(db, trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    
    # Step 2: Build prompt with trip context (Destination, Days, Budget, Category)
    prompt = build_trip_prompt(
        destination=trip.destination,
        days=trip.days,
        budget=trip.budget,
        category=trip.category
    )

    # Step 3: Invoke Amazon Bedrock
    try:
        ai_recommendation = generate_trip_recommendation(prompt)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI itinerary from Amazon Bedrock: {str(e)}"
        )
        
    
    # Step 4: Persist generated recommendation to database
    updated_trip = save_trip_ai_recommendation_db(db, trip, ai_recommendation)

    # Step 5: Return payload matching GenerateTripResponse
    return GenerateTripResponse(
        trip_id=updated_trip.id,
        destination=updated_trip.destination,
        recommendation=updated_trip.ai_recommendation
    )

@app.get("/api/v1/trip-categories")
def list_trip_categories() -> list[str]:
    """Retrieve all available trip categories."""
    return get_all_trip_categories()

@app.get("/api/v1/recommendations")
def list_recommended_places() -> list[str]:
    """Retrieve all available recommended places."""
    return get_all_recommended_places()

@app.get("/api/v1/transportations")
def list_transportation_recommendations() -> list[str]:
    """Retrieve all available transportation options."""
    return get_all_transportation_recommendations()



# ==============================================================================
# ENTRY POINT
# ==============================================================================

# Run the FastAPI app directly with 'python main.py' as an alternative to uvicorn CLI
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)