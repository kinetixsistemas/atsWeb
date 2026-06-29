from pydantic import BaseModel, Field
from typing import List
from datetime import datetime


class SubscriptionPlanResponse(BaseModel):
    id: str
    name: str
    price: float
    currency: str = 'USD'
    interval: str
    features: List[str] = []
    highlighted: bool = False
    created_at: datetime
