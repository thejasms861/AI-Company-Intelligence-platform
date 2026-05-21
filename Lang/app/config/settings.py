import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Dict, List

class Settings(BaseSettings):
    # Provider API Keys
    GOOGLE_API_KEY: str = ""
    GITHUB_TOKEN: str = ""
    GROQ_API_KEY: str = ""

    # Concurrency and Rate Limiting
    MAX_CONCURRENT_WORKERS: int = 5
    GROQ_RPM: int = 30
    GEMINI_RPM: int = 15
    OPENAI_RPM: int = 50

    # Provider default models
    DEFAULT_GEMINI_MODEL: str = "gemini-2.5-flash"
    DEFAULT_GROK_MODEL: str = "grok-3"
    DEFAULT_GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    # Fallback models (if primary fails)
    FALLBACK_GROK_MODEL: str = "gpt-4o-mini"
    FALLBACK_GROQ_MODEL: str = "mixtral-8x7b-32768"

    # Pipeline Settings
    SCHEMA_FILE: str = os.path.join(os.path.dirname(__file__), "schema.tsv")
    BATCH_SIZE: int = 15 # parameters per prompt
    MAX_RETRIES: int = 3
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
