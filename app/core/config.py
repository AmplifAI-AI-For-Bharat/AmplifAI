import os
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "Hyperbolic Social Media"
    VERSION: str = "1.0.0"
    
    # AWS Settings
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "hyperbolic-pantry")
    OPENSEARCH_URL: str | None = os.getenv("OPENSEARCH_URL", None)
    # Feature Flags
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "True").lower() == "true"

    # API Keys
    YOUTUBE_API_KEYS: List[str] = [k.strip() for k in os.getenv("YOUTUBE_API_KEY", "").split(",") if k.strip()]
    BHASHINI_API_KEY: str | None = os.getenv("BHASHINI_API_KEY", "")
    SARVAM_API_KEY: str | None = os.getenv("SARVAM_API_KEY", "")

settings = Settings()
