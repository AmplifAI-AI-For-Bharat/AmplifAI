from typing import List, Dict, Any
from app.services.scraper import ScraperService
from app.services.ranking_engine import RankingEngine
from app.services.bedrock_agent import BedrockAgent
from app.core.models import Video, CreatorProfile
import math
import asyncio

class CreatorService:
    # ... (init and analyze_niche)

    async def generate_assessment(self, profile: CreatorProfile) -> Dict[str, Any]:
        """
        Generates a strategic assessment for a creator based on their profile.
        Returns a list of high-potential niches tailored to their skills and risk tolerance.
        """
        print(f"🧠 Generating Assessment for Profile: {profile.primary_skills} | Risk: {profile.risk_tolerance}")
        
        # 1. Get Strategic Suggestions
        suggestions = self.bedrock_agent.suggest_strategic_niches(profile)
        
        results = []
        for niche in suggestions:
            try:
                # 2. Analyze each suggestion (Lightweight check)
                # We use recursion_depth=1 to skip sub-niche drilling for speed
                analysis = await self.analyze_niche(niche, recursion_depth=1)
                if "error" not in analysis:
                    results.append(analysis)
            except Exception as e:
                print(f"assessment analysis failed for {niche}: {e}")
                
        # 3. Sort by Opportunity Score
        results.sort(key=lambda x: x.get('market_gap_score', 0), reverse=True)
        
        return {
            "profile_summary": f"{profile.risk_tolerance} Creator with skills in {', '.join(profile.primary_skills)}",
            "recommended_niches": results
        }
    def __init__(self):
        self.scraper = ScraperService()
        self.ranking_engine = RankingEngine()
        self.bedrock_agent = BedrockAgent()

    async def analyze_niche(self, topic: str, recursion_depth: int = 0, limit: int = 20) -> Dict[str, Any]:
        """
        Analyzes a niche on YouTube to find 'Market Gaps'.
        A Gap exists when High Views meet Low Quality (low density).
        """
        search_limit = limit # Trust the caller
        
        print(f"🧭 Creator Compass: Analyzing '{topic}' (Depth: {recursion_depth}, Limit: {search_limit})...")
        
        # 1. Reconnaissance
        incumbents = self.scraper.search_videos(topic, limit=search_limit)
        
        if not incumbents:
            return {"topic": topic, "error": "No data found."}

        # [NEW] Hyperbolic Semantic Analysis (The "Brain" & "Pantry")
        print(f"🧠 analyzing {len(incumbents)} videos with Bedrock...")
        for video in incumbents:
            # If score is 0, it means it's fresh (not from S3 cache)
            if video.hyperbolic_score == 0:
                # 1. Analyze with Bedrock
                analysis = self.bedrock_agent.analyze_semantic_density(video.transcript_summary)
                
                # 2. Update Video Scores
                video.hyperbolic_score = analysis.get('density_score', 0)
                # Overwrite base_score to use Semantic Density instead of just views
                video.base_score = video.hyperbolic_score 
                video.match_reason = f"Density: {video.hyperbolic_score}/100 | Vibe: {analysis.get('noise_flags', [])}"
                
                # 3. Save to S3 "Pantry"
                self.scraper.storage.upload_video_data(video.dict())

        # 2. Analyze Value Density
        # We pass 'incumbents' which now have updated scores from Bedrock
        scored_incumbents = self.ranking_engine.rank_videos(incumbents, None)

        total_views = 0
        total_density = 0
        low_quality_high_view_count = 0
        opportunities = []

        for vid in scored_incumbents:
            views = getattr(vid, 'raw_views', 0)
            density = vid.base_score
            total_views += views
            total_density += density
            
            if views > 100000 and density < 40:
                low_quality_high_view_count += 1
                opportunities.append({
                    "type": "Vulnerable Giant",
                    "reason": f"High views ({vid.views}), Low Density ({density:.1f}).",
                    "target_video": vid.title
                })

        avg_views = total_views / len(incumbents) if incumbents else 0
        avg_density = total_density / len(incumbents) if incumbents else 0
        
        # Calculate Average Engagement
        total_engagement_rate = sum([v.engagement_rate for v in scored_incumbents])
        avg_engagement = total_engagement_rate / len(incumbents) if incumbents else 0
        
        # 3. Calculate Market Gap Score (Revised V2)
        # Logarithmic View Score (Demand): 1M views -> ~6 * 10 = 60 (Reduced weight slightly)
        view_score = math.log(max(avg_views, 1), 10) * 10
        
        # Engagement Bonus: 5% Engagement -> 0.05 * 500 = 25 points
        # High engagement signals audience hunger even if views are lower
        engagement_bonus = avg_engagement * 500
        
        # Density Penalty (Competition Quality): 100 density -> 50 penalty
        density_penalty = avg_density * 0.5
        
        market_gap_score = view_score + engagement_bonus - density_penalty
        market_gap_score = max(0, min(100, market_gap_score))

        # 4. Generate Strategy
        strategy = "Saturated. Pivot needed."
        if market_gap_score > 75:
            strategy = "BLUE OCEAN. Create now."
        elif market_gap_score > 50:
            strategy = "Viable. Compete on Quality."
            
        result = {
            "topic": topic,
            "market_gap_score": round(market_gap_score, 1),
            "avg_views": f"{avg_views:,.0f}",
            "avg_quality_density": round(avg_density, 1),
            "strategy": strategy,
            "opportunities": opportunities[:3],
            "incumbents": [v.dict() for v in scored_incumbents[:5]]
        }

        # 5. Smart Traversal (Drill Down)
        # If saturated and top-level, find sub-niches
        if recursion_depth == 0 and market_gap_score < 60:
            print(f"📉 Saturated Niche detected. Drilling down into sub-niches for '{topic}'...")
            sub_niches = self.bedrock_agent.suggest_sub_niches(topic)
            
            # Simple serial execution for safety/stability in prototype
            # (Parallel executions can be added via asyncio.to_thread if needed)
            sub_niche_results = []
            for sub in sub_niches[:3]: # Limit to top 3 suggestions to save time
                try:
                    # Recursive call with depth 1 and SMALL limit
                    sub_res = await self.analyze_niche(sub, recursion_depth=1, limit=5)
                    if "error" not in sub_res:
                        sub_niche_results.append(sub_res)
                except Exception as e:
                    print(f"Failed to analyze sub-niche {sub}: {e}")
            
            # Sort sub-niches by opportunity score
            sub_niche_results.sort(key=lambda x: x['market_gap_score'], reverse=True)
            result["sub_niches"] = sub_niche_results

        return result

    async def generate_assessment(self, profile: CreatorProfile) -> Dict[str, Any]:
        """
        Generates a strategic assessment for a creator based on their profile.
        Returns a list of high-potential niches tailored to their skills and risk tolerance.
        """
        print(f"🧠 Generating Assessment for Profile: {profile.primary_skills} | Risk: {profile.risk_tolerance}")
        
        # 1. Get Strategic Suggestions
        suggestions = self.bedrock_agent.suggest_strategic_niches(profile)
        
        results = []
        for niche in suggestions:
            try:
                # 2. Analyze each suggestion (Lightweight check)
                # We use recursion_depth=1 to skip sub-niche drilling for speed
                # INCREASED LIMIT to 15 for better accuracy
                analysis = await self.analyze_niche(niche, recursion_depth=1, limit=15)
                if "error" not in analysis:
                    results.append(analysis)
            except Exception as e:
                print(f"assessment analysis failed for {niche}: {e}")
                
        # 3. Sort by Opportunity Score
        results.sort(key=lambda x: x.get('market_gap_score', 0), reverse=True)
        
        return {
            "profile_summary": f"{profile.risk_tolerance} Creator with skills in {', '.join(profile.primary_skills)}",
            "recommended_niches": results
        }

    # --- Creator Studio Tools ---

    def generate_script(self, topic: str, angle: str) -> str:
        return self.bedrock_agent.generate_content_script(topic, angle)

    def summarize_video(self, transcript: str) -> dict:
        return self.bedrock_agent.summarize_video(transcript)

    def repurpose_content(self, transcript: str, format_type: str) -> str:
        return self.bedrock_agent.repurpose_content(transcript, format_type)
