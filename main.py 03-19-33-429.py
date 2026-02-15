import uvicorn
import math
import json
import boto3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from youtubesearchpython import VideosSearch
from botocore.exceptions import NoCredentialsError, ClientError

# --- CONFIGURATION ---
# Set to True to use AWS Bedrock. If False (or if keys are missing), it falls back to math.
USE_BEDROCK = True 

# --- 1. DEFINE INPUT ---
class UserInput(BaseModel):
    text: str

# --- 2. THE HYPERBOLIC ENGINE (AWS BEDROCK EDITION) ---
class Hyperbolic_Engine:
    def __init__(self):
        print("✅ Hyperbolic Engine Online")
        self.bedrock = None
        
        if USE_BEDROCK:
            try:
                # Connect to AWS Bedrock (US-East-1 is standard for Bedrock)
                self.bedrock = boto3.client(service_name='bedrock-runtime', region_name='us-east-1')
                print("🔹 AWS Bedrock Connected: Using Claude 3 Haiku for AI Audits")
            except NoCredentialsError:
                print("⚠️ AWS Credentials not found. Running in 'Simulation Mode' (Math Only).")
            except Exception as e:
                print(f"⚠️ Bedrock Connection Error: {e}")

    def _get_ai_score(self, query, title, description):
        """
        Uses AWS Bedrock (Claude 3 Haiku) to judge 'Information Density'.
        This satisfies the 'Meaningful Use of AI' hackathon requirement.
        """
        if not self.bedrock:
            return 50.0 # Neutral fallback if no AI

        prompt = f"""
        You are an impartial search engine auditor.
        User Query: "{query}"
        
        Analyze this video:
        Title: {title}
        Description: {description}
        
        Task: Assign a 'Semantic Density Score' (0-100).
        - High Score (85-100): Highly technical, specific, educational, dense information.
        - Low Score (0-40): Clickbait, vague, generic fluff, or pure entertainment.
        
        Output ONLY the number. No text.
        """

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 10,
            "messages": [{"role": "user", "content": prompt}]
        })

        try:
            response = self.bedrock.invoke_model(
                modelId='anthropic.claude-3-haiku-20240307-v1:0', 
                body=body
            )
            response_body = json.loads(response['body'].read())
            score = response_body['content'][0]['text'].strip()
            return float(score)
        except Exception as e:
            print(f"⚠️ AI Audit Failed: {e}")
            return 50.0

    def _calculate_recency_score(self, published_text):
        t = published_text.lower()
        if 'hour' in t: return 1.0      # Fresh
        if 'day' in t: return 0.9       # Recent
        if 'week' in t: return 0.7
        if 'month' in t: return 0.5
        if 'year' in t: return 0.2      # Old
        return 0.3

    def search(self, query):
        print(f"🔍 Scanning Global Index for: {query}")
        try:
            # 1. Scrape YouTube (Get 15 candidates)
            search = VideosSearch(query, limit=15)
            results = search.result()['result']
            
            processed_data = []
            
            for video in results:
                # Extract Data
                title = video['title']
                # Safety check for missing descriptions
                desc_snippets = video.get('descriptionSnippet')
                desc = desc_snippets[0]['text'] if desc_snippets else ""
                
                published = video.get('publishedTime', 'Unknown')
                views_text = video.get('viewCount', {'text': '0'})['text']
                
                # 2. THE AI AUDIT (Or Math Fallback)
                # We ask Claude 3: "Is this actually good?"
                if self.bedrock:
                    density_score = self._get_ai_score(query, title, desc)
                    recency = self._calculate_recency_score(published) * 100
                    
                    # Final Hyperbolic Formula: 70% AI Opinion + 30% Freshness
                    # We IGNORE view counts to be impartial.
                    final_score = (density_score * 0.7) + (recency * 0.3)
                else:
                    # Fallback Math (If no AWS keys)
                    recency = self._calculate_recency_score(published)
                    duration_bonus = 1.0 # Simplified for fallback
                    final_score = (recency * duration_bonus) * 90

                processed_data.append({
                    "label": title,
                    "video_id": video['id'],
                    "views": views_text,
                    "published": published,
                    "duration": video.get('duration', '0:00'),
                    "score": final_score,
                    "channel": video['channel']['name'],
                    "ai_audited": True if self.bedrock else False
                })

            # 3. Sort by Hyperbolic Score (Quality over Popularity)
            processed_data.sort(key=lambda x: x['score'], reverse=True)
            
            return processed_data[:6] # Return Top 6

        except Exception as e:
            print(f"❌ Error: {e}")
            return []

# --- 3. API SERVER ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = Hyperbolic_Engine()

@app.post("/process_real")
async def process_real(input_data: UserInput):
    results = engine.search(input_data.text)
    if results:
        return {"status": "success", "results": results}
    else:
        return {"status": "no_data", "results": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)