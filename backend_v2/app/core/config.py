from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "EvolveX System V2"
    
    # Database
    MONGO_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "evolvex_db"
    
    # Security
    SECRET_KEY: str = "supersecretkey_change_this_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 Week

    class Config:
        case_sensitive = True
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
