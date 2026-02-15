from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class UserContext(BaseModel):
    user_id: str = "default_user"
    interests: List[str] = []
    current_mood: Optional[str] = None
    recent_searches: List[str] = []

class Video(BaseModel):
    video_id: str
    title: str
    channel: str
    views: str
    published: str
    tags: List[str] = []
    transcript_summary: Optional[str] = None
    
    # Dynamic Scoring Fields
    base_score: float = 0.0
    hyperbolic_score: float = 0.0
    match_reason: Optional[str] = None
    
    # New field for Algorithm
    raw_views: int = 0
    like_count: int = 0
    comment_count: int = 0
    engagement_rate: float = 0.0

class HyperbolicIntent(BaseModel):
    sub_culture: str
    vibe: str
    target_audience: str
    boost_keywords: List[str]
    suppress_keywords: List[str]

class CreatorProfile(BaseModel):
    primary_skills: List[str] # e.g., ["Video Editing", "Storytelling", "Coding"]
    weekly_hours: int
    risk_tolerance: str # "Stable", "Balanced", "Experimental"
    preferred_categories: List[str] = []

class FeedRequest(BaseModel):
    query: str
    user_context: Optional[UserContext] = None
    
class FeedbackRequest(BaseModel):
    video_id: str
    is_relevant: bool
    context: List[str] = []
