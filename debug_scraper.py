from app.services.scraper import ScraperService
import json

def test_scraper():
    scraper = ScraperService()
    print("🕵️‍♀️ Testing 'gaming' query...")
    try:
        videos = scraper.search_videos("gaming", limit=5)
        print(f"Result count: {len(videos)}")
        for v in videos:
            print(f"- {v.title} ({v.views})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_scraper()
