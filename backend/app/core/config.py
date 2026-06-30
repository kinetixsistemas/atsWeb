import os
from pydantic_settings import BaseSettings
from typing import List

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class Settings(BaseSettings):
    app_name: str = "ATS Personal API"
    version: str = "1.0.0"
    debug: bool = True

    groq_api_key: str = ''
    groq_model: str = "llama-3.3-70b-versatile"

    supabase_url: str = ''
    supabase_service_key: str = ''
    supabase_anon_key: str = ''

    upload_dir: str = "uploads"
    max_upload_size: int = 10 * 1024 * 1024
    allowed_extensions: List[str] = ['.pdf', '.doc', '.docx']

    cors_origins: List[str] = ["http://localhost:4200", "https://ats-web-bice.vercel.app"]

    rate_limit_per_minute: int = 10

    class Config:
        env_file = os.path.join(_BACKEND_DIR, ".env")


settings = Settings()
