import uvicorn
import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
from typing import List, Dict, Optional, Any
from app.core.models import FeedRequest, UserContext, Video, CreatorProfile, FeedbackRequest, SubCulture
from app.core.config import settings
from app.services.bedrock_agent import BedrockAgent
from app.services.ranking_engine import RankingEngine
from app.services.youtube_client import YouTubeClient
from app.services.analytics_service import CreatorAnalyticsService
from app.services.creator_service import CreatorService
from app.services.translation_engine import TranslationEngine

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Shared Services
bedrock_agent = BedrockAgent()
youtube_client = YouTubeClient() # Live YouTube API
ranking_engine = RankingEngine(bedrock_agent=bedrock_agent)
from app.services.audio_processor import AudioProcessor
audio_processor = AudioProcessor()

analytics_service = CreatorAnalyticsService(
    bedrock_agent=bedrock_agent,
    youtube_client=youtube_client,
    demo_mode=settings.DEMO_MODE if hasattr(settings, 'DEMO_MODE') else True
)
creator_service = CreatorService(
    youtube_client=youtube_client,
    bedrock_agent=bedrock_agent,
    ranking_engine=ranking_engine
)
translation_engine = TranslationEngine()

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
            trending = await youtube_client.deep_search(["trending now high signal"], max_results_per_query=5)
            if trending:
                top_trend = trending[0]
                print(f"   🚀 Top Trend Detected: {top_trend['title']} ({top_trend['views']} views)")
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
    return await creator_service.generate_assessment(profile)

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
    return await creator_service.analyze_niche(request.query)

# --- User Onboarding & Personalization ---

class InterestMapRequest(BaseModel):
    interests: List[str]

@app.post("/user/map-interests")
async def map_user_interests(req: InterestMapRequest):
    """
    Step 2 of Onboarding: Maps broad interests to Deep Hyperbolic Vectors.
    """
    deep_interests = await bedrock_agent.map_interests(req.interests)
    return {"deep_interests": deep_interests}

class AtlasMappingRequest(BaseModel):
    interests: List[str]
    style: str
    goal: str
    audience: str
    tools: List[str]
    language: str
    example: str

@app.post("/creator/atlas-mapping")
async def generate_atlas_mapping(req: AtlasMappingRequest):
    """
    Step 7 of Onboarding: Maps the creator's multimodal quiz answers to precise Atlas coordinates.
    """
    prompt = f"""
    The creator has completed the onboarding quiz with the following psychology:
    Interests: {req.interests}
    Format Style: {req.style}
    Creative Goal: {req.goal}
    Target Audience: {req.audience}
    Tools: {req.tools}
    Language: {req.language}
    
    Return a JSON object containing:
    1. "placement_string": A magical-sounding placement sentence (e.g. "Music -> Punjabi Music, Education -> Storytelling").
    2. "domain_id": The closest matching domain ID from: ["music", "fashion", "science", "cinema", "art", "business", "food", "travel", "gaming", "education", "comedy"].
    3. "personalized_name": A unique 2-3 word name for this creator's niche "mountain" (e.g. "The Synthwave Sanctuary").
    4. "mountain_steps": A list of exactly 5 specific, passionate, and evocative titles for the "steps" of this creator's journey, from base to peak (e.g., ["The Lofi Foundation", "Analog Experiments", "Midnight Sessions", "The Vinyl Vault", "The Analog Master"]). These should reflect the specific sub-niche identified.
    """
    DOMAIN_COORDS = {
        "music": {"x": -40, "z": 0},
        "fashion": {"x": -32, "z": -15},
        "science": {"x": -24, "z": 5},
        "cinema": {"x": -16, "z": -10},
        "art": {"x": -8, "z": 10},
        "business": {"x": 0, "z": -5},
        "food": {"x": 8, "z": 5},
        "travel": {"x": 16, "z": -15},
        "gaming": {"x": 24, "z": 0},
        "education": {"x": 32, "z": -20},
        "comedy": {"x": 40, "z": 10}
    }

    try:
        if settings.DEMO_MODE:
            domain_id = "gaming" if "Gaming" in str(req.interests) else "science"
            return {
                "placement_string": f"Culture -> {req.language} Creators, Format -> {req.style.title()}",
                "domain_id": domain_id,
                "coordinates": DOMAIN_COORDS.get(domain_id, {"x": 0, "z": 0}),
                "personalized_name": f"{req.style.title()} Explorer Peak",
                "mountain_steps": [
                    f"The {req.interests[0]} Foundation",
                    f"{req.style.title()} Masterclass",
                    f"{req.audience.title()} Engagement",
                    f"Advanced {req.tools[0] if req.tools else 'Creative'} Workflows",
                    f"The {req.personalized_name or 'Personal'} Peak Mastery"
                ]
            }
            
        res = await bedrock_agent._invoke_bedrock(prompt)
        domain_id = res.get("domain_id", "science").lower()
        return {
            "placement_string": res.get("placement_string", f"Mapped to {req.language} communities"),
            "domain_id": domain_id,
            "coordinates": DOMAIN_COORDS.get(domain_id, {"x": 0, "z": 0}),
            "personalized_name": res.get("personalized_name", "Creator Peak"),
            "mountain_steps": res.get("mountain_steps", ["Foundation", "Growth", "Engagement", "Mastery", "Legacy"])
        }
    except Exception as e:
        print(f"Atlas Mapping Failed: {e}")
        return {
            "placement_string": f"Fallback Mapping -> {req.style} / {req.language}",
            "domain_id": "science",
            "coordinates": DOMAIN_COORDS["science"]
        }

