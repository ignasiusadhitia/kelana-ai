# ==============================================================================
# SCHEMAS: Authentication & User Serialization Contracts (Session 8)
# ==============================================================================

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserRegisterRequest(BaseModel):
    """Payload contract for new user registration."""
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the traveler")
    email: EmailStr = Field(..., description="Unique email address")
    password: str = Field(..., min_length=6, max_length=128, description="Plaintext password (hashed with bcrypt)")

class UserLoginRequest(BaseModel):
    """Payload contract for user login."""
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")

class UpdateProfileRequest(BaseModel):
    """Payload contract for updating user profile info & travel preferences."""
    name: str | None = Field(default=None, min_length=2, max_length=100, description="Updated full name of the traveler")
    default_travel_style: str | None = Field(default=None, max_length=50, description="Default travel style preference (e.g. Couple, Backpacker)")

class ChangePasswordRequest(BaseModel):
    """Payload contract for changing account password."""
    current_password: str = Field(..., min_length=1, description="Current plaintext password")
    new_password: str = Field(..., min_length=6, max_length=128, description="New plaintext password (min 6 characters)")

class UserResponse(BaseModel):
    """Safe user representation returned in API responses (excludes password_hash)."""
    id: int
    name: str
    email: EmailStr
    default_travel_style: str | None = "Family"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    """JWT Token payload returned upon successful login/registration."""
    access_token: str
    token_type: str = "Bearer"
    user: UserResponse

class UserProfileResponse(BaseModel):
    """Extended user profile representation for /profile with travel analytics."""
    id: int
    name: str
    email: EmailStr
    default_travel_style: str | None = "Family"
    created_at: datetime
    total_trips: int = 0
    total_budget: float = 0.0
    total_days: int = 0
    destinations: list[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
