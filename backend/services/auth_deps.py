# ==============================================================================
# 4. SERVICES: Auth Dependencies (JWT Bearer Token Extraction & Route Guards)
# ==============================================================================

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from services.auth_service import decode_access_token

# Bearer Token Scheme extractor
security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI Dependency that extracts and verifies Bearer JWT token from Authorization header.
    Returns the authenticated User ORM entity.
    Raises 401 Unauthorized if missing, expired, or invalid.
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    
    user_id_raw = payload.get("sub")
    if not user_id_raw:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing subject identifier.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str = str(user_id_raw).strip()
    if user_id_str.isdigit():
        user = db.query(User).filter((User.public_id == user_id_str) | (User.id == int(user_id_str))).first()
    else:
        user = db.query(User).filter(User.public_id == user_id_str).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    """
    FastAPI Dependency for endpoints accessible by both guests and authenticated users.
    Returns User if a valid Bearer token is provided, otherwise returns None without raising 401.
    """
    if credentials is None or not credentials.credentials:
        return None

    try:
        payload = decode_access_token(credentials.credentials)
        user_id_raw = payload.get("sub")
        if not user_id_raw:
            return None
        user_id_str = str(user_id_raw).strip()
        if user_id_str.isdigit():
            return db.query(User).filter((User.public_id == user_id_str) | (User.id == int(user_id_str))).first()
        return db.query(User).filter(User.public_id == user_id_str).first()
    except Exception:
        return None

