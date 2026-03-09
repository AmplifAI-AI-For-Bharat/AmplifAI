import os
import asyncio
from typing import List, Dict, Any, Optional
import httplib2
import certifi
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from youtube_transcript_api import YouTubeTranscriptApi
from app.core.config import settings

class YouTubeClient:
    def __init__(self):
        self.api_keys = settings.YOUTUBE_API_KEYS
        self.current_key_index = 0
        self.exhausted = False
        self.youtube = None
        self._initialize_client()

    def _initialize_client(self):
        if not self.api_keys:
             print("WARNING: No YOUTUBE_API_KEYS found. Discovery will fail in production.")
             return
        
        current_key = self.api_keys[self.current_key_index]
        try:
            # Use certifi to fix macOS SSL record layer failure
            http_obj = httplib2.Http(ca_certs=certifi.where())
            self.youtube = build('youtube', 'v3', developerKey=current_key, http=http_obj)
            print(f"✅ YouTube Client Initialized (Project Key #{self.current_key_index + 1})")
        except Exception as e:
            print(f"Failed to initialize YouTube Client with SSL certs: {e}")
            # Fallback to default build if certifi fails
            self.youtube = build('youtube', 'v3', developerKey=current_key)

    def rotate_key(self) -> bool:
        """
        Rotates to the next available API key in the pool.
        Returns True if successful, False if no more keys are available.
        """
        if self.current_key_index >= len(self.api_keys) - 1:
            print("❌ Quota Exhausted: No more fallback YouTube API keys available.")
            self.exhausted = True
            return False
            
        self.current_key_index += 1
        print(f"🔄 Rotating to YouTube API Key #{self.current_key_index + 1}...")
        self._initialize_client()
        return True

    async def deep_search(self, queries: List[str], max_results_per_query: int = 30) -> List[Dict[str, Any]]:
        """
        Executes multiple targeted queries simultaneously to bypass algorithmic bias.
        Includes automatic key rotation on quota exhaustion.
        """
        if not self.youtube:
            # Note: _get_mock_results is only for total key absence, not exhaustion.
            return self._get_mock_results(queries)

        all_video_ids = set()
        
        async def fetch_query(query, retry_count=0):
            try:
                def execute_search():
                    request = self.youtube.search().list(
                        part="id",
                        q=query,
                        type="video",
                        maxResults=max_results_per_query,
                        relevanceLanguage="en",
                        order="relevance"
                    )
                    return request.execute()
                
                response = await asyncio.to_thread(execute_search)
                return [item['id']['videoId'] for item in response.get('items', [])]
            except HttpError as e:
                # 403 quotaExceeded is the trigger for rotation
                if (e.resp.status == 403 or e.resp.status == 429) and retry_count < len(self.api_keys):
                    if "quota" in str(e).lower() or "limit" in str(e).lower():
                        if self.rotate_key():
                            return await fetch_query(query, retry_count + 1)
                print(f"YouTube Search Query Failed: {query}. Error: {e}")
                return []

        results = []
        for q in queries:
            v_ids = await fetch_query(q)
            results.append(v_ids)
            
        for item_list in results:
            for vid in item_list:
                all_video_ids.add(vid)

        unique_ids = list(all_video_ids)
        if not unique_ids:
            return []
            
        return await self.get_video_details(unique_ids)

    async def get_video_details(self, video_ids: List[str], retry_count=0) -> List[Dict[str, Any]]:
        """
        Fetches rich details for videos, with key rotation support.
        """
        if not self.youtube:
             return []

        videos = []
        for i in range(0, len(video_ids), 50):
            batch_ids = video_ids[i:i+50]
            id_string = ",".join(batch_ids)
            
            try:
                def execute_details():
                    request = self.youtube.videos().list(
                        part="snippet,statistics",
                        id=id_string
                    )
                    return request.execute()
                
                response = await asyncio.to_thread(execute_details)
                
                for item in response.get('items', []):
                    videos.append({
                        "video_id": item['id'],
                        "title": item['snippet']['title'],
                        "description": item['snippet']['description'],
                        "channel_id": item['snippet']['channelId'],
                        "channel_title": item['snippet']['channelTitle'],
                        "tags": item['snippet'].get('tags', []),
                        "thumbnail_url": item['snippet']['thumbnails'].get('high', {}).get('url', ''),
                        "views": int(item['statistics'].get('viewCount', 0)),
                        "likes": int(item['statistics'].get('likeCount', 0)),
                        "published_at": item['snippet']['publishedAt']
                    })
            except HttpError as e:
                if (e.resp.status == 403 or e.resp.status == 429) and retry_count < len(self.api_keys):
                     if "quota" in str(e).lower() or "limit" in str(e).lower():
                        if self.rotate_key():
                            # Retry the entire details fetch with the new key (recursive)
                            return await self.get_video_details(video_ids, retry_count + 1)
                print(f"Error fetching video details: {e}")

        return videos

    async def get_captions(self, video_id: str) -> str | None:
        """
        Attempts to fetch auto-generated or manual captions via YouTubeTranscriptApi.
        Note: This library does NOT use the official API key for transcripts.
        """
        try:
            def fetch_transcript():
                transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
                return " ".join([t['text'] for t in transcript_list])
            
            return await asyncio.to_thread(fetch_transcript)
        except Exception as e:
            print(f"Captions missing for {video_id}, falling back to audio pipeline. ({e.__class__.__name__})")
            return None
            
    @staticmethod
    def extract_video_id(url: str) -> str | None:
        """
        Extracts the YouTube Video ID from standard and shortened URLs.
        """
        import re
        patterns = [
            r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
            r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})'
        ]
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def _get_mock_results(self, queries: List[str]) -> List[Dict[str, Any]]:
        return [
            {
                "video_id": "dQw4w9WgXcQ",
                "title": f"Mock Semantic Result for {queries[0] if queries else 'test'}",
                "description": "This is a detailed description showing some semantic density in the mock up.",
                "channel_id": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
                "channel_title": "Mock Creator",
                "tags": ["mock", "demo", "deep_niche"],
                "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                "views": 450,
                "likes": 23,
                "published_at": "2024-01-01T00:00:00Z"
            }
        ]
