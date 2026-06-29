import logging
from fastapi import APIRouter, HTTPException, status
from app.schemas.template import TemplateResponse
from app.core.security import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get('/templates', response_model=list[TemplateResponse])
async def list_templates():
    response = get_supabase().table('templates') \
        .select('*') \
        .order('popular', desc=True) \
        .execute()

    return [TemplateResponse(**row) for row in response.data]


@router.get('/templates/{template_id}', response_model=TemplateResponse)
async def get_template(template_id: str):
    response = get_supabase().table('templates') \
        .select('*') \
        .eq('id', template_id) \
        .single() \
        .execute()

    if not response.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Template not found')

    return TemplateResponse(**response.data)
