# app/core/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "GymAI API"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # Security
    SECRET_KEY: str = "rahasia_super_kunci_ganti_dengan_random_string_panjang_sekali_12345" # Sebaiknya taruh di .env juga
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")

settings = Settings()
