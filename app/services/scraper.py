import yt_dlp
from typing import List
from app.core.models import Video
from app.services.storage_service import StorageService

class ScraperService:
    def __init__(self):
        self.storage = StorageService()
        self.ydl_opts = {
            'quiet': True,
            'extract_flat': True, # Only get metadata, don't download
            'force_generic_extractor': False,
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }

    def search_videos(self, query: str, limit: int = 15) -> List[Video]:
        """
        Executes a real YouTube search via yt-dlp and fetches TRANSCRIPTS.
        """
        # We need to fetch individual video pages to get subtitles, search result metadata is not enough.
        # So we do this in two steps:
        # 1. Search for IDs.
        # 2. Extract info (with subs) for those IDs.
        
        search_query = f"ytsearch{limit}:{query}"
        print(f"🕵️‍♀️ Live Scraping (Deep Sense): {search_query}")
        
        try:
            # Step 1: Fast Search (IDs only)
            with yt_dlp.YoutubeDL({'quiet': True, 'extract_flat': True, 'force_generic_extractor': False}) as ydl_fast:
                search_results = ydl_fast.extract_info(search_query, download=False)
            
            videos = []
            if 'entries' in search_results:
                from concurrent.futures import ThreadPoolExecutor, as_completed
                
                # Helper function for parallel execution
                def _fetch_details(entry):
                    if not entry: return None
                    video_id = entry['id']
                    
                    # 1. Check S3 "Pantry" First
                    cached_data = self.storage.get_video_data(video_id)
                    if cached_data:
                        print(f"   🍪 Pantry Hit: {video_id}")
                        try:
                            return Video(**cached_data)
                        except Exception as e:
                            print(f"   ⚠️ Cache Corrupt for {video_id}: {e}")
                    
                    try:
                        # Step 2: Deep Fetch (Get Subtitles)
                        sub_opts = {
                            'quiet': True,
                            'skip_download': True,
                            'writesubtitles': True,
                            'writeautomaticsub': True,
                            'subtitleslangs': ['en'],
                        }
                        
                        with yt_dlp.YoutubeDL(sub_opts) as ydl_deep:
                            info = ydl_deep.extract_info(video_id, download=False)
                            
                            # Valid Transcript Logic & Fallback
                            description = info.get('description', '')
                            chapters = info.get('chapters', [])
                            chapter_text = " ".join([c.get('title', '') for c in chapters]) if chapters else ""
                            full_text = f"{info['title']} {description} {chapter_text}"
                            
                            # View Count Logic
                            views_raw = info.get('view_count', 0)
                            views_str = f"{views_raw}"
                            if views_raw > 1000000:
                                views_str = f"{views_raw/1000000:.1f}M"
                            elif views_raw > 1000:
                                views_str = f"{views_raw/1000:.1f}k"

                            # Engagement Metrics
                            likes = info.get('like_count', 0) or 0
                            comments = info.get('comment_count', 0) or 0
                            engagement_rate = 0.0
                            if views_raw > 0:
                                engagement_rate = (likes + comments) / views_raw

                            return Video(
                                video_id=video_id,
                                title=info['title'],
                                channel=info.get('uploader', 'Unknown'),
                                views=views_str,
                                published=info.get('upload_date', 'Unknown'),
                                tags=info.get('tags', []) or [],
                                raw_views=views_raw,
                                like_count=likes,
                                comment_count=comments,
                                engagement_rate=engagement_rate,
                                transcript_summary=full_text,
                                base_score=0.0,
                                hyperbolic_score=0.0,
                                match_reason=f"Rich Metadata: {len(full_text)} chars"
                            )
                    except Exception as e:
                        print(f"   x Failed to deep-fetch {video_id}: {e}")
                        return None

                # Execute in Parallel
                with ThreadPoolExecutor(max_workers=10) as executor:
                    futures = [executor.submit(_fetch_details, entry) for entry in search_results['entries']]
                    
                    for future in as_completed(futures):
                        result = future.result()
                        if result:
                            videos.append(result)
                            print(f"   > Processed: {result.title[:30]}...")

            print(f"✅ Deep Scraped {len(videos)} videos")
            return videos
            
        except Exception as e:
            print(f"❌ Scraping Failed: {e}")
            return []
