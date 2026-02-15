import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.core.models import FeedRequest, UserContext, Video, CreatorProfile, FeedbackRequest
from app.core.config import settings
from app.services.bedrock_agent import BedrockAgent
from app.services.ranking_engine import RankingEngine
from app.services.scraper import ScraperService

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
bedrock_agent = BedrockAgent()
ranking_engine = RankingEngine()
scraper_service = ScraperService() # Live Scraper

import asyncio

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(background_market_pulse())

async def background_market_pulse():
    """
    Simulates an 'Hourly' Market Pulse check.
    """
    print("🌅 Market Pulse Daemon Started")
    while True:
        try:
            print("\n📈 [Market Pulse] Analyzing Global Feed Velocity...")
            # perform a lightweight check
            trending = scraper_service.search_videos("trending now", limit=5)
            if trending:
                top_trend = trending[0]
                print(f"   🚀 Top Trend Detected: {top_trend.title} ({top_trend.views} views)")
                print(f"   📊 Velocity: {len(trending)} high-velocity videos tracked.")
            
            print("   ✅ Analysis Complete. Sleeping for 1 hour...\n")
            await asyncio.sleep(3600) # Run every hour
        except Exception as e:
            print(f"   ❌ Market Pulse Error: {e}")
            await asyncio.sleep(60)

@app.get("/")
def root():
    return {"message": "Hyperbolic Engine Online (Live Mode) 🚀"}

@app.post("/creator/assessment")
async def create_creator_assessment(profile: CreatorProfile):
    """
    Generates a strategic assessment for a new creator.
    Input: Skills, Risk Tolerance, Time Commitment.
    Output: Ranked list of Blue Ocean niches.
    """
    from app.services.creator_service import CreatorService
    service = CreatorService()
    return await service.generate_assessment(profile)

@app.post("/consumer/feedback")
async def receive_consumer_feedback(feedback: FeedbackRequest):
    """
    Updates the Global Demand Matrix based on consumer relevance feedback.
    """
    ranking_engine.incorporate_feedback(feedback.video_id, feedback.is_relevant)
    return {"status": "Feedback Received", "matrix_updated": True}

@app.post("/creator/insights")
async def get_creator_insights(request: FeedRequest):
    """
    Analyzes a niche for Blue Ocean opportunities.
    """
    from app.services.creator_service import CreatorService
    service = CreatorService()
    return await service.analyze_niche(request.query)

# --- Creator Studio Endpoints ---

class ScriptRequest(BaseModel):
    topic: str
    angle: str

class RepurposeRequest(BaseModel):
    transcript: str
    format: str

class SummaryRequest(BaseModel):
    transcript: str

@app.post("/creator/tools/script")
async def generate_script(req: ScriptRequest):
    from app.services.creator_service import CreatorService
    return {"script": CreatorService().generate_script(req.topic, req.angle)}

@app.post("/creator/tools/summarize")
async def summarize_video(req: SummaryRequest):
    from app.services.creator_service import CreatorService
    return CreatorService().summarize_video(req.transcript)

@app.post("/creator/tools/repurpose")
async def repurpose_content(req: RepurposeRequest):
    from app.services.creator_service import CreatorService
    return {"content": CreatorService().repurpose_content(req.transcript, req.format)}

@app.post("/feed")
def get_hyperbolic_feed(request: FeedRequest):
    """
    The Core Hyperbolic Endpoint.
    1. Analyzes Intent (Bedrock)
    2. Retrieves Candidates (Live yt-dlp)
    3. Hyperbolically Ranks (Ranking Engine)
    """
    print(f"🔥 Request: {request.query}")
    context = request.user_context or UserContext()
    
    try:
        # Step 1: Vibe Check (Intent Analysis)
        intent = bedrock_agent.analyze_vibe(request.query, context)
        print(f"🧠 Detected Intent: {intent.sub_culture} ({intent.vibe})")
        
        # Step 2: Retrieval (Live Scraping)
        print("🕵️‍♀️ Fetching real-world data...")
        candidates = scraper_service.search_videos(request.query, limit=15)
        
        if not candidates:
             print("⚠️ No videos found or scraping failed.")
             return {"intent": intent, "feed": [], "message": "Scraping failed or no results."}
        
        # Step 3: Hyperbolic Boosting (Signal-to-Noise)
        ranked_videos = ranking_engine.rank_videos(candidates, intent)
        
        return {
            "intent": intent,
            "feed": ranked_videos
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
