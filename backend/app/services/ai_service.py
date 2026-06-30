import json
import logging
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

groq_client = Groq(api_key=settings.groq_api_key)

ANALYSIS_PROMPT = (
    'Eres un Analista Senior de Recursos Humanos y un experto en ATS (Applicant Tracking System).\n'
    'Tu objetivo es analizar el CV de un candidato junto con la descripcion de una vacante y proporcionar un informe detallado.\n'
    'DEBES responder EXCLUSIVAMENTE en formato JSON valido que coincida exactamente con la siguiente estructura:\n'
    '{\n'
    '  "match_percentage": un entero de 0 a 100,\n'
    ' "relevant_experience": [lista de experiencias laborales relevantes al puesto],\n'
    ' "irrelevant_experience": [lista de experiencias laborales que no son relevantes al puesto],\n'
    '  "missing_experience": [lista de experiencias laborales que faltan en el CV],\n'
    ' "años de experiencia requeridos.": un entero que representa los años de experiencia requeridos para el puesto,\n'
    '  "missing_skills": [lista de tecnologias o habilidades que faltan en el CV],\n'
    '  "strengths": [lista de puntos fuertes donde el candidato encaja perfectamente],\n'
    '  "recommendations": "consejo con 4 puntos a mejorar en formato de lista directo para optimizar el perfil"\n'
    '}\n'
    'No saludes, no des explicaciones fuera del JSON, se extremadamente objetivo.'
)

EXTRACTION_PROMPT = (
    'Eres un experto en parser de currículums vitae y sistemas ATS.\n'
    'Tu tarea es extraer TODA la información estructurada del CV proporcionado.\n'
    'DEBES responder EXCLUSIVAMENTE en formato JSON válido con esta estructura exacta:\n'
    '{\n'
    '  "personal_info": {\n'
    '    "full_name": "Nombre completo",\n'
    '    "email": "email@dominio.com",\n'
    '    "phone": "teléfono",\n'
    '    "location": "ubicación",\n'
    '    "linkedin": "URL de LinkedIn",\n'
    '    "portfolio": "URL de portafolio"\n'
    '  },\n'
    '  "professional_summary": "Resumen profesional del candidato",\n'
    '  "work_experience": [\n'
    '    {\n'
    '      "company": "Empresa",\n'
    '      "position": "Puesto",\n'
    '      "start_date": "Fecha inicio",\n'
    '      "end_date": "Fecha fin",\n'
    '      "current": false,\n'
    '      "description": ["descripción 1", "descripción 2"],\n'
    '      "achievements": ["logro 1", "logro 2"]\n'
    '    }\n'
    '  ],\n'
    '  "education": [\n'
    '    {\n'
    '      "institution": "Institución",\n'
    '      "degree": "Título",\n'
    '      "field": "Campo de estudio",\n'
    '      "start_date": "Fecha inicio",\n'
    '      "end_date": "Fecha fin",\n'
    '      "gpa": "GPA (opcional)"\n'
    '    }\n'
    '  ],\n'
    '  "skills": ["skill1", "skill2"],\n'
    '  "certifications": [\n'
    '    {\n'
    '      "name": "Nombre certificación",\n'
    '      "issuer": "Entidad emisora",\n'
    '      "date": "Fecha",\n'
    '      "expiration": "Fecha expiración (opcional)"\n'
    '    }\n'
    '  ],\n'
    '  "languages": [\n'
    '    {\n'
    '      "language": "Idioma",\n'
    '      "proficiency": "nivel (native|fluent|advanced|intermediate|basic)"\n'
    '    }\n'
    '  ],\n'
    '  "ats_score": un entero de 0 a 100,\n'
    '  "structure_issues": [\n'
    '    {\n'
    '      "section": "Sección del CV",\n'
    '      "issue": "Problema detectado",\n'
    '      "severity": "error|warning|info",\n'
    '      "recommendation": "Recomendación para mejorar"\n'
    '    }\n'
    '  ]\n'
    '}\n'
    'Si un campo no existe en el CV, usa valor por defecto (string vacío, lista vacía, etc).\n'
    'No saludes, no des explicaciones fuera del JSON.'
)


def _call_groq(system_prompt: str, user_content: str) -> dict:
    completion = groq_client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': user_content}
        ],
        temperature=0.2,
        response_format={'type': 'json_object'}
    )
    raw = completion.choices[0].message.content
    logger.info('Groq response received (length=%d)', len(raw))
    return json.loads(raw)


def analyze_cv_with_groq(job_description: str, cv_text: str) -> dict:
    return _call_groq(
        ANALYSIS_PROMPT,
        f"OFERTA DE TRABAJO:\n{job_description}\n\nCURRICULUM DEL CANDIDATO:\n{cv_text}"
    )


def extract_cv_with_groq(cv_text: str) -> dict:
    return _call_groq(
        EXTRACTION_PROMPT,
        f"CURRICULUM VITAE:\n{cv_text}"
    )
