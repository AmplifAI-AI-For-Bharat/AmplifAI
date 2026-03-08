import aiohttp
import asyncio
import base64
import os
from typing import Optional, Dict, Any
from app.core.config import settings

class TranslationEngine:
    def __init__(self):
        self.sarvam_key = settings.SARVAM_API_KEY
        self.bhashini_key = settings.BHASHINI_API_KEY
        
        # [NEW] Custom Endpoint Support for Enterprise/Proxy users
        # Default Sarvam endpoint: https://api.sarvam.ai/v1/translate
        custom_endpoint = os.getenv("SARVAM_ENDPOINT", "")
        self.sarvam_url = custom_endpoint if custom_endpoint and "YOUR" not in custom_endpoint else "https://api.sarvam.ai/translate"
        
        # TTS endpoint
        self.sarvam_tts_url = "https://api.sarvam.ai/text-to-speech"
        self.sarvam_sttt_url = "https://api.sarvam.ai/speech-to-text-translate"
        self.sarvam_stt_url = "https://api.sarvam.ai/speech-to-text"

    async def translate_text(self, text: str, target_lang: str = "hi") -> Dict[str, Any]:
        """
        Translates text using Sarvam (Saaras v3) or Bhashini.
        """
        if not self.sarvam_key and not self.bhashini_key:
            return {"error": "No Translation API keys configured. Please add SARVAM_API_KEY or BHASHINI_API_KEY to .env"}

        if self.sarvam_key:
            return await self._translate_sarvam(text, target_lang)
        
        # Bhashini implementation would go here if Sarvam is missing
        return {"error": "Sarvam key missing. Bhashini integration pending production credentials."}

    async def _translate_sarvam(self, text: str, target_lang: str) -> Dict[str, Any]:
        headers = {
            "API-Subscription-Key": self.sarvam_key,
            "Content-Type": "application/json"
        }
        
        # Auto-detect source: if target is English, source is Hindi; otherwise source is English
        if target_lang == "en":
            source_lang = "hi-IN"
            target_lang_code = "en-IN"
        else:
            source_lang = "en-IN"
            target_lang_code = f"{target_lang}-IN"
        
        payload = {
            "input": text,
            "source_language_code": source_lang,
            "target_language_code": target_lang_code,
            "speaker_gender": "Female",
            "mode": "formal",
            "model": "mayura:v1",
            "enable_preprocessing": True
        }
        
        print(f"🌐 [Translation] Requesting Sarvam AI: {text[:30]}... ({source_lang} -> {target_lang_code})")
        print(f"🔗 [Translation] URL: {self.sarvam_url}")
        
        try:
            async with aiohttp.ClientSession() as session:
                # Text Translation
                async with session.post(self.sarvam_url, json=payload, headers=headers) as resp:
                    print(f"📡 [Translation] Status: {resp.status}")
                    if resp.status != 200:
                        error_text = await resp.text()
                        print(f"❌ [Translation] API Error: {error_text}")
                        return {"error": f"Sarvam Translation API error: {resp.status} - {error_text}"}
                    
                    translation_data = await resp.json()
                    translated_text = translation_data.get("translated_text", "")
                    print(f"✅ [Translation] Success: {translated_text[:30]}...")

                # Text to Speech (TTS)
                tts_payload = {
                    "inputs": [translated_text],
                    "target_language_code": target_lang_code,
                    "speaker_gender": "Female",
                    "model": "bulbul:v1"
                }
                print(f"🔊 [TTS] Generating Audio for: {translated_text[:30]}...")
                async with session.post(self.sarvam_tts_url, json=tts_payload, headers=headers) as tts_resp:
                    audio_base64 = ""
                    if tts_resp.status == 200:
                        tts_data = await tts_resp.json()
                        audio_base64 = tts_data.get("audios", [""])[0]
                        print(f"✅ [TTS] Audio generated ({len(audio_base64)} chars)")
                    else:
                        error_tts = await tts_resp.text()
                        print(f"⚠️ [TTS] Failed: {error_tts}")
                    
                    return {
                        "original_text": text,
                        "translated_text": translated_text,
                        "audio_base64": audio_base64,
                        "provider": "Sarvam AI (Saaras v3)"
                    }
        except Exception as e:
            print(f"❌ [Translation] Internal Failure: {str(e)}")
            return {"error": f"Internal translation failure: {str(e)}"}

    async def translate_video(self, audio_path: str) -> Dict[str, Any]:
        """
        Takes an audio file and translates it directly to English using Sarvam AI.
        """
        if not self.sarvam_key:
            return {"error": "Sarvam API key (SARVAM_API_KEY) not configured for audio translation."}

        headers = {
            "API-Subscription-Key": self.sarvam_key
        }
        
        print(f"🌐 [Audio Translation] Sending to Sarvam STTT: {audio_path}")
        
        try:
            # We use Saaras v2.5 or v3 speech-to-text-translate endpoint
            # multipart/form-data with 'file' and 'model'
            data = aiohttp.FormData()
            data.add_field('file', open(audio_path, 'rb'), filename=os.path.basename(audio_path))
            data.add_field('model', 'saaras:v1')
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.sarvam_sttt_url, data=data, headers=headers) as resp:
                    print(f"📡 [Audio Translation] Status: {resp.status}")
                    if resp.status != 200:
                        error_text = await resp.text()
                        print(f"❌ [Audio Translation] API Error: {error_text}")
                        return {"error": f"Sarvam STTT API error: {resp.status} - {error_text}"}
                    
                    result = await resp.json()
                    transcript = result.get("transcript", "")
                    print(f"✅ [Audio Translation] Success: {transcript[:50]}...")
                    
                    return {
                        "original_text": "Audio Content",
                        "translated_text": transcript,
                        "audio_base64": "", 
                        "provider": "Sarvam AI (Saaras v3) STTT"
                    }
        except Exception as e:
            print(f"❌ [Audio Translation] Internal Failure: {str(e)}")
            return {"error": f"Internal audio translation failure: {str(e)}"}
