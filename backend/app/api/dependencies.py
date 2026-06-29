import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client
from app.core.security import supabase

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception as e:
        logger.warning("Auth failed: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict | None:
    if credentials is None:
        return None
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception:
        return None
