import logging
from fastapi import APIRouter
from app.schemas.subscription import SubscriptionPlanResponse
from app.core.security import supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get('/subscriptions/plans', response_model=list[SubscriptionPlanResponse])
async def list_plans():
    response = supabase.table('subscription_plans') \
        .select('*') \
        .order('price') \
        .execute()

    return [SubscriptionPlanResponse(**row) for row in response.data]
