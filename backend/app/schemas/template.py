from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


class TemplateResponse(BaseModel):
    id: str
    name: str
    description: str = ''
    preview_url: str = ''
    category: str
    ats_optimized: bool = False
    popular: bool = False
    color_scheme: List[str] = []
    created_at: datetime