# --- Creator Studio Endpoints ---

class ScriptRequest(BaseModel):
    topic: str
    angle: str

class PlannerRequest(BaseModel):
    niche: str
    platforms: List[str]
    days: int
    tone: str

class RepurposeRequest(BaseModel):
    transcript: str
    format: str

class ForgeRequest(BaseModel):
    url: str
    format: str

class SummaryRequest(BaseModel):
    transcript: str

class VisionRequest(BaseModel):
    community_name: str
    quiz_context: Dict[str, Any]

@app.post("/creator/community-vision")
async def get_community_vision(req: VisionRequest):
    return await creator_service.generate_community_vision(req.community_name, req.quiz_context)
@app.post("/creator/tools/script")
async def generate_script(req: ScriptRequest):
    return {"script": await creator_service.generate_script(req.topic, req.angle)}

@app.post("/creator/tools/planner")
async def generate_planner(req: PlannerRequest):
    return {"content": await creator_service.generate_content_planner(req.niche, req.platforms, req.days, req.tone)}

@app.post("/creator/tools/summarize")
async def summarize_video(req: SummaryRequest):
    return await creator_service.summarize_video(req.transcript)

@app.post("/creator/tools/repurpose")
async def repurpose_content(req: RepurposeRequest):
    return {"content": await creator_service.repurpose_content(req.transcript, req.format)}

