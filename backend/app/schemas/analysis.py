from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class AnalysisRequest(BaseModel):
    job_description: str = Field(
        ...,
        min_length=10,
        max_length=4000,
        description='Texto completo de la vacante o perfil solicitado'
    )
    job_title: Optional[str] = Field(None, max_length=255, description='Título del puesto')
    company_name: Optional[str] = Field(None, max_length=255, description='Nombre de la empresa')

    @field_validator('job_description')
    @classmethod
    def not_empty_whitespace(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('La descripcion no puede estar vacia o contener solo espacios')
        return v


class AnalysisResponse(BaseModel):
    match_percentage: int = Field(..., ge=0, le=100, description='Porcentaje de compatibilidad')
    missing_skills: List[str] = Field(..., description='Habilidades faltantes en el CV')
    strengths: List[str] = Field(..., description='Puntos fuertes detectados')
    recommendations: str = Field(..., description='Sugerencias de optimizacion')


class AnalysisDB(BaseModel):
    id: str
    user_id: str
    job_description: str
    job_title: Optional[str] = ''
    company_name: Optional[str] = ''
    cv_filename: str
    cv_text: str = ''
    match_percentage: int
    missing_skills: List[str]
    strengths: List[str]
    recommendations: str
    status: str = 'completed'
    created_at: datetime


class HistoryResponse(BaseModel):
    analyses: List[AnalysisDB]
    total: int
