"""
Handles the fallback Audio Ingest Pipeline.
This module is triggered ONLY when official YouTube captions are unavailable.
"""

import os
import asyncio
import subprocess
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
        Uses yt-dlp to download and ffmpeg to convert to 16kHz WAV.
        WAV is the most compatible format for various ASR engines.
        """
        temp_path = f"/tmp/{video_id}_raw"
        output_path = f"/tmp/{video_id}.wav"
        
        # 1. Download best audio
        download_command = [
            "yt-dlp",
            "-f", "bestaudio",
            "--download-sections", "*0-30",
            "--force-overwrites",
            "-o", temp_path,
            f"https://www.youtube.com/watch?v={video_id}"
        ]
        
        print(f"   📡 Downloading audio for {video_id}...")
        try:
            # Download
            process = await asyncio.create_subprocess_exec(
                *download_command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            await process.communicate()
            
            if process.returncode != 0:
                print(f"   ❌ yt-dlp failed.")
                return None

            # 2. Convert to standard WAV (16kHz, mono) using ffmpeg
            print(f"   🎬 Converting to WAV format...")
            convert_command = [
                "ffmpeg", "-y",
                "-i", temp_path,
                "-ar", "16000",
                "-ac", "1",
                output_path
            ]
            
            conv_proc = await asyncio.create_subprocess_exec(
                *convert_command,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            await conv_proc.communicate()

            # Cleanup temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)

            if conv_proc.returncode == 0 and os.path.exists(output_path):
                print(f"   ✅ Audio converted: {output_path} ({os.path.getsize(output_path)} bytes)")
                return output_path
            else:
                return None
                
        except Exception as e:
            print(f"   ❌ Audio Processing Error: {e}")
            return None
