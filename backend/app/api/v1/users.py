import logging
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.user_profile import UserProfileResponse, UserProfileUpdate
from app.api.dependencies import get_current_user
from app.core.security import supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get('/users/me', response_model=UserProfileResponse)
async def get_my_profile(user: dict = Depends(get_current_user)):
    user_id = user.get('id', user.get('sub', ''))
    email = user.get('email', '')

    response = supabase.table('user_profiles') \
        .select('*') \
        .eq('user_id', user_id) \
        .single() \
        .execute()

    if not response.data:
        profile = supabase.table('user_profiles').insert({
            'user_id': user_id,
        }).execute()
        if not profile.data:
            raise HTTPException(status_code=500, detail='Failed to create profile')
        data = profile.data[0]
    else:
        data = response.data

    data['email'] = email
    return UserProfileResponse(**data)


@router.patch('/users/me', response_model=UserProfileResponse)
async def update_my_profile(
    body: UserProfileUpdate,
    user: dict = Depends(get_current_user),
):
    user_id = user.get('id', user.get('sub', ''))
    email = user.get('email', '')

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail='No fields to update')

    updates['updated_at'] = 'now()'

    response = supabase.table('user_profiles') \
        .update(updates) \
        .eq('user_id', user_id) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail='Profile not found')

    data = response.data[0]
    data['email'] = email
    return UserProfileResponse(**data)
