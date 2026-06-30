import os
import uuid
import logging
import io
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional
from app.schemas.analysis import AnalysisResponse, AnalysisDB, HistoryResponse
from app.services.cv_parser import validate_file_magic, extract_text_from_pdf
from app.services.ai_service import analyze_cv_with_groq
from app.api.dependencies import get_current_user, get_optional_user
from app.core.config import settings
from app.core.security import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post('/analyze-file', response_model=AnalysisResponse)
async def analyze_cv_file(
    job_description: str = Form(..., min_length=10, max_length=4000),
    file: UploadFile = File(...),
    job_title: Optional[str] = Form(None),
    company_name: Optional[str] = Form(None),
    user: dict | None = Depends(get_optional_user),
):
    
    # Leer contenido del archivo
    file_content = await file.read()

    if len(file_content) > settings.max_upload_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail='Archivo demasiado grande. Maximo 10MB permitido.'
        )

    ext_ok = any(file.filename.lower().endswith(ext) for ext in settings.allowed_extensions)
    if not ext_ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Formato no soportado. Sube un archivo PDF o DOCX.'
        )

    if not validate_file_magic(file_content, file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='El contenido del archivo no coincide con su extension. Posible manipulacion.'
        )
    
    # Extraer texto (asegúrate de que trabaje en memoria y no intente escribir en disco)
    cv_text = extract_text_from_pdf(file_content)
    if not cv_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='No se pudo extraer texto del archivo. Asegurate de que no sea una imagen escaneada.'
        )

    user_id = user.get('id', 'anonymous') if user else 'anonymous'

    # CLIENTE DE STORAGE: Usar get_supabase() correctamente

    try:
        storage_path = f"cvs/{user_id}/{uuid.uuid4()}_{file.filename}"
        get_supabase().storage.from_('cvs').upload(storage_path, file_content)
    except Exception as e:
        logger.warning('Supabase Storage upload failed: %s', str(e))

    # LLAMADA A GROQ
    try:
        result = analyze_cv_with_groq(job_description, cv_text)
        # Validación defensiva por si Groq devuelve strings en vez de tipos limpios
        if isinstance(result.get('match_percentage'), str):
            # Limpia caracteres como '%' y convierte a entero
            clean_pct = ''.join(filter(str.isdigit, result['match_percentage']))
            result['match_percentage'] = int(clean_pct) if clean_pct else 0
    except Exception as e:
        logger.error('Groq analysis failed: %s', str(e))
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail='Servicio de analisis de IA temporalmente no disponible.'
        )

    try:
        get_supabase().table('analyses').insert({
            'user_id': user_id,
            'job_description': job_description,
            'job_title': job_title or '',
            'company_name': company_name or '',
            'cv_filename': file.filename,
            'cv_text': cv_text,
            'match_percentage': result['match_percentage'],
            'missing_skills': result['missing_skills'],
            'strengths': result['strengths'],
            'recommendations': result['recommendations'],
            'status': 'completed',
        }).execute()
    except Exception as e:
        logger.warning('Failed to save analysis to DB: %s', str(e))

    return AnalysisResponse(**result)


@router.get('/analyses/history', response_model=HistoryResponse)
async def get_analysis_history(
    user: dict = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
):
    user_id = user.get('id', user.get('sub', ''))
    response = get_supabase().table('analyses') \
        .select('*', count='exact') \
        .eq('user_id', user_id) \
        .order('created_at', desc=True) \
        .limit(limit) \
        .offset(offset) \
        .execute()

    return HistoryResponse(
        analyses=[AnalysisDB(**row) for row in response.data],
        total=response.count or 0
    )


@router.get('/analyses/{analysis_id}', response_model=AnalysisDB)
async def get_analysis_detail(
    analysis_id: str,
    user: dict = Depends(get_current_user),
):
    user_id = user.get('id', user.get('sub', ''))
    response = get_supabase().table('analyses') \
        .select('*') \
        .eq('id', analysis_id) \
        .eq('user_id', user_id) \
        .single() \
        .execute()

    if not response.data:
        raise HTTPException(status_code=404, detail='Analysis not found')

    return AnalysisDB(**response.data)
