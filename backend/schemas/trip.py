# ==============================================================================
# 3. SCHEMAS: Trip DTOs (Data Transfer Objects & Validation via Pydantic)
# ==============================================================================

from datetime import datetime
from pydantic import BaseModel, Field


# WHY: Schemas define the API contract, validate incoming JSON payloads,
# and filter/serialize outgoing responses (Separation of Concerns from ORM).

class TripRequest(BaseModel):
    """Request schema for creating a new trip."""
    destination     : str   = Field(min_length=2, max_length=100, description="Name of the destination (e.g. Japan)")
    days            : int   = Field(ge=1, le=14, description="Trip duration in days (1-14)")
    budget          : float = Field(gt=0, le=1_000_000, description="Total trip budget in selected currency")
    travel_style    : str   = Field(min_length=2, max_length=50, description="Travel style preference (e.g. Family)")
    ai_recommendation: str | None = Field(default=None, description="Pre-generated AI itinerary text from chat")

class TripResponse(BaseModel):
    """Response schema returned to the client."""
    id                  : str = Field(validation_alias="public_id")
    destination         : str
    days                : int
    budget              : float
    category            : str
    daily_budget        : float
    travel_style        : str | None = "Solo"
    created_at          : datetime
    deleted_at          : datetime | None = None
    user_id             : str = Field(validation_alias="user_public_id")

    ai_recommendation   : str | None = None

    # CONCEPT: from_attributes=True allows Pydantic to read data directly
    # from SQLAlchemy ORM model attributes (ORM mode in Pydantic v2).
    model_config = {"from_attributes": True, "populate_by_name": True}

class UpdateTripRequest(BaseModel):
    """Request schema for updating trip details (supports partial updates)."""
    budget          : float | None = Field(default=None, gt=0, le=1_000_000, description="Updated budget value")
    destination     : str | None   = Field(default=None, min_length=2, max_length=100, description="Updated destination")
    days            : int | None   = Field(default=None, ge=1, le=14, description="Updated duration in days")
    travel_style    : str | None   = Field(default=None, min_length=2, max_length=50, description="Updated travel style")

class GenerateTripResponse(BaseModel):
    """Response schema specifically returned after generating AI itinerary."""
    trip_id         : str
    destination     : str
    recommendation  : str

    model_config = {"from_attributes": True, "populate_by_name": True}
