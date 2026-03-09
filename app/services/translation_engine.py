import aiohttp
import asyncio
import base64
import os
import boto3
from typing import Optional, Dict, Any
from app.core.config import settings

class TranslationEngine:
    def __init__(self):
        self.sarvam_key = settings.SARVAM_API_KEY
        self.bhashini_key = settings.BHASHINI_API_KEY
        
        # [NEW] Custom Endpoint Support for Enterprise/Proxy users
        # Default Sarvam endpoint: https://api.sarvam.ai/v1/translate
        custom_endpoint = os.getenv("SARVAM_ENDPOINT", "")
        self.sarvam_url = custom_endpoint if custom_endpoint and "YOUR" not in custom_endpoint else "https://api.sarvam.ai/v1/translate"
        
        # TTS endpoints (Sarvam - Deprecated in favor of Polly)
        self.sarvam_tts_url = "https://api.sarvam.ai/text-to-speech"
        self.sarvam_sttt_url = "https://api.sarvam.ai/speech-to-text-translate"
        self.sarvam_stt_url = "https://api.sarvam.ai/speech-to-text"

        # AWS Polly Client
        print(f"🎙️ [Polly] Initializing Amazon Polly in {settings.AWS_REGION}...")
        self.polly = boto3.client(
            "polly",
            region_name=settings.AWS_REGION or "us-east-1",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )

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

    async def _generate_polly_audio(self, text: str, target_lang_code: str) -> str:
        """
        Generates base64 audio using Amazon Polly Neural Engine.
        """
        # Map target_lang_code to Polly VoiceId
        # Default to English (Joanna) if mapping fails
        voice_map = {
            "hi-IN": "Kajal",     # Hindi Female (Neural)
            "en-IN": "Joanna",    # English Female (Neural)
            "te-IN": "Shruti",    # Telugu Female (Standard fallback)
            "ta-IN": "Vani"       # Tamil Female (Standard fallback)
        }
        
        # Check if language is supported by Neural
        neural_langs = ["hi-IN", "en-US", "en-GB", "en-IN"] # simplified list
        
        voice_id = voice_map.get(target_lang_code, "Joanna")
        engine = "neural" if target_lang_code in neural_langs else "standard"

        print(f"🔊 [Polly] Synthesizing '{text[:30]}...' with Voice: {voice_id} ({engine})")
        
        try:
            # Run in thread pool to avoid blocking async loop since boto3 is sync
            def synthesize():
                response = self.polly.synthesize_speech(
                    Engine=engine,
                    LanguageCode=target_lang_code if target_lang_code in ["hi-IN", "en-IN", "en-US"] else "en-US",
                    Text=text,
                    OutputFormat="mp3",
                    VoiceId=voice_id
                )
                if "AudioStream" in response:
                    return base64.b64encode(response["AudioStream"].read()).decode("utf-8")
                return ""

            audio_base64 = await asyncio.to_thread(synthesize)
            return audio_base64
        except Exception as e:
            print(f"⚠️ [Polly] Synthesis Failed: {str(e)}")
            return ""

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
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(self.sarvam_url, json=payload, headers=headers) as resp:
                    if resp.status != 200:
                        error_text = await resp.text()
                        print(f"❌ [Translation] API Error: {error_text}")
                        return {"error": f"Sarvam Translation API error: {resp.status} - {error_text}"}
                    
                    translation_data = await resp.json()
                    translated_text = translation_data.get("translated_text", "")
                    print(f"✅ [Translation] Success: {translated_text[:30]}...")

                # Use Amazon Polly for TTS instead of Sarvam
                audio_base64 = await self._generate_polly_audio(translated_text, target_lang_code)
                
                return {
                    "original_text": text,
                    "translated_text": translated_text,
                    "audio_base64": audio_base64,
                    "provider": "Sarvam AI (Translate) + Amazon Polly (TTS)"
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
            data = aiohttp.FormData()
            data.add_field('file', 
                           open(audio_path, 'rb'), 
                           filename=os.path.basename(audio_path),
                           content_type='audio/wav')
            data.add_field('model', 'saaras:v2.5')
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.sarvam_sttt_url, data=data, headers=headers) as resp:
                    if resp.status != 200:
                        error_text = await resp.text()
                        print(f"❌ [Audio Translation] API Error: {error_text}")
                        return {"error": f"Sarvam STTT API error: {resp.status} - {error_text}"}
                    
                    result = await resp.json()
                    transcript = result.get("transcript", "")
                    print(f"✅ [Audio Translation] Success: {transcript[:50]}...")
                    
                    # Generate Polly Audio for the transcript
                    audio_base64 = await self._generate_polly_audio(transcript, "en-IN")
                    
                    return {
                        "original_text": "Audio Content",
                        "translated_text": transcript,
                        "audio_base64": audio_base64, 
                        "provider": "Sarvam AI STTT + Amazon Polly (TTS)"
                    }
        except Exception as e:
            print(f"❌ [Audio Translation] Internal Failure: {str(e)}")
            return {"error": f"Internal audio translation failure: {str(e)}"}
