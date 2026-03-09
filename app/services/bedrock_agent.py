import json
import boto3
import asyncio
from typing import List, Dict, Optional, Any
from app.core.config import settings
from app.core.models import UserContext, HyperbolicIntent, CreatorProfile, SubCulture

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
        
    async def analyze_vibe(self, query: str, context: UserContext) -> HyperbolicIntent:
        """
        Analyzes the query to find the 'Hyperbolic Vector' (Sub-culture/Intent).
        """
        if settings.DEMO_MODE:
            # check if deep interests can inform this
            deep_context = ""
            if context.deep_interests:
                deep_context = f" User deeply interested in: {[d.name for d in context.deep_interests]}"
            return self._mock_analysis(query + deep_context, context)
            
        # Real Bedrock Call for Intent Analysis
        prompt = f"""
        Analyze this search query: "{query}" and user context interests: {context.interests}.
        Determine the 'Hyperbolic Vector' for a search engine that prioritizes rich, high-signal content from across India (Hindi, Tamil, Telugu, etc.).
        Focus on delivering a diverse feed that captures regional nuances and broad relevance.
        
        Return JSON format:
        {{
            "sub_culture": "Specific Region or Niche",
            "vibe": "Cultural and topical vibe",
            "target_audience": "Who in India is this for?",
            "boost_keywords": ["list including regional terms in English/Hindi/Tamil/Telugu script if relevant"],
            "suppress_keywords": ["list"],
            "domain_id": "closest matching domain from [music, fashion, science, cinema, art, business, food, travel, gaming, education, comedy]",
            "is_ambiguous": false,
            "potential_intents": []
        }}
        """
        
        try:
            response = await self._invoke_bedrock(prompt)
            # Ensure it's never ambiguous regardless of the model output
            if "is_ambiguous" in response:
                 response["is_ambiguous"] = False
            
            # Fix: Model sometimes returns strings instead of dicts for potential_intents
            if "potential_intents" in response and isinstance(response["potential_intents"], list):
                sanitized_intents = []
                for item in response["potential_intents"]:
                    if isinstance(item, dict):
                        # Ensure required fields are present to satisfy Pydantic
                        item.setdefault("sub_culture", response.get("sub_culture", "Related"))
                        item.setdefault("vibe", response.get("vibe", "Similar"))
                        item.setdefault("target_audience", response.get("target_audience", "General"))
                        item.setdefault("boost_keywords", [])
                        item.setdefault("suppress_keywords", [])
                        sanitized_intents.append(item)
                    elif isinstance(item, str):
                        sanitized_intents.append({
                            "sub_culture": item,
                            "vibe": "Exploratory",
                            "target_audience": "Curious Users",
                            "boost_keywords": [],
                            "suppress_keywords": [],
                            "is_ambiguous": False
                        })
                response["potential_intents"] = sanitized_intents

            return HyperbolicIntent(**response)
        except Exception as e:
            print(f"Bedrock Intent Analysis Failed: {e}")
            return self._mock_analysis(query, context)

    async def analyze_semantic_density(self, transcript: str) -> dict:
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
            return await self._invoke_bedrock(prompt)
        except Exception as e:
            print(f"Bedrock Transcript Analysis Failed: {e}")
            return {
                "density_score": 40, # Penalize if we can't analyze
                "signal_ratio": 0.4,
                "key_insights": ["Analysis Failed"],
                "noise_flags": ["AI Error"]
            }

    async def _invoke_bedrock(self, prompt: str) -> dict:
        """
        Helper to invoke Claude 3 Haiku via Bedrock asynchronously.
        """
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,
            "messages": [
                {
                    "role": "user",
                    "content": [{"type": "text", "text": prompt}]
                }
            ]
        })

        # Run blocking boto3 client call in a separate thread to keep event loop free
        response = await asyncio.to_thread(
            self.client.invoke_model,
            modelId="anthropic.claude-3-haiku-20240307-v1:0",
            body=body
        )

        response_body = json.loads(response.get("body").read())
        content = response_body.get("content", [])[0].get("text", "{}")
        
        # Extract JSON from potential markdown blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "{" in content:
            content = content[content.find("{"):content.rfind("}")+1]
            
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Fallback if AI returns raw text instead of JSON
            return {"script": content}

    async def generate_embeddings(self, text: str) -> List[float]:
        """
        Generates Amazon Titan Text Embeddings V2 for semantic vector search asynchronously.
        """
        if settings.DEMO_MODE:
            return [0.0] * 1024  # Standardized to 1024
            
        body = json.dumps({
            "inputText": text,
            "dimensions": 1024,
            "normalize": True
        })
        
        try:
            response = await asyncio.to_thread(
                self.client.invoke_model,
                modelId="amazon.titan-embed-text-v2:0",
                accept="application/json",
                contentType="application/json",
                body=body
            )
            response_body = json.loads(response.get("body").read())
            return response_body.get("embedding", [])
        except Exception as e:
            print(f"Titan Embeddings Failed: {e}")
            return [0.0] * 1024

    async def generate_multimodal_embeddings(self, text: str, image_base64: str) -> List[float]:
        """
        Generates Amazon Titan Multimodal embeddings asynchronously.
        """
        if settings.DEMO_MODE:
            return [0.0] * 1024
            
        bodyPayload = {}
        if text: 
            text_str = str(text)
            bodyPayload["inputText"] = text_str[:128]
        if image_base64: bodyPayload["inputImage"] = image_base64
        bodyPayload["embeddingConfig"] = {"outputEmbeddingLength": 1024}
        
        body = json.dumps(bodyPayload)
        
        try:
            response = await asyncio.to_thread(
                self.client.invoke_model,
                modelId="amazon.titan-embed-image-v1",
                accept="application/json",
                contentType="application/json",
                body=body
            )
            response_body = json.loads(response.get("body").read())
            return response_body.get("embedding", [])
        except Exception as e:
            print(f"Titan Multimodal Embeddings Failed: {e}")
            return [0.0] * 1024

    def _mock_analysis(self, query: str, context: UserContext) -> HyperbolicIntent:
        """
        Universal Fallback Intent Generator.
        Generates a valid Hyperbolic Intent for ANY query.
        """
        query_str = str(query)
        query_lower = query_str.lower()
        base_query_lower = query_str.split(" User deeply interested in:")[0].lower().strip()
        
        # 0. AMBIGUITY SPECIAL CASE: "Space Analysis"
        if base_query_lower == "space analysis":
            return HyperbolicIntent(
                sub_culture="Ambiguous Discovery",
                vibe="Multi-Domain Signal",
                target_audience="Varied",
                boost_keywords=[],
                suppress_keywords=[],
                is_ambiguous=True,
                potential_intents=[
                    HyperbolicIntent(
                        sub_culture="Market Space Analysis",
                        vibe="Business & Strategic",
                        target_audience="Creators / Founders",
                        boost_keywords=["gap", "signal", "opportunity", "market"],
                        suppress_keywords=["teeth", "dentist", "physics", "mit", "equations"],
                        domain_id="business"
                    ),
                    HyperbolicIntent(
                        sub_culture="Orthodontic Space Analysis",
                        vibe="Medical & Clinical",
                        target_audience="Dentists / Students",
                        boost_keywords=["teeth", "crowding", "dentistry", "bolton", "arch"],
                        suppress_keywords=["market", "business", "saas", "creator"],
                        domain_id="science"
                    ),
                    HyperbolicIntent(
                        sub_culture="Physics State Space",
                        vibe="Academic & Theoretical",
                        target_audience="Physicists / Students",
                        boost_keywords=["equations", "differential", "control theory", "mit"],
                        suppress_keywords=["teeth", "market", "business", "dentist"],
                        domain_id="science"
                    )
                ]
            )

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
                    suppress_keywords=["tiktok", "reels", "baby", "viral"],
                    domain_id="science"
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
                    suppress_keywords=["science", "weighing"],
                    domain_id="food"
                )
             
        # 3. REALITY MODE (For everything else)
        if "gaming" in query_lower:
            return HyperbolicIntent(
                sub_culture="Hardcore Gaming",
                vibe="Skill & Mastery",
                target_audience="Pro Gamers",
                boost_keywords=["speedrun", "meta", "guide", "pro"],
                suppress_keywords=["casual", "mobile", "trailer"],
                domain_id="gaming"
            )
        
        if "cooking" in query_lower or "food" in query_lower:
             return HyperbolicIntent(
                sub_culture="Culinary Arts",
                vibe="Delicious & Aesthetic",
                target_audience="Foodies",
                boost_keywords=["recipe", "gourmet", "street food", "4k"],
                suppress_keywords=["fast food", "mukbang", "review"],
                domain_id="food"
            )

        if "tech" in query_lower or "review" in query_lower:
             return HyperbolicIntent(
                sub_culture="Tech Enthusiast",
                vibe="In-Depth & Critical",
                target_audience="Early Adopters",
                boost_keywords=["specs", "benchmark", "comparison", "teardown"],
                suppress_keywords=["rumor", "leak", "reaction"],
                domain_id="science"
            )

        # 3. REALITY MODE (Dynamic Fallback)
        # Use the query itself to generate a "Sub-culture" if unknown
        topic_title = query.title()
        return HyperbolicIntent(
            sub_culture=f"{topic_title} Deep Dive",
            vibe="Signal-to-Noise Optimized",
            target_audience=f"{topic_title} Enthusiasts",
            boost_keywords=query_lower.split(), # Boost words in the query
            suppress_keywords=["reaction", "prank", "giveaway", "shoutout"], # Always suppress trash
            domain_id="science" # Fallback
        )

    async def map_interests(self, broad_interests: List[str]) -> List[SubCulture]:
        """
        Expands broad interests into a 'Hyperbolic Interest Graph' of Sub-Cultures.
        """
        if settings.DEMO_MODE:
            return self._mock_interest_mapping(broad_interests)

        prompt = f"""
        Expand these broad interests into specific, high-signal 'Hyperbolic Sub-Cultures'.
        Interests: {broad_interests}

        For EACH broad interest, find 2-3 deep, niche sub-cultures that prioritize 
        technical depth, unique perspectives, and high information density.

        Return JSON format:
        {{
            "deep_interests": [
                {{
                    "name": "Sub-Culture Name (e.g. 'Lunar Logistics')",
                    "vibe": "Short descriptive vibe (e.g. 'Engineering-Heavy & Industrial')",
                    "boost_keywords": ["term1", "term2", "term3"]
                }}
            ]
        }}
        """
        try:
            response = await self._invoke_bedrock(prompt)
            return [SubCulture(**item) for item in response.get("deep_interests", [])]
        except Exception as e:
            print(f"Interest Mapping Failed: {e}")
            return self._mock_interest_mapping(broad_interests)

    def _mock_interest_mapping(self, broad_interests: List[str]) -> List[SubCulture]:
        """
        Mock expansion for Demo Mode.
        """
        mapping = {
            "tech": [
                SubCulture(name="Low-Level Engineering", vibe="Hardware & Assembly", boost_keywords=["risc-v", "kernel", "latency"]),
                SubCulture(name="AI Safety & Ethics", vibe="Philosophical & Critical", boost_keywords=["alignment", "evals", "interpretability"]),
                SubCulture(name="Cybernetics", vibe="Body-Tech Integration", boost_keywords=["neuralink", "hci", "prosthetics"])
            ],
            "finance": [
                SubCulture(name="DeFi Architecture", vibe="Technical & decentralized", boost_keywords=["liquidity", "yield", "smart contract"]),
                SubCulture(name="Austrian Economics", vibe="Historical & Theoretical", boost_keywords=["hayek", "inflation", "sound money"])
            ],
            "science": [
                SubCulture(name="Astrobiology", vibe="Speculative & Scientific", boost_keywords=["exoplanet", "biosignature", "seti"]),
                SubCulture(name="Synthetic Biology", vibe="Engineering Life", boost_keywords=["crispr", "genetic", "bio-foundry"])
            ]
        }
        
        results = []
        for bi in broad_interests:
            key = bi.lower().strip()
            if key in mapping:
                results.extend(mapping[key])
            else:
                # Dynamic generic expansion
                results.append(SubCulture(name=f"{bi.title()} Analysis", vibe="Deep & Structural", boost_keywords=[bi.lower(), "structural", "analysis"]))
        
        final_results: List[SubCulture] = results
        return final_results[:8]

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

    async def generate_content_script(self, topic: str, angle: str) -> str:
        """
        Generates a video script + hook based on a topic and angle using a single-shot JSON prompt.
        Optimized for sub-5s response.
        """
        if settings.DEMO_MODE:
            return f"**[MOCK SCRIPT]**\n\n**Topic:** {topic}\n**Angle:** {angle}\n\n**Hook (0-5s):** 'Stop doing {topic} the wrong way!'\n\n**Body:** ... (Mock Content) ...\n\n---\n*🔒 This is a demo response. Add your AWS Bedrock keys to `.env` for real AI-generated scripts.*"

        prompt = f"""
        Act as a master YouTube Strategist. Write a video script outline for:
        Topic: "{topic}"
        Angle/Vibe: "{angle}"

        Rules:
        - Hook (0-10s): High-retention opening.
        - Value Prop: Why should they watch?
        - Key Points: 3 bullet points of unique insight. No tables.
        - Call to Action: Smooth interaction prompt.
        - Formatting: Use only plain text and markdown headers/lists. DO NOT use markdown tables.
        
        Return JSON ONLY:
        {{
            "script": "# Script title\\n\\n## Hook\\n...\\n\\n## Body\\n..."
        }}
        """
        try:
            res = await self._invoke_bedrock(prompt)
            return res.get("script", "Error: Script key missing in AI response.")
        except Exception as e:
            print(f"❌ Script Gen Failure: {e}")
            return f"Error generating script: {e}"

    async def generate_content_planner(self, niche: str, platforms: List[str], days: int, tone: str) -> str:
        """
        Generates a multi-platform content calendar.
        """
        if settings.DEMO_MODE:
            return f"**[MOCK PLANNER]**\n\n**Niche:** {niche}\n**Platforms:** {', '.join(platforms)}\n**Duration:** {days} days\n**Tone:** {tone}\n\n*Day 1: ...*"

        platforms_str = ", ".join(platforms) if platforms else "General"
        
        prompt = f"""
        Act as a Master Content Strategist. Create a detailed {days}-day content calendar for the niche: "{niche}".
        The content must be written in a "{tone}" tone.
        
        You must generate content for EXACTLY these platforms: {platforms_str}
        
        Rules:
        - Provide a day-by-day breakdown (Day 1, Day 2, ..., Day {days}).
        - For EVERY DAY, you MUST provide a separate category/section for EACH of the selected platforms ({platforms_str}).
        - Under each platform, provide a highly specific content idea and a brief description of the execution.
        - NEVER output markdown tables. Use headers, bold text, and bullet points.
        
        Return JSON ONLY:
        {{
            "content": "# Content Calendar\\n\\n## Day 1\\n**[Platform 1]**\\n- Idea...\\n**[Platform 2]**\\n- Idea...\\n\\n## Day 2..."
        }}
        """
        try:
            res = await self._invoke_bedrock(prompt)
            if isinstance(res, dict):
                return res.get("content") or res.get("script") or str(res)
            return str(res)
        except Exception as e:
            print(f"❌ Planner Gen Failure: {e}")
            return f"Error generating planner: {e}"

    async def summarize_video(self, transcript: str) -> dict:
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
        1. "summary": A list of 3-5 key takeaways (bullet points). No tables.
        2. "shorts_script": A 60-second viral Short script based on the best insight. (Plain text only).

        IMPORTANT: Do not use markdown tables in any field. Use only plain text and simple bullet points.

        Transcript: {transcript[:15000]}...
        """
        try:
            return await self._invoke_bedrock(prompt)
        except Exception as e:
            return {"error": str(e)}

    async def repurpose_content(self, transcript: str, format_type: str) -> str:
        """
        Repurposes a video transcript into a Blog Post, Twitter Thread, LinkedIn Post, or Reel Script.
        """
        if settings.DEMO_MODE:
             return f"**[MOCK {format_type.upper()}]**\n\nBased on transcript...\n\n---\n*🔒 This is a demo response. Add your AWS Bedrock keys to `.env` for real AI-generated content.*"

        format_prompts = {
            "twitter": "a highly engaging 5-7 tweet Twitter Thread. Use hooks, high-signal bullet points, and an actionable conclusion. Number the tweets like 1/7, 2/7. Do not use hashtags.",
            "linkedin": "a viral LinkedIn Post. Format with a story-driven hook, short punchy sentences, lots of whitespace, emojis for bullet points, and a strong professional CTA. Keep it under 200 words.",
            "hashnode": "a Hashnode technical blog post in Markdown format. Include an engaging H1 title, H2s, H3s, code snippets if relevant, actionable technical insights, and a clear intro/conclusion.",
            "reels": "a high-retention 60-second Instagram Reel / YouTube Shorts script. Focus purely on the most engaging or semantically dense 1-minute window of the content. **For every spoken line, you MUST provide a vivid [VISUAL:] and [AUDIO/SFX:] recommendation.** Format exactly like a professional script."
        }
        
        target_format = format_prompts.get(format_type.lower(), "a highly engaging post.")

        prompt = f"""
        Repurpose the following video transcript into {target_format}
        
        IMPORTANT: Extract the HIGHEST DENSITY signal. Delete all intro fluff, sponsor reads, and irrelevant chatter. 
        Use only plain text and basic markdown. DO NOT USE TABLES. Do NOT wrap your response in JSON; just output the raw repurposed text.

        Transcript: {transcript[:15000]}...
        """
        try:
            res = await self._invoke_bedrock(prompt)
            # Depending on how the AI answered, we might have 'content', 'script', or it might just be a string.
            if isinstance(res, dict):
                content = res.get("content") or res.get("script") or str(res)
                return str(content)
            return str(res)
        except Exception as e:
            return f"Error repurposing content: {e}"

    async def generate_terrain_niches(self, domain: str, parent_topic: Optional[str], watch_history: list) -> list:
        """
        AWS Bedrock-powered terrain expansion.
        Generates personalised niche sub-topics for the Explore Terrain using Claude.
        watch_history biases results toward fresh, adjacent topics the user hasn't seen.
        """
        if settings.DEMO_MODE:
            return self._mock_terrain_niches(domain, parent_topic, watch_history)

        history_hint = ""
        if watch_history:
            history_hint = (
                f"\n\nUser has recently explored: {', '.join(watch_history[:10])}. "
                "Prioritise adjacent niches they haven't discovered yet."
            )

        depth = "very specific leaf sub-niches" if parent_topic else "distinct sub-domains"
        prompt = f"""
