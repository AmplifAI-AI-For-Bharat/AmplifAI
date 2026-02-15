import math
import textstat
from typing import List, Dict
from collections import Counter
from app.core.models import Video, HyperbolicIntent

class RankingEngine:
    def __init__(self):
        self.demand_matrix = Counter()
        self.video_cache: Dict[str, Video] = {}

    def incorporate_feedback(self, video_id: str, is_relevant: bool):
        """
        Updates the global demand matrix based on user feedback.
        """
        if video_id in self.video_cache:
            video = self.video_cache[video_id]
            # Extract keywords from title (simple split)
            keywords = [w.lower() for w in video.title.split() if len(w) > 3]
            
            weight = 1 if is_relevant else -1
            for k in keywords:
                self.demand_matrix[k] += weight
            
            print(f"🧠 Feedback Received: '{video.title}' is {'Relevant' if is_relevant else 'Not Relevant'}. Matrix Updated.")
        else:
            print(f"⚠️ Feedback ignored: Video {video_id} not in cache.")

    def rank_videos(self, videos: List[Video], intent: HyperbolicIntent) -> List[Video]:
        """
        Applies 'Signal-to-Noise Inversion' Scoring.
        Formula: Score = (Semantic Density * 5.0) + (Rarity Bonus * 20.0) + (Demand Boost)
        """
        processed_results = []
        
        for video in videos:
            self.video_cache[video.video_id] = video # Cache for feedback loop

            # 1. Calculate Semantic Density (Real Text Analysis)
            # We use the description + title as proxy for content
            content_text = f"{video.title}. {video.transcript_summary}"
            
            # Flesch Reading Ease: Lower is harder/more complex. 
            # We want high complexity for "expert" intents, but accessible for "eli5".
            try:
                complexity = textstat.flesch_reading_ease(content_text)
            except:
                complexity = 50.0 # Default
                
            # Density Proxy: Unique words ratio * Syllable count (Rough proxy for information density)
            words = content_text.split()
            unique_words = set(words)
            if len(words) > 0:
                vocab_richness = len(unique_words) / len(words)
            else:
                vocab_richness = 0.5
                
            # Normalize Density (0-10)
            raw_density = (vocab_richness * 10) + (max(0, 100 - complexity) / 20)
            semantic_density = min(10.0, raw_density)
            
            # 2. Rarity Bonus (Inverse Popularity)
            raw_views = getattr(video, 'raw_views', 0)
            if type(raw_views) == str: raw_views = 0 
            
            log_views = math.log(max(1, raw_views))
            rarity_bonus = 10.0 / (log_views + 1) 
            
            # 3. Demand Boost (Feedback Loop)
            demand_score = 0
            for w in words:
                if w.lower() in self.demand_matrix:
                    demand_score += self.demand_matrix[w.lower()] * 0.5
            
            # 4. Final Hyperbolic Score (0-100)
            # Density(10) * 5 = 50
            # Rarity(10) * 5 = 50 
            # Demand(10) = 10
            hyperbolic_score = (semantic_density * 5.0) + (rarity_bonus * 5.0) + demand_score
            
            # Vibe Alignment (Boost if keywords match intent)
            if intent and intent.boost_keywords:
                for keyword in intent.boost_keywords:
                    if keyword in content_text.lower():
                        hyperbolic_score += 15.0
                        video.match_reason = f"Matches Vibe: {keyword}"

            video.hyperbolic_score = min(100.0, max(0.0, hyperbolic_score))
            
            # Base Score (Quality Density) Normalized 0-100
            video.base_score = min(100.0, raw_density * 6.5)
            
            processed_results.append(video)
            
        # Sort by Hyperbolic Score
        processed_results.sort(key=lambda x: x.hyperbolic_score, reverse=True)
        
        return processed_results
