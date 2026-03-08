"""
Handles the fallback Audio Ingest Pipeline.
This module is triggered ONLY when official YouTube captions are unavailable.
"""

import os
import asyncio
from typing import Optional
from app.core.config import settings

class AudioProcessor:
    def __init__(self):
        self.sarvam_key = settings.SARVAM_API_KEY
        self.bhashini_key = settings.BHASHINI_API_KEY

    async def extract_transcript(self, video_id: str) -> Optional[str]:
        """
        The entrypoint for the fallback pipeline.
        1. Downloads a 30-second audio snippet using yt-dlp.
        2. Routes to ASR model (Saaras preferred).
        """
        print(f"🎙️ [Audio Ingest] Triggering real extraction for {video_id}...")
        
        # Step 1: Download Audio Stream Snippet
        audio_path = await self._download_audio_snippet(video_id)
        if not audio_path:
            return None

        # Step 2: Route to ASR
        # (This will be updated to use the STTT endpoint in TranslationEngine)
        return audio_path # Return the path so the caller can send it to STTT

    async def _download_audio_snippet(self, video_id: str) -> Optional[str]:
        """
        Uses yt-dlp to download the first 30 seconds of audio in m4a format.
        m4a is natively supported by Sarvam AI.
        """
        output_path = f"/tmp/{video_id}.m4a"
        yt_dlp_path = "yt-dlp" # Use system path
        
        # Command to download only the first 30 seconds of the best audio (m4a preferred)
        # --download-sections "*0-30" pulls only the first 30s
        command = [
            yt_dlp_path,
            "-f", "bestaudio[ext=m4a]/bestaudio",
            "--download-sections", "*0-30",
            "--force-overwrites",
            "-o", output_path,
            f"https://www.youtube.com/watch?v={video_id}"
        ]
        
        print(f"   📡 Downloading 30s audio snippet for {video_id}...")
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0 and os.path.exists(output_path):
                print(f"   ✅ Audio snippet saved: {output_path} ({os.path.getsize(output_path)} bytes)")
                return output_path
            else:
                print(f"   ❌ yt-dlp failed: {stderr.decode()}")
                return None
        except Exception as e:
            print(f"   ❌ Subprocess Error: {e}")
            return None

    async def _transcribe_saaras(self, audio_path: str) -> str:
        # This will be replaced by the STTT logic in TranslationEngine
        return "Legacy transcription method."
