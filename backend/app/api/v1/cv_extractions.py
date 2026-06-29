import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.schemas.cv_extraction import CvExtractionResponse, CvExtractionDB
from app.services.cv_parser import validate_file_magic, extract_cv_data
from app.api.dependencies import get_current_user, get_optional_user
from app.core.config import settings
from app.core.security import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post('/extract', response_model=CvExtractionResponse)
async def extract_cv_data_endpoint(
    file: UploadFile = File(...),
    user: dict = Depends(get_optional_user),
):
    file_content = await file.read()

    if len(file_content) > settings.max_upload_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail='Archivo demasiado grande. Maximo 10MB permitido.'
        )

    if not any(file.filename.lower().endswith(ext) for ext in settings.allowed_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Formato no soportado. Sube PDF o DOCX.'
        )

    if not validate_file_magic(file_content, file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='El contenido del archivo no coincide con su extension.'
        )

    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    local_path = os.path.join(settings.upload_dir, safe_filename)
    os.makedirs(settings.upload_dir, exist_ok=True)
    with open(local_path, 'wb') as f:
        f.write(file_content)

    user_id = user.get('id', user.get('sub', '')) if user else None
    storage_path = ''

    try:
        storage_path = f"cvs/{user_id}/{safe_filename}"
        get_supabase().storage.from_('cvs').upload(storage_path, file_content)
    except Exception as e:
        logger.warning('Supabase Storage upload failed: %s', str(e))

    try:
        result = extract_cv_data(file_content, file.filename)
    except Exception as e:
        logger.error('CV extraction failed: %s', str(e))
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f'Error al procesar el CV: {str(e)}'
        )

    try:
        get_supabase().table('cv_extractions').insert({
            'user_id': user_id,
            'cv_filename': file.filename,
            'storage_path': storage_path,
            'personal_info': result.get('personal_info', {}),
            'professional_summary': result.get('professional_summary', ''),
            'work_experience': result.get('work_experience', []),
            'education': result.get('education', []),
            'skills': result.get('skills', []),
            'certifications': result.get('certifications', []),
            'languages': result.get('languages', []),
            'ats_score': result.get('ats_score', 0),
            'structure_issues': result.get('structure_issues', []),
        }).execute()
    except Exception as e:
        logger.warning('Failed to save extraction to DB: %s', str(e))

    return CvExtractionResponse(**result)


@router.get('/extractions/history')
async def get_extraction_history(
    user: dict = Depends(get_current_user),
    limit: int = 20,
    offset: int = 0,
):
    user_id = user.get('id', user.get('sub', ''))
    response = get_supabase().table('cv_extractions') \
        .select('*', count='exact') \
        .eq('user_id', user_id) \
        .order('created_at', desc=True) \
        .limit(limit) \
        .offset(offset) \
        .execute()

    return {
        'extractions': [CvExtractionDB(**row) for row in response.data],
        'total': response.count or 0
    }
