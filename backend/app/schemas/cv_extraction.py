from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class PersonalInfo(BaseModel):
    full_name: str = ''
    email: str = ''
    phone: str = ''
    location: str = ''
    linkedin: str = ''
    portfolio: str = ''


class WorkExperience(BaseModel):
    company: str = ''
    position: str = ''
    start_date: str = ''
    end_date: str = ''
    current: bool = False
    description: List[str] = []
    achievements: List[str] = []


class Education(BaseModel):
    institution: str = ''
    degree: str = ''
    field: str = ''
    start_date: str = ''
    end_date: str = ''
    gpa: Optional[str] = None


class Certification(BaseModel):
    name: str = ''
    issuer: str = ''
    date: str = ''
    expiration: Optional[str] = None


class Language(BaseModel):
    language: str = ''
    proficiency: str = 'basic'


class StructureIssue(BaseModel):
    section: str = ''
    issue: str = ''
    severity: str = 'info'
    recommendation: str = ''


class CvExtractionResponse(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    professional_summary: str = ''
    work_experience: List[WorkExperience] = []
    education: List[Education] = []
    skills: List[str] = []
    certifications: List[Certification] = []
    languages: List[Language] = []
    ats_score: int = Field(0, ge=0, le=100)
    structure_issues: List[StructureIssue] = []


class CvExtractionDB(BaseModel):
    id: str
    user_id: str
    cv_filename: str
    storage_path: str = ''
    personal_info: dict = {}
    professional_summary: str = ''
    work_experience: list = []
    education: list = []
    skills: List[str] = []
    certifications: list = []
    languages: list = []
    ats_score: int = 0
    structure_issues: list = []
    created_at: datetime