@app.post("/creator/tools/forge")
async def forge_content(req: ForgeRequest):
    """
    Takes a YouTube URL, extracts the transcript, and uses Bedrock to repurpose
    it into high-signal content for Twitter, LinkedIn, Hashnode, or Reels.
    """
    video_id = youtube_client.extract_video_id(req.url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
    print(f"🔨 Forging Content for Video ID: {video_id} -> {req.format.upper()}")
    
    transcript = await youtube_client.get_captions(video_id)
    if not transcript:
        # Fallback 1: Try Audio Extraction
        try:
             audio_path = await audio_processor.extract_transcript(video_id)
             if audio_path:
                  translated = await translation_engine.translate_video(audio_path)
                  transcript = translated.get("translated_text", "")
             
             # Fallback 2: If audio extraction fails or no API keys, grab Title & Description instead
             if not transcript:
                  print(f"⚠️ Transcript unavailable for {video_id}. Using Video Metadata as fallback context.")
                  videos = await youtube_client.get_video_details([video_id])
                  if videos:
                      v = videos[0]
                      transcript = f"Title: {v.get('title', '')}\n\nDescription: {v.get('description', '')}"
                  else:
                      transcript = "General content creation tips." # Extreme fallback
        except Exception as e:
             raise HTTPException(status_code=500, detail=f"Could not extract transcript or metadata: {e}")
             
    # Route through the existing repurpose pipeline with the exact format
    result = await creator_service.repurpose_content(transcript, req.format)
    return {"content": result}

class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "hi"

@app.post("/translate")
async def translate_content(req: TranslateRequest):
    result = await translation_engine.translate_text(req.text, req.target_lang)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.post("/translate/video")
async def translate_video_endpoint(req: Dict[str, str]):
    video_id = req.get("video_id")
    title = req.get("title", "Unknown Video")
    
    if not video_id:
        raise HTTPException(status_code=400, detail="Missing video_id")
    
    print(f"🎬 [Video Translation] Request for ID: {video_id}")
    
    # 1. Try real audio extraction
    audio_path = await audio_processor.extract_transcript(video_id)
    
    if audio_path and os.path.exists(audio_path):
        try:
            # 2. Translate audio content to English
            result = await translation_engine.translate_video(audio_path)
            
            # Cleanup
            if os.path.exists(audio_path):
                os.remove(audio_path)
                
            if "error" not in result:
                return result
            
            print(f"⚠️ [Video Translation] Audio translation failed, falling back to title: {result.get('error')}")
        except Exception as e:
            print(f"⚠️ [Video Translation] Audio pipeline crashed, falling back to title: {str(e)}")
            if os.path.exists(audio_path):
                os.remove(audio_path)

    # 3. Fallback: Translate the Title + Description text
    description = req.get("description", "")
    full_text = f"Title: {title}\nDescription: {description}" if description else title
    
    print(f"📝 [Video Translation] Falling back to text translation for: {title}")
    text_result = await translation_engine.translate_text(full_text, target_lang="en")
    
    # Enrich result to look like video translation
    return {
        "original_text": full_text,
        "translated_text": text_result.get("translated_text", full_text),
        "audio_base64": text_result.get("audio_base64", ""),
        "provider": f"{text_result.get('provider', 'Sarvam')} (Text Fallback)"
    }

@app.post("/feed")
async def get_hyperbolic_feed(request: FeedRequest):
    """
    The Core Hyperbolic Endpoint.
    1. Analyzes Intent (Bedrock)
    2. Retrieves Candidates (Live YouTube API)
    3. Hyperbolically Ranks (Ranking Engine)
    """
    print(f"🔥 Request: {request.query}")
    context = request.user_context or UserContext()
    
    try:
        # Step 1: Vibe Check (Intent Analysis)
        intent = await bedrock_agent.analyze_vibe(request.query, context)
        print(f"🧠 Detected Intent: {intent.sub_culture} ({intent.vibe})")

        # Step 2: Retrieval (Live Scraping)
        search_query = request.query
        
        # DISCOVERY MODE: If no query, pick a random deep interest or rotate
        if not search_query and context.deep_interests:
            import random
            discovery_interest = random.choice(context.deep_interests)
            search_query = discovery_interest.name
            print(f"🎲 Discovery Mode: Searching for '{search_query}'")
            
        print(f"🕵️‍♀️ Fetching real-world data for: {search_query}...")
        
        # Generate Multiple Regional Search Seeds (Balanced for Quota)
        queries = [search_query or "trending high-signal tech"]
        if intent.boost_keywords:
            # Create a separate query for each boost keyword (Capped at 4 additional for quota)
            for keyword in intent.boost_keywords[:4]: 
                queries.append(f"{search_query} {keyword}")
            
        print(f"🔍 Executing 5 deep strategic queries: {queries}")

        # Note: YouTubeClient returns dictionaries, not Video objects directly.
        candidates_data = await youtube_client.deep_search(queries, max_results_per_query=50)
        
        if not candidates_data:
             error_msg = "YouTube API Quota Exhausted" if youtube_client.exhausted else "No videos found or try a broader query"
             print(f"⚠️ {error_msg}")
             return {"intent": intent, "feed": [], "message": error_msg}
             
        # JIT RAG View-Count Filter (DEACTIVATED per user request for broad reach)
        # MAX_VIEWS = 50000
        filtered_candidates_data = candidates_data 
        
        print(f"✅ Processing {len(filtered_candidates_data)} candidates across all view counts.")

        # Step 2b: FAST DISCOVERY (Metadata-Only Mapping)
        # We skip deep ASR/Vision for the initial 500+ candidates to hit <2s latency
        candidates = []
        for d in filtered_candidates_data:
            v_kwargs = {
                "video_id": d.get("video_id"),
                "title": d.get("title"),
                "description": d.get("description"),
                "channel": d.get("channel_title"),
                "views": str(d.get("views")),      
                "published": d.get("published_at"),
                "tags": d.get("tags", []),
                "transcript_summary": d.get("description"), # Metadata-only for fast ranking
                "raw_views": d.get("views", 0),
                "like_count": d.get("likes", 0)
            }
            candidates.append(Video(**v_kwargs))

        print(f"📊 Initial metadata-based ranking for {len(candidates)} candidates...")
        
        # Step 3: Fast Ranking (Metadata Path)
        initial_ranked = await ranking_engine.rank_videos(candidates, intent)
        
        # Step 4: Deferred Deep Enrichment (Top 10 Only)
        # Further reducing to top 10 for blazing speed
        top_slice = initial_ranked[:10]
        
        async def deep_enrich(video):
            transcript = await youtube_client.get_captions(video.video_id)
            if not transcript:
                transcript = await audio_processor.extract_transcript(video.video_id)
            if not transcript:
                 await bedrock_agent.generate_multimodal_embeddings(
                     text=video.description, image_base64=None
                 )
                 transcript = f"[VISION CONTEXT] Deep visual analysis completed."
                 
            video.transcript_summary = transcript or video.description
            return video

        print(f"🧠 Deep Enrichment for Top 10 Candidates...")
        enriched_top_slice = await asyncio.gather(*(deep_enrich(v) for v in top_slice))
        
        final_feed = enriched_top_slice + initial_ranked[10:50] 
        
        return {
            "intent": intent,
            "feed": final_feed,
            "ambiguous": False
        }

        
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


class TerrainRequest(BaseModel):
    domain: str
    parent_topic: Optional[str] = None
    watch_history: Optional[List[str]] = []

@app.post("/explore/generate_terrain")
async def generate_terrain(request: TerrainRequest):
    """
    Calls AWS Bedrock (Claude) to generate personalized niche topics for the Explore Terrain.
    Based on the current domain, depth level, and user watch history.
    """
    try:
        topics = await bedrock_agent.generate_terrain_niches(
            domain=request.domain,
            parent_topic=request.parent_topic,
            watch_history=request.watch_history or []
        )
        return {"topics": topics, "domain": request.domain, "parent": request.parent_topic}
    except Exception as e:
        print(f"❌ Terrain Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


# ─────────────────────────────────────────────────────────────────────────────
# CREATOR ANALYTICS ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

class AnalyticsRequest(BaseModel):
    channel_id: Optional[str] = None
    niche: Optional[str] = None
    interests: Optional[List[str]] = []

@app.get("/creator/analytics/growth")
async def get_growth_analytics(channel_id: Optional[str] = Query(default=None)):
    """
    Returns the creator's growth metrics.
    LIVE: YouTube Analytics API → total views, engagement rate, subscriber delta, watch time.
    MOCK (DEMO_MODE=True): Returns rich structured demo data.
    """
    try:
        data = await analytics_service.get_growth_stats(channel_id=channel_id)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/creator/analytics/community")
async def get_community_signals(
    channel_id: Optional[str] = Query(default=None),
    video_ids: Optional[str] = Query(default=None, description="Comma-separated video IDs")
):
    """
    Returns audience sentiment breakdown, high-signal community activity, and loyalty score.
    LIVE: Fetches recent YouTube comments → runs Bedrock sentiment analysis.
    MOCK: Returns structured demo data.
    """
    try:
        ids = video_ids.split(",") if video_ids else None
        data = await analytics_service.get_community_signals(
            channel_id=channel_id,
            recent_video_ids=ids
        )
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/creator/analytics/opportunities")
async def get_content_opportunities(req: AnalyticsRequest):
    """
    Generates AI-scored content opportunities for the creator.
    LIVE: Calls Bedrock with community signal context to generate & score video ideas.
    Score formula: (market_gap_score × CTR_baseline) ÷ supply_index → /100
    MOCK: Returns representative opportunities with scores.
    """
    try:
        data = await analytics_service.get_opportunities(
            niche=req.niche,
            interests=req.interests,
        )
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/creator/analytics/overview")
async def get_analytics_overview(req: AnalyticsRequest):
    """
    Unified endpoint for all dashboard metrics (growth, community, opportunities).
    Prevents UI lag by reducing concurrent network requests.
    """
    try:
        data = await analytics_service.get_overview_stats(
            channel_id=req.channel_id,
            niche=req.niche,
            interests=req.interests
        )
        return {"success": True, "data": data}
    except Exception as e:
        print(f"❌ Analytics Overview Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
