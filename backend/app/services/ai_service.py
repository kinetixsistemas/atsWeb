import json
import logging
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

groq_client = Groq(api_key=settings.groq_api_key)

ANALYSIS_PROMPT = (
    "You are the core algorithmic sorting engine of an enterprise-grade corporate Applicant Tracking System (ATS).\n"
    "Your function is to evaluate the candidate's CV suitability against the job description in a cold, mathematical, and highly critical manner. "
    "Do NOT assume any capabilities that are not explicitly detailed in the CV text. If a technology, skill, or experience is not mentioned, it MUST be treated as MISSING.\n\n"
    
    "STRICT SCORING CRITERIA FOR CALCULATING 'match_percentage' (Total Sum = 100%):\n"
    "1. Mandatory Technical Stack (Weight: 40%): Divide this percentage equally among the core technologies explicitly required in the job description. For example, if the vacancy requires 5 key technologies and the CV only lists 2, the candidate scores exactly 16% out of 40%.\n"
    "2. Required Years of Experience (Weight: 30%):\n"
    "   - If the CV meets or exceeds the required years of experience: 30%.\n"
    "   - If the CV shows relevant experience but falls short of the minimum years requested: Calculate a strict, proportional score (e.g., if 5 years are required and the CV proves 1 year, grant exactly 6%).\n"
    "   - If the experience is listed as 'ongoing/in progress', is related to student work/internships, or lacks clear start/end dates to compute cumulative professional experience: 0%.\n"
    "3. Role Alignment, Responsibilities, and Functions (Weight: 30%): Critically evaluate if the candidate's past workloads align with the specific challenges of the target job (e.g., data migrations, SEO architecture, visual interface design). If the tech stack matches but the past scopes of work are entirely different, heavily penalize this section.\n\n"

    "OUTPUT AND LANGUAGE RULES:\n"
    "- CRITICAL: All string values inside the JSON output MUST be written in SPANISH.\n"
    "- Do not sugarcoat suggestions. Be direct, harsh, blunt, and corporate.\n"
    "- The JSON output must be perfectly valid. Do NOT include any introductory text, markdown explanations outside the block, or concluding notes.\n\n"
    "You MUST respond EXCLUSIVELY with the following JSON structure:\n"
    "{\n"
    "  \"match_percentage\": an integer from 0 to 100 calculated strictly under the 3 rules above,\n"
    "  \"relevant_experience\": [list of strings in Spanish showcasing only the past experience that directly adds value to the target job],\n"
    "  \"irrelevant_experience\": [list of strings in Spanish listing technologies, tools, or past roles from the CV that provide zero value to this specific vacancy],\n"
    "  \"missing_experience\": [list of strings in Spanish detailing required operational areas, workflows, or senior-level responsibilities that the candidate lacks],\n"
    "  \"years_of_experience_required\": an integer representing the minimum years required by the vacancy,\n"
    "  \"missing_skills\": [list of strings in Spanish naming the required technologies, tools, or technical methodologies missing from the CV],\n"
    "  \"strengths\": [list of strings in Spanish highlighting the specific tech requirements where the candidate matches flawlessly],\n"
    "  \"recommendations\": \"A single string in Spanish containing a direct, blunt list of 4 critical profile optimization points focused heavily on patching technical gaps.\"\n"
    "}"
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
