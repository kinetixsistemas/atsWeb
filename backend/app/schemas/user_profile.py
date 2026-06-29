from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserProfileResponse(BaseModel):
    id: str
    user_id: str
    full_name: str = ''
    avatar_url: str = ''
    email: str = ''
    created_at: datetime
    updated_at: datetime


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
