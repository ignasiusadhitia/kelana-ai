# ==============================================================================
# 2. VIEWS: Authentication Controller (Traveler Profiles & JWT Authentication)
# ==============================================================================

from fastapi import APIRouter, Depends, HTTPException, Request, status
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
    TokenResponse,
    UserResponse,
    UserProfileResponse,
)
from services.auth_service import hash_password, verify_password, create_access_token
from services.auth_deps import get_current_user
from services.trip_services import get_user_analytics_db

# Rate Limiting Configuration (Defense against credential stuffing & brute-force)
_failed_login_attempts: dict[str, list[datetime]] = defaultdict(list)
MAX_LOGIN_ATTEMPTS = 5
LOGIN_LOCKOUT_MINUTES = 10

def _check_login_rate_limit(client_identifier: str):
    """Enforce rate limiting: blocks client after 5 failed attempts within 10 minutes."""
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(minutes=LOGIN_LOCKOUT_MINUTES)
    _failed_login_attempts[client_identifier] = [
        t for t in _failed_login_attempts[client_identifier] if t > window_start
    ]
    if len(_failed_login_attempts[client_identifier]) >= MAX_LOGIN_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please wait {LOGIN_LOCKOUT_MINUTES} minutes before trying again.",
        )

def _record_login_failure(client_identifier: str):
    """Record a failed login attempt timestamp for the specified client identifier."""
    _failed_login_attempts[client_identifier].append(datetime.now(timezone.utc))

def _reset_login_failures(client_identifier: str):
    """Reset failed login attempt history upon successful authentication."""
    _failed_login_attempts.pop(client_identifier, None)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(request: UserRegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """
    Register a new traveler account:
    - Validates email uniqueness.
    - Hashes password using bcrypt.
    - Persists user to PostgreSQL.
    - Issues a signed JWT access token immediately.
    """
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address is already registered.",
        )

    new_user = User(
        name=request.name.strip(),
        email=request.email.lower().strip(),
        password_hash=hash_password(request.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token({
        "sub": str(new_user.public_id),
        "email": new_user.email,
        "name": new_user.name,
    })

    return TokenResponse(
        access_token=access_token,
        token_type="Bearer",
        user=UserResponse.model_validate(new_user),
    )


@router.post("/login", response_model=TokenResponse)
def login_user(
    request: UserLoginRequest,
    req: Request,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Authenticate traveler with email and password:
    - Enforces IP-based brute force protection.
    - Verifies user exists.
    - Compares password against stored bcrypt hash.
    - Returns JWT access token upon success.
    """
    client_ip = req.client.host if req.client and req.client.host else "unknown"
    _check_login_rate_limit(client_ip)

    user = db.query(User).filter(User.email == request.email.lower().strip()).first()
    
    if not user or not verify_password(request.password, user.password_hash):
        _record_login_failure(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    _reset_login_failures(client_ip)

    access_token = create_access_token({
        "sub": str(user.public_id),
        "email": user.email,
        "name": user.name,
    })

    return TokenResponse(
        access_token=access_token,
        token_type="Bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfileResponse:
    """
    Retrieve authenticated user identity and activity statistics with travel analytics (/profile challenge).
    Requires valid Bearer token.
    """
    analytics = get_user_analytics_db(db, current_user.id)

    return UserProfileResponse(
        id=current_user.public_id,
        name=current_user.name,
        email=current_user.email,
        default_travel_style=current_user.default_travel_style or "Family",
        created_at=current_user.created_at,
        total_trips=analytics["total_trips"],
        total_budget=analytics["total_budget"],
        total_days=analytics["total_days"],
        destinations=analytics["destinations"],
    )


@router.put("/profile", response_model=UserResponse)
def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Update traveler profile information (name, default travel style preference).
    Requires authenticated session.
    """
    if request.name is not None:
        current_user.name = request.name.strip()
    if request.default_travel_style is not None:
        current_user.default_travel_style = request.default_travel_style.strip()

    db.commit()
    db.refresh(current_user)

    return UserResponse.model_validate(current_user)


@router.put("/password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Change account password:
    - Verifies current password against stored bcrypt hash.
    - Hashes new password and persists to database.
    """
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect. Please double-check your password.",
        )

    current_user.password_hash = hash_password(request.new_password)
    db.commit()

    return {"message": "Password changed successfully."}


@router.delete("/account")
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """
    Permanently delete authenticated traveler account & cascade delete all associated trips (GDPR/Privacy).
    Requires authenticated session.
    """
    user_email = current_user.email
    db.delete(current_user)
    db.commit()

    return {
        "message": f"Account '{user_email}' and all associated travel records have been permanently deleted."
    }
