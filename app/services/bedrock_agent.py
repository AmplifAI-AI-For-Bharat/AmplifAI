import json
import boto3
from app.core.config import settings
from app.core.models import UserContext, HyperbolicIntent, CreatorProfile

class BedrockAgent:
    def __init__(self):
        if not settings.DEMO_MODE:
            try:
                self.client = boto3.client(
                    service_name='bedrock-runtime',
                    region_name=settings.AWS_REGION
                )
                print("✅ AWS Bedrock Client Initialized")
            except Exception as e:
                print(f"⚠️ Failed to initialize AWS Client: {e}")
                settings.DEMO_MODE = True
        
    def analyze_vibe(self, query: str, context: UserContext) -> HyperbolicIntent:
        """
        Analyzes the query to find the 'Hyperbolic Vector' (Sub-culture/Intent).
        """
        if settings.DEMO_MODE:
            return self._mock_analysis(query, context)
            
        # Real Bedrock Call for Intent Analysis
        prompt = f"""
        Analyze this search query: "{query}" and user context interests: {context.interests}.
        Determine the 'Hyperbolic Vector' for a search engine that prioritizes niche, high-signal content over generic viral videos.
        
        Return JSON format:
        {{
            "sub_culture": "Specific Niche Name (e.g. 'Coffee Purists')",
            "vibe": "Short descriptive vibe (e.g. 'Scientific & Artisan')",
            "target_audience": "Who is this for?",
            "boost_keywords": ["list", "of", "high", "signal", "terms"],
            "suppress_keywords": ["terms", "to", "avoid", "noise"]
        }}
        """
        
        try:
            response = self._invoke_bedrock(prompt)
            return HyperbolicIntent(**response)
        except Exception as e:
            print(f"Bedrock Intent Analysis Failed: {e}")
            return self._mock_analysis(query, context)

    def analyze_semantic_density(self, transcript: str) -> dict:
        """
        [THE BRAIN]: Analyzes transcript for 'Information Density'.
        Distinguishes 'Signal' (Insight) from 'Noise' (Fluff).
        """
        if settings.DEMO_MODE:
            # Mock return for demo if Bedrock fails or credentials missing
            return {
                "density_score": 50,
                "signal_ratio": 0.5,
                "key_insights": ["Mock Insight 1", "Mock Insight 2"],
                "noise_flags": []
            }

        prompt = f"""
        Analyze the following video transcript. Code serves as the "Semantic Judge" for a Hyperbolic Search Engine.
        Your goal is to score the "Information Density" (0-100).
        High Score = Dense, technical, novel insights, efficient communication.
        Low Score = Repetitive, fluff, generic advice, slow pacing, engagement bait.

        Transcript:
        {transcript[:10000]}... (truncated)

        Return JSON format:
        {{
            "density_score": <int 0-100>,
            "signal_ratio": <float 0.0-1.0>,
            "key_insights": [<list of top 3 unique insights>],
            "noise_flags": [<list of detected fluff e.g. 'Excessive self-promo', 'Repetitive'>]
        }}
        """

        try:
            return self._invoke_bedrock(prompt)
        except Exception as e:
            print(f"Bedrock Transcript Analysis Failed: {e}")
            return {
                "density_score": 40, # Penalize if we can't analyze
                "signal_ratio": 0.4,
                "key_insights": ["Analysis Failed"],
                "noise_flags": ["AI Error"]
            }

    def _invoke_bedrock(self, prompt: str) -> dict:
        """
        Helper to invoke Claude 3 Sonnet via Bedrock.
        """
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": [{"type": "text", "text": prompt}]
                }
            ]
        })

        response = self.client.invoke_model(
            modelId="anthropic.claude-3-sonnet-20240229-v1:0",
            body=body
        )

        response_body = json.loads(response.get("body").read())
        content = response_body.get("content", [])[0].get("text", "{}")
        
        # Extract JSON from potential markdown blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "{" in content:
            content = content[content.find("{"):content.rfind("}")+1]
            
        return json.loads(content)

    def _mock_analysis(self, query: str, context: UserContext) -> HyperbolicIntent:
        """
        Universal Fallback Intent Generator.
        Generates a valid Hyperbolic Intent for ANY query.
        """
        query_lower = query.lower()
        
        # 1. Logic for "Quantum / Physics"
        if "quantum" in query_lower or "physics" in query_lower:
            if "eli5" in query_lower or "baby" in query_lower or "basic" in query_lower:
                return HyperbolicIntent(
                    sub_culture="Pop Science",
                    vibe="Accessible & Fun",
                    target_audience="Curious Beginners",
                    boost_keywords=["baby", "cartoon", "animation", "viral", "easy"],
                    suppress_keywords=["lecture", "academic", "math", "equation"]
                )
            else: # Default or "Academic" context
                return HyperbolicIntent(
                    sub_culture="Academic Rigor",
                    vibe="Intellectual & Deep",
                    target_audience="Researchers / Students",
                    boost_keywords=["lecture", "mit", "professor", "course", "math"],
                    suppress_keywords=["tiktok", "reels", "baby", "viral"]
                )

        # 2. Logic for "Coffee"
        if "coffee" in query_lower:
            if "espresso" in context.interests or "expert" in query_lower:
                 return HyperbolicIntent(
                    sub_culture="Third Wave Coffee",
                    vibe="Artisan & Scientific",
                    target_audience="Coffee Purists",
                    boost_keywords=["hoffmann", "v60", "grind size", "extraction"],
                    suppress_keywords=["instant", "starbucks", "sugar"]
                )
            else:
                 return HyperbolicIntent(
                    sub_culture="Caffeine Fix",
                    vibe="Practical & Quick",
                    target_audience="Busy People",
                    boost_keywords=["quick", "hack", "cold brew", "5 min"],
                    suppress_keywords=["science", "weighing"]
                )
             
        # 3. REALITY MODE (For everything else)
        if "gaming" in query_lower:
            return HyperbolicIntent(
                sub_culture="Hardcore Gaming",
                vibe="Skill & Mastery",
                target_audience="Pro Gamers",
                boost_keywords=["speedrun", "meta", "guide", "pro"],
                suppress_keywords=["casual", "mobile", "trailer"]
            )
        
        if "cooking" in query_lower or "food" in query_lower:
             return HyperbolicIntent(
                sub_culture="Culinary Arts",
                vibe="Delicious & Aesthetic",
                target_audience="Foodies",
                boost_keywords=["recipe", "gourmet", "street food", "4k"],
                suppress_keywords=["fast food", "mukbang", "review"]
            )

        if "tech" in query_lower or "review" in query_lower:
             return HyperbolicIntent(
                sub_culture="Tech Enthusiast",
                vibe="In-Depth & Critical",
                target_audience="Early Adopters",
                boost_keywords=["specs", "benchmark", "comparison", "teardown"],
                suppress_keywords=["rumor", "leak", "reaction"]
            )

        # 3. REALITY MODE (Dynamic Fallback)
        # Use the query itself to generate a "Sub-culture" if unknown
        topic_title = query.title()
        return HyperbolicIntent(
            sub_culture=f"{topic_title} Deep Dive",
            vibe="Signal-to-Noise Optimized",
            target_audience=f"{topic_title} Enthusiasts",
            boost_keywords=query_lower.split(), # Boost words in the query
            suppress_keywords=["reaction", "prank", "giveaway", "shoutout"] # Always suppress trash
        )

    def suggest_sub_niches(self, topic: str) -> list[str]:
        """
        Brainstorms 'Blue Ocean' sub-niches for a saturated topic.
        """
        topic_lower = topic.lower()
        
        # MOCK LOGIC for Demo
        if "gaming" in topic_lower:
            return ["Indie Horror Devlogs", "Retro Speedrunning History", "Cozy Games Analysis", "VR Fitness"]
        elif "finance" in topic_lower or "money" in topic_lower:
            return ["Sustainable Investing", "Teenager Side Hustles", "Crypto for Boomers", "Frugal Living Hacks"]
        elif "tech" in topic_lower or "coding" in topic_lower:
            return ["Rust for Beginners", "Embedded Systems DIY", "AI Agent Tutorials", "Legacy Code Refactoring"]
        elif "fitness" in topic_lower:
            return ["Mobility for Gamers", "Calisthenics Progression", "Senior Yoga", "Kettlebell Flows"]
            
        # Generic Fallback
        return [f"Deep Dive: {topic}", f"{topic} Video Essays", f"{topic} History", f"Advanced {topic}"]

    def suggest_strategic_niches(self, profile: CreatorProfile) -> list[str]:
        """
        Generates strategic niche suggestions based on Creator Profile.
        """
        # MOCK LOGIC for Demo (Simulating Bedrock)
        
        suggestions = []
        # Safely handle list joining if primary_skills is None or empty
        skills_str = ", ".join(profile.primary_skills).lower() if profile.primary_skills else ""
        risk = profile.risk_tolerance.lower()
        
        # 1. Tech / Coding Skews
        if "code" in skills_str or "programming" in skills_str:
            if risk == "experimental":
                suggestions.extend(["AI Agent Live Coding", "Rust Embedded Systems", "Web3 Security Audits"])
            else:
                suggestions.extend(["Python Tutorials for Beginners", "Web Development Career Advice", "React vs Vue Comparisons"])

        # 2. Storytelling / Editing Skews
        if "edit" in skills_str or "story" in skills_str:
            if risk == "experimental":
                suggestions.extend(["Interactive Documentaries", "ARG (Alternate Reality Game) Creation", "Abstract Visual Essays"])
            else:
                suggestions.extend(["True Crime Documentaries", "Movie Analysis & Essays", "Travel Vlogging"])
                
        # 3. Finance / Business Skews
        if "finance" in skills_str or "business" in skills_str:
             if risk == "experimental":
                suggestions.extend(["DeFi Yield Farming Strategies", "Micro-SaaS Building Public", "Emerging Markets Analysis"])
             else:
                suggestions.extend(["Personal Finance 101", "Stock Market Updates", "Real Estate Investing"])

        # 4. Music / Audio Skews
        if "music" in skills_str or "audio" in skills_str or "sound" in skills_str:
            if risk == "experimental":
                suggestions.extend(["AI Music Generation Workflows", "Field Recording ASMR", "Modular Synth Jams"])
            else:
                suggestions.extend(["Music Production Tutorials", "Beat Making for Beginners", "Songwriting Tips"])

        # 5. Art / Design Skews
        if "art" in skills_str or "design" in skills_str or "visual" in skills_str:
            if risk == "experimental":
                suggestions.extend(["Generative Art Coding", "3D Printing Accidents", "NFT Art Critique"])
            else:
                suggestions.extend(["Digital Painting Tutorials", "UI/UX Design Case Studies", "Sketchbook Tours"])
                
        # 6. Education / Teaching Skews
        if "teach" in skills_str or "education" in skills_str or "explain" in skills_str:
            if risk == "experimental":
                suggestions.extend(["Philosophy of AI", "Unconventional History", "Math Visualization"])
            else:
                suggestions.extend(["Study With Me", "Language Learning Tips", "Science Experiments"])

        # Default Fillers if skills don't match mock logic
        if not suggestions:
            if risk == "experimental":
                suggestions = ["Urban Exploration", "Social Experiments", "Obscure Media Analysis"]
            else:
                suggestions = ["Life Hacks", "Book Reviews", "Restaurant Reviews"]
                
        return suggestions[:5] # Return top 5

    def generate_content_script(self, topic: str, angle: str) -> str:
        """
        Generates a video script + hook based on a topic and angle.
        """
        if settings.DEMO_MODE:
            return f"**[MOCK SCRIPT]**\n\n**Topic:** {topic}\n**Angle:** {angle}\n\n**Hook (0-5s):** 'Stop doing {topic} the wrong way!'\n\n**Body:** ... (Mock Content) ...\n\n---\n*🔒 This is a demo response. Add your AWS Bedrock keys to `.env` for real AI-generated scripts.*"

        prompt = f"""
        Act as a master YouTube Strategist. Write a video script outline for:
        Topic: "{topic}"
        Angle/Vibe: "{angle}"

        1. **Hook (0-10s)**: High-retention opening.
        2. **Value Prop**: Why should they watch?
        3. **Key Points**: 3 bullet points of unique insight (Hyperbolic/High-Signal).
        4. **Call to Action**: Smooth interaction prompt.
        
        Keep it punchy, conversational, and high-energy.
        """
        try:
            response = self._invoke_bedrock(prompt)
            # Bedrock might return dict or str depending on _invoke_bedrock parsing, 
            # but _invoke_bedrock tries to return JSON. Use raw text if possible or handle dict.
            # actually _invoke_bedrock returns json.loads(content). if content is text, it might fail or return string?
            # Let's assume _invoke_bedrock returns the raw text content if it's not JSON? 
            # Wait, _invoke_bedrock tries to parse JSON. 
            # Let's adjust _invoke_bedrock or just handle the response.
            # For this specific prompt, let's ask for Markdown text, but _invoke_bedrock expects JSON.
            # I will wrap the response in a JSON object in the prompt.
            return str(response) 
        except Exception:
            # Fallback to pure text prompt if needed
             pass

        # RE-DOING PROMPT FOR JSON COMPATIBILITY
        prompt_json = f"""
        Act as a master YouTube Strategist. Write a video script outline for:
        Topic: "{topic}"
        Angle/Vibe: "{angle}"
        
        Return JSON:
        {{
            "script": "The full markdown script here..."
        }}
        """
        try:
            res = self._invoke_bedrock(prompt_json)
            return res.get("script", "Error generating script.")
        except Exception as e:
            return f"Error generating script: {e}"

    def summarize_video(self, transcript: str) -> dict:
        """
        Summarizes a transcript into Key Takeaways and a Shorts Script.
        """
        if settings.DEMO_MODE:
            return {
                "summary": ["Mock Takeaway 1", "Mock Takeaway 2"],
                "shorts_script": "Mock Shorts Script...",
                "note": "🔒 Demo response. Add AWS Bedrock keys to .env for real AI summaries."
            }
            
        prompt = f"""
        Analyze this transcript and return a JSON object with:
        1. "summary": A list of 3-5 key takeaways (bullet points).
        2. "shorts_script": A 60-second viral Short script based on the best insight.

        Transcript: {transcript[:15000]}...
        """
        try:
            return self._invoke_bedrock(prompt)
        except Exception as e:
            return {"error": str(e)}

    def repurpose_content(self, transcript: str, format_type: str) -> str:
        """
        Repurposes a video transcript into a Blog Post, Twitter Thread, or LinkedIn Post.
        """
        if settings.DEMO_MODE:
             return f"**[MOCK {format_type.upper()}]**\n\nBased on transcript...\n\n---\n*🔒 This is a demo response. Add your AWS Bedrock keys to `.env` for real AI-generated content.*"

        prompt = f"""
        Repurpose the following video transcript into a highly engaging {format_type}.
        Use appropriate formatting (e.g. threads for Twitter, headers for Blog).
        
        Transcript: {transcript[:15000]}...
        
        Return JSON:
        {{
            "content": "The full formatted content..."
        }}
        """
        try:
            res = self._invoke_bedrock(prompt)
            return res.get("content", "Error repurposing content.")
        except Exception as e:
            return f"Error repurposing content: {e}"
