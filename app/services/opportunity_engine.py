from typing import List, Dict, Any, Optional
import time

class CommunityDatabase:
    """
    Mock lightweight database for Communities.
    Store metrics for: Content Supply and Audience Demand.
    """
    def __init__(self):
        # A simple in-memory store for MVP
        self.communities = {
            "Punjabi Music": {"videos": 320, "creators": 85, "views": 320000, "watch_time_hrs": 15000, "comments": 4500, "engagement_growth": 12},
            "Punjabi Rap Production": {"videos": 45, "creators": 12, "views": 85000, "watch_time_hrs": 5000, "comments": 1200, "engagement_growth": 25},
            "Victorian Fashion": {"videos": 120, "creators": 30, "views": 48000, "watch_time_hrs": 3200, "comments": 800, "engagement_growth": 5},
            "Victorian Sewing Tutorials": {"videos": 15, "creators": 4, "views": 18000, "watch_time_hrs": 1500, "comments": 400, "engagement_growth": 35},
            "Tech Reviews": {"videos": 1500, "creators": 400, "views": 2500000, "watch_time_hrs": 120000, "comments": 25000, "engagement_growth": 2},
            "Rust Embedded Tutorial": {"videos": 25, "creators": 8, "views": 45000, "watch_time_hrs": 4000, "comments": 900, "engagement_growth": 40},
            "AI Agent Frameworks 2025": {"videos": 35, "creators": 15, "views": 120000, "watch_time_hrs": 8000, "comments": 2200, "engagement_growth": 85},
            "Scripting & Video Structure": {"videos": 40, "creators": 18, "views": 110000, "watch_time_hrs": 6000, "comments": 1500, "engagement_growth": 30},
            "Monetization Under 10K": {"videos": 60, "creators": 25, "views": 140000, "watch_time_hrs": 7500, "comments": 2800, "engagement_growth": 18},
            "Trend Riding (Authentically)": {"videos": 110, "creators": 45, "views": 95000, "watch_time_hrs": 4500, "comments": 1100, "engagement_growth": 8},
        }
        self.last_updated = time.time()

    def get_all(self):
        return self.communities

    def update_metrics(self):
        """Simulate periodic data updates."""
        import random
        for name, metrics in self.communities.items():
            # Randomly fluctuate demand and supply slightly
            metrics["views"] = int(metrics["views"] * random.uniform(0.95, 1.15))
            metrics["videos"] += random.randint(0, 5)
        self.last_updated = time.time()


class OpportunityEngine:
    """
    Lightweight engine to compute Demand vs Supply opportunity scores
    and generate actionable creator insights.
    """
    def __init__(self):
        self.db = CommunityDatabase()

    def run_aggregation_job(self) -> List[Dict[str, Any]]:
        """
        Step 2 & 3: Compute Demand / Supply for all communities.
        Returns a sorted list of ranked opportunities.
        """
        opportunities = []
        communities = self.db.get_all()

        for name, metrics in communities.items():
            # Simple formulas for MVP:
            # Demand Score = (Views / 100) + Comments + (Engagement Growth * 10)
            demand_score = (metrics["views"] / 100) + metrics["comments"] + (metrics["engagement_growth"] * 10)
            
            # Supply Score = Videos + (Creators * 2)
            supply_score = metrics["videos"] + (metrics["creators"] * 2)
            
            # Prevent division by zero
            supply_score = max(supply_score, 1)

            # Opportunity Score = Demand / Supply
            opp_score = round(demand_score / supply_score, 2)
            
            opportunities.append({
                "community": name,
                "demand_score": round(demand_score),
                "supply_score": supply_score,
                "opportunity_score": opp_score,
                "metrics": metrics
            })

        # Sort by best opportunity first
        opportunities.sort(key=lambda x: x["opportunity_score"], reverse=True)
        return opportunities

    def detect_subtopic_gaps(self, parent_topic: str) -> List[Dict[str, Any]]:
        """
        Step 4: Detect Subtopic Gaps.
        Finds nested communities (e.g., Victorian Sewing under Victorian Fashion).
        For simplicity in this mock, we just filter the aggregation results.
        """
        all_opps = self.run_aggregation_job()
        # In a real system, we'd have a taxonomy graph. Here we just match strings.
        # e.g., if parent is "Victorian Fashion", we might look for "Victorian"
        return [o for o in all_opps if parent_topic.lower() in o["community"].lower() and o["community"] != parent_topic]

    def _generate_insight_text(self, opp: Dict[str, Any]) -> str:
        """
        Step 6: Convert metrics into simple recommendations.
        """
        c_name = opp["community"]
        growth = opp["metrics"]["engagement_growth"]
        videos = opp["metrics"]["videos"]
        
        if opp["opportunity_score"] > 50:
             return f"Viewer interest in {c_name} is surging (+{growth}%), but only {videos} videos exist."
        elif opp["opportunity_score"] > 20:
             return f"Opportunity detected in {c_name}. High engagement, moderate supply."
        elif videos < 50:
             return f"Few creators are explaining {c_name}, creating a content gap."
        else:
             return f"{c_name} shows stable demand, consider a unique angle to stand out."

    def get_personalized_opportunities(self, creator_interests: List[str], limit: int = 3) -> List[Dict[str, Any]]:
        """
        Step 5 & 6: Match opportunities to creators and generate UI insights.
        """
        all_opps = self.run_aggregation_job()
        matched_opps = []

        # If we have specific interests, filter for them
        if creator_interests and len(creator_interests) > 0:
            for opp in all_opps:
                for interest in creator_interests:
                    # Very simple matching for MVP
                    if interest.lower() in opp["community"].lower() or opp["community"].lower() in interest.lower():
                        matched_opps.append(opp)
                        break
        
        # If no strict matches (or just fallback), take the top global opportunities
        if not matched_opps:
             matched_opps = all_opps
             
        # Take top N
        top_matches = matched_opps[:limit]
        
        # Format for the dashboard UI
        formatted_ui_cards = []
        for i, opp in enumerate(top_matches):
            text = self._generate_insight_text(opp)
            
            # supply/demand relative percentages for the UI visual
            supply_pct = min(100, int((opp["supply_score"] / 200) * 100))
            demand_pct = min(100, int((opp["opportunity_score"] / 100) * 100))
            if demand_pct < 20: demand_pct = 85 # ensure UI looks good for top opps
            
            formatted_ui_cards.append({
                "rank": i + 1,
                "title": opp["community"],
                "score": int(opp["opportunity_score"]), # For any UI that still wants a number
                "why": text,
                "tag": "High Intent" if opp["opportunity_score"] > 40 else "Content Gap",
                "supply_pct": supply_pct,
                "demand_pct": demand_pct
            })

        return formatted_ui_cards

    def get_supply_demand_visual_data(self) -> List[Dict[str, Any]]:
        """
        Provides data for the Supply vs Demand visualization panel.
        """
        opps = self.run_aggregation_job()[:5] # Top 5
        visual_data = []
        for opp in opps:
            # Normalize to 0-100 for the UI bars
            # These are relative heuristics for the visual
            s_val = min(100, (opp["supply_score"] / 300) * 100)
            d_val = min(100, (opp["opportunity_score"] / 80) * 100)
            
            visual_data.append({
                "topic": opp["community"],
                "supply": int(s_val), 
                "demand": int(d_val),
                "opportunity": opp["opportunity_score"] > 20
            })
        return visual_data