You are an expert niche cartographer for a content discovery engine.
Generate exactly 6 unique, passionate, community-driven {depth} inside:

Domain: "{domain}"
{f'Parent: "{parent_topic}"' if parent_topic else ""}
{history_hint}

Rules:
- Each label is 2-4 words, highly specific (e.g. "Shoegaze Revival" not "Music")
- Prioritise obscure, high-signal sub-cultures over generic topics
- No repetition with parent

Return JSON only:
{{"topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5", "Topic 6"]}}
"""
        try:
            result = await self._invoke_bedrock(prompt)
            return result.get("topics", self._mock_terrain_niches(domain, parent_topic, watch_history))
        except Exception as e:
            print(f"Bedrock Terrain Gen Failed: {e}")
            return self._mock_terrain_niches(domain, parent_topic, watch_history)

    def _mock_terrain_niches(self, domain: str, parent_topic: Optional[str], watch_history: list) -> list:
        """Smart static fallback with watch-history-aware ordering."""
        TERRAIN_MAP: Dict[str, Dict] = {
            "Music": {
                None: ["Electronic Music", "Folk & Acoustic", "Jazz & Blues", "Metal & Noise", "Classical Composition", "World Music"],
                "Electronic Music": ["Modular Synthesis", "Ambient Drone", "Techno Archaeology", "Hyperpop Production", "Lo-fi Hip Hop", "Broken Beat"],
                "Folk & Acoustic": ["Celtic Revival", "Appalachian Sound", "Indie Folk", "Fingerstyle Guitar", "Delta Blues", "Nordic Folk"],
                "Jazz & Blues": ["Modal Jazz History", "Free Jazz Improvisation", "Afrobeat Fusion", "Jazz Harmony Theory", "Latin Jazz", "Bebop Origins"],
                "Metal & Noise": ["Black Metal Aesthetics", "Doom Drone", "Noise Rock", "Post-Metal Landscapes", "Sludge Metal", "Math Rock"],
                "Classical Composition": ["Spectralism", "Minimalist Composers", "Baroque Counterpoint", "20th Century Atonal", "Film Score Analysis", "Microtonal Music"],
            },
            "Fashion": {
                None: ["History of Fashion", "Streetwear Culture", "Sustainable Fashion", "Avant-Garde Design", "Vintage Revival", "Fashion Theory"],
                "History of Fashion": ["Victorian Mourning Dress", "Art Deco Glamour", "Edwardian Corsetry", "Regency Silhouettes", "Baroque Excess", "1920s Flapper Style"],
                "Streetwear Culture": ["Gorpcore Outdoors", "Techwear Aesthetic", "Japanese Harajuku", "Sneaker Archaeology", "Skate Fashion Roots", "Workwear Revival"],
                "Sustainable Fashion": ["Zero-Waste Sewing", "Upcycled Couture", "Deadstock Fabrics", "Natural Dyeing", "Repair Culture", "Slow Fashion Philosophy"],
                "Avant-Garde Design": ["Deconstruction Theory", "Wearable Technology", "Anti-Fashion Movement", "Conceptual Couture", "Gender-Fluid Silhouettes", "Biomimicry Textiles"],
            },
            "Science": {
                None: ["AI & Language Models", "Space Exploration", "Biotechnology", "Quantum Computing", "Neuroscience", "Materials Science"],
                "AI & Language Models": ["LLM Architecture", "AI Alignment Theory", "Multimodal Models", "Inference Optimization", "Prompt Engineering", "Synthetic Data"],
                "Space Exploration": ["Mars Geology", "Orbital Mechanics", "Exoplanet Atmospheres", "Space Medicine", "Lunar Economy", "Black Hole Physics"],
                "Biotechnology": ["CRISPR Ethics", "Synthetic Biology", "Organoids Research", "Longevity Science", "Microbiome Engineering", "Bioinformatics"],
                "Quantum Computing": ["Quantum Error Correction", "Topological Qubits", "Quantum Cryptography", "Quantum Chemistry", "NISQ Algorithms", "Quantum Advantage"],
            },
            "Cinema": {
                None: ["World Cinema", "Animation Techniques", "Documentary Filmmaking", "Screenwriting", "Cinematography", "Film Restoration"],
                "World Cinema": ["French New Wave", "Iranian Cinema", "South Korean Thrillers", "Brazilian Cinema Novo", "Japanese Slow Cinema", "Nordic Noir"],
                "Animation Techniques": ["Stop Motion History", "Rotoscoping Art", "2D Limited Animation", "CGI Breakdown", "Motion Capture Ethics", "Independent Animation"],
                "Documentary Filmmaking": ["True Crime Ethics", "Nature Cinematography", "Investigative Journalism", "Observational Films", "Mockumentary Craft", "Expository Docs"],
            },
            "Art": {
                None: ["Contemporary Art", "Street Art", "Digital Art", "Photography", "Sculpture", "Art Theory"],
                "Contemporary Art": ["Post-Internet Art", "Relational Aesthetics", "Bio Art", "Land Art", "Institutional Critique", "Speculative Design"],
                "Street Art": ["Muralism Roots", "Stencil Art", "Legal Walls", "Graffiti Calligraphy", "Wheatpaste Activism", "3D Street Art"],
                "Digital Art": ["Generative Art Code", "NFT Art Critique", "AI Art Ethics", "WebGL Experiments", "Pixel Art Revival", "Glitch Aesthetics"],
            },
            "Business": {
                None: ["Startups", "Content Marketing", "Leadership", "Finance & Economics", "Product Management", "Indie Hackers"],
                "Startups": ["MVP Validation", "Zero to One Philosophy", "Venture Capital", "Bootstrapped SaaS", "Founder Psychology", "Startup Post-Mortems"],
                "Content Marketing": ["Community-Led Growth", "Viral Loop Design", "SEO in LLM Era", "Long-Form Video Essays", "Newsletter Economics", "Podcast Monetization"],
            },
            "Food": {
                None: ["Street Food", "Fermentation Science", "Ancient Recipes", "Food Anthropology", "Restaurant Culture", "Food Chemistry"],
                "Street Food": ["Hawker Culture Singapore", "Oaxacan Tlayudas", "Bangkok Night Markets", "Istanbul Street Food", "Peruvian Ceviche History", "Ethiopian Injera Tradition"],
                "Fermentation Science": ["Kimchi Microbiology", "Sourdough Starter Science", "Miso Brewing Traditions", "Kefir Cultures", "Tempeh Craft", "Lacto-Fermentation"],
            },
            "Travel": {
                None: ["POV City Walks", "Dangerous Roads", "Luxury Hotel Tours", "Solo Female Travel", "Cabin Builds", "Van Life Content"],
            },
            "Gaming": {
                None: ["Rage Compilations", "Lore Explained", "Speedruns (Any%)", "Esports Highlights", "Cozy Games", "Retro Emulation"],
            },
            "Education": {
                None: ["Study With Me", "Life Hacks", "How Things Work", "Financial Independence", "History Animations", "Language Learning"],
            },
            "Comedy": {
                None: ["Public Pranks", "Relatable Skits", "Roast Battles", "Podcast Clips", "Parody Songs", "Stand-up Specials"],
            },
        }

        domain_data = TERRAIN_MAP.get(domain, {})
        result = domain_data.get(parent_topic) or domain_data.get(None) or [
            f"Deep {domain} Study", f"{domain} History", f"Applied {domain}",
            f"{domain} Theory", f"Modern {domain}", f"Alternative {domain}"
        ]

        # Watch-history personalisation: surface unseen niches first
        if watch_history:
            history_str = " ".join(watch_history).lower()
            seen = [t for t in result if any(w in t.lower() for w in history_str.split())]
            unseen = [t for t in result if t not in seen]
            result = unseen + seen

        return result[:6]
    async def generate_community_vision(self, community_name: str, quiz_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a bespoke 'Blueprint' for a specific community/niche.
        Used when a creator explores their Personal Peak.
        """
        prompt = f"""
        Act as a Hyperbolic Community Strategist. You are designing a 'Blue Ocean Niche Blueprint' for a creator's specific growth tier.
        
        Tier Title/Community: "{community_name}"
        
        Creator Context:
        Audience: {quiz_context.get('audience')}
        Goal: {quiz_context.get('goal')}
        Style: {quiz_context.get('style')}
        Tools: {quiz_context.get('tools')}
        Language: {quiz_context.get('languages')}
        
        This "{community_name}" represents one level of their creative ascent. 
        Describe it as a specific, thriving sub-culture or community angle they should own.
        
        Return a JSON object:
        1. "vision": A 2-sentence 'Elevator Pitch' for why this specific tier/niche is a high-signal blue ocean.
        2. "roadmap": 3 bullet points for a '90-day growth roadmap' specifically for reaching/mastering this tier.
        3. "vibe": A description of the 'Aesthetic/Vibe' and 'Content Depth' required for this community.
        """
        
        if settings.DEMO_MODE:
            return {
                "vision": f"{community_name} is a high-signal sub-culture where your {quiz_context.get('style')} approach perfectly resonates with {quiz_context.get('audience')}. This tier represents a critical milestone in establishing your unique 'Blue Ocean' presence.",
                "roadmap": [
                    f"Optimize {community_name} content for maximum retention",
                    f"Build a tribe of {quiz_context.get('audience')} around this specific niche",
                    f"Scale production using {quiz_context.get('tools')} and unique storytelling"
                ],
                "vibe": f"Premium, {community_name}-centric, and deeply immersive for {quiz_context.get('audience')}."
            }

        try:
            return await self._invoke_bedrock(prompt)
        except Exception as e:
            print(f"Vision generation failed: {e}")
            return {"vision": "Failed to generate vision.", "roadmap": ["Try again later"], "vibe": "Neutral"}
