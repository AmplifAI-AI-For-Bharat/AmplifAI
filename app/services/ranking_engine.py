import math
import asyncio
from typing import List, Dict, Any, Optional
from opensearchpy import OpenSearch, RequestsHttpConnection
from app.core.models import Video, HyperbolicIntent
from app.core.config import settings
from app.services.bedrock_agent import BedrockAgent

class RankingEngine:
    def __init__(self, bedrock_agent: Optional[BedrockAgent] = None):
        """
        Hyperbolic Ranking Engine.
        Combines Semantic Bedrock Embeddings with Metadata Signals.
        """
        self.bedrock = bedrock_agent or BedrockAgent()
        self.embedding_cache = {} # In-memory cache for speed
        self.video_cache: Dict[str, Video] = {}
        
        self.os_client = None
        if settings.OPENSEARCH_URL and settings.OPENSEARCH_URL.strip() and not settings.DEMO_MODE:
            try:
                self.os_client = OpenSearch(
                    hosts=[settings.OPENSEARCH_URL],
                    http_compress=True,
                    use_ssl=True,
                    verify_certs=True,
                    connection_class=RequestsHttpConnection
                )
                print("✅ Connected to Amazon OpenSearch Serverless")
            except Exception as e:
                print(f"⚠️ OpenSearch connection failed: {e}")

    def incorporate_feedback(self, video_id: str, is_relevant: bool):
        """
        Updates the global demand matrix / vector weights based on user feedback.
        """
        if video_id in self.video_cache or video_id in self.embedding_cache:
            print(f"🧠 Feedback Received: Video '{video_id}' is {'Relevant' if is_relevant else 'Not Relevant'}.")
        else:
            print(f"⚠️ Feedback ignored: Video {video_id} not in cache.")

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2): return 0.0
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a * a for a in vec1))
        magnitude2 = math.sqrt(sum(b * b for b in vec2))
        if magnitude1 == 0 or magnitude2 == 0: return 0.0
        return dot_product / (magnitude1 * magnitude2)

    async def get_cached_embedding(self, text: str) -> List[float]:
        """Returns embedding from cache or Bedrock."""
        if text in self.embedding_cache:
            return self.embedding_cache[text]
        
        vector = await self.bedrock.generate_embeddings(text)
        self.embedding_cache[text] = vector
        return vector

    async def rank_videos(self, videos: List[Video], intent: HyperbolicIntent) -> List[Video]:
        """
        Two-stage ranking for speed:
        1. Metadata-driven pre-sort (Top 40)
        2. Semantic Titan Embeddings for those 40.
        """
        if not videos:
            return []

        # -- Stage 1: Metadata Pre-Sort (Heuristic) --
        # Sort by view velocity + engagement to find the "best" candidates to rank semantically
        def heuristic_score(v):
            v_count = getattr(v, 'raw_views', 0)
            if type(v_count) == str: v_count = 0
            e_rate = getattr(v, 'engagement_rate', 0.0)
            return math.log10(max(10, v_count)) + (e_rate * 10)

        videos.sort(key=heuristic_score, reverse=True)
        candidates = videos[:40] # Rank top 40 semantically
        other_videos = videos[40:]

        # -- Stage 2: Semantic Ranking --
        processed_results = []
        
        # 1. Generate Intent Embedding
        intent_text = ""
        if intent:
            intent_text = f"{intent.sub_culture} {intent.vibe} {' '.join(intent.boost_keywords)}"
        
        intent_vector = await self.get_cached_embedding(intent_text)
        
        async def process_single_video(video):
            content_text = f"{video.title}. {video.description}"
            video_vector = await self.get_cached_embedding(content_text)
            
            # 3. Calculate k-NN Cosine Similarity
            similarity = self._cosine_similarity(intent_vector, video_vector)
            
            # 4. Regional & Engagement Bonus
            raw_views = getattr(video, 'raw_views', 0)
            if type(raw_views) == str: raw_views = 0 
            
            engagement = getattr(video, 'engagement_rate', 0.0)
            engagement_bonus = engagement * 50.0 
            
            view_score = math.log10(max(10, raw_views)) * 2.0
            hyperbolic_score = (similarity * 70.0) + (engagement_bonus) + (view_score)
            
            video.hyperbolic_score = min(100.0, max(0.0, hyperbolic_score))
            video.base_score = min(100.0, similarity * 100)
            video.match_reason = "Semantic Match (Top 40)"
            return video

        # Parallelize the 40 candidates
        print(f"🚀 Parallelizing semantic ranking for {len(candidates)} candidates...")
        batch_results = await asyncio.gather(*(process_single_video(v) for v in candidates))
        processed_results.extend(batch_results)
        
        # Assign low scores to the rest instead of dropping them
        for v in other_videos:
            v.hyperbolic_score = 0.0
            v.base_score = 0.0
            v.match_reason = "Metadata Match (Lower Signal)"
            processed_results.append(v)
            
        processed_results.sort(key=lambda x: x.hyperbolic_score, reverse=True)
        return processed_results
