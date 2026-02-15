# Design Document: Amplify (Hyperbolic Social Media Platform)

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Consumer   │  │   Creator    │  │  AI Studio   │      │
│  │     Mode     │  │     Mode     │  │    Tools     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         React 19 + Vite + Tailwind CSS + Three.js          │
└─────────────────────────────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Layer                       │
│                    FastAPI + Uvicorn                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Feed API   │  │  Creator API │  │  Tools API   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Bedrock    │  │   Scraper    │  │   Ranking    │
│    Agent     │  │   Service    │  │    Engine    │
└──────────────┘  └──────────────┘  └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ AWS Bedrock  │  │   yt-dlp     │  │   textstat   │
│ Claude 3     │  │   YouTube    │  │   NLP libs   │
└──────────────┘  └──────────────┘  └──────────────┘
                            │
                            ▼
                  ┌──────────────┐
                  │   AWS S3     │
                  │   "Pantry"   │
                  └──────────────┘
```

### 1.2 Component Breakdown

#### Frontend Components
- **App.jsx**: Main application shell, routing, mode switching
- **SearchBar**: Query input with persona selection
- **Feed**: Standard list view for video results
- **HyperbolicSpace**: 3D WebGL visualization using Three.js
- **VideoCard**: Individual video display component
- **CreatorAssessment**: Profile builder and niche recommendation wizard
- **CreatorTools**: AI Studio with 11 specialized tools
- **Dashboard**: Analytics and performance metrics

#### Backend Services
- **main.py**: FastAPI application, endpoint definitions
- **bedrock_agent.py**: AWS Bedrock integration, AI analysis
- **scraper.py**: YouTube data extraction via yt-dlp
- **ranking_engine.py**: Hyperbolic scoring algorithm
- **creator_service.py**: Market analysis and niche detection
- **storage_service.py**: S3 caching and data persistence

#### Core Models
- **Video**: Video metadata, scores, engagement metrics
- **HyperbolicIntent**: Detected sub-culture and vibe
- **UserContext**: User preferences and search history
- **CreatorProfile**: Skills, risk tolerance, time commitment
- **FeedRequest**: Search query and context
- **FeedbackRequest**: User relevance signals

## 2. Data Flow Diagrams

### 2.1 Consumer Search Flow

```
User Query
    │
    ▼
┌─────────────────┐
│  SearchBar      │
│  (Frontend)     │
└─────────────────┘
    │
    ▼ POST /feed
┌─────────────────┐
│  FastAPI        │
│  Endpoint       │
└─────────────────┘
    │
    ├──────────────────────┐
    ▼                      ▼
┌─────────────────┐  ┌─────────────────┐
│ Bedrock Agent   │  │ Scraper Service │
│ analyze_vibe()  │  │ search_videos() │
└─────────────────┘  └─────────────────┘
    │                      │
    │                      ├─────────────┐
    │                      ▼             ▼
    │              ┌─────────────┐  ┌─────────────┐
    │              │ S3 Cache    │  │  yt-dlp     │
    │              │ Check       │  │  Scrape     │
    │              └─────────────┘  └─────────────┘
    │                      │             │
    │                      └─────────────┘
    │                      ▼
    │              ┌─────────────────┐
    │              │ Bedrock Agent   │
    │              │ analyze_density │
    │              └─────────────────┘
    │                      │
    │                      ▼
    │              ┌─────────────────┐
    │              │ S3 Cache        │
    │              │ Store Results   │
    │              └─────────────────┘
    │                      │
    └──────────────────────┘
    ▼
┌─────────────────┐
│ Ranking Engine  │
│ rank_videos()   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Ranked Feed     │
│ + Intent        │
└─────────────────┘
    │
    ▼ JSON Response
┌─────────────────┐
│ Frontend        │
│ Render          │
└─────────────────┘
```

### 2.2 Creator Market Analysis Flow

```
Niche Query
    │
    ▼ POST /creator/insights
┌─────────────────┐
│ Creator Service │
│ analyze_niche() │
└─────────────────┘
    │
    ├──────────────────────┐
    ▼                      ▼
┌─────────────────┐  ┌─────────────────┐
│ Scraper Service │  │ Bedrock Agent   │
│ search_videos() │  │ suggest_niches()│
└─────────────────┘  └─────────────────┘
    │                      │
    ▼                      │
┌─────────────────┐        │
│ Bedrock Agent   │        │
│ analyze_density │        │
│ (for each video)│        │
└─────────────────┘        │
    │                      │
    ▼                      │
┌─────────────────┐        │
│ Ranking Engine  │        │
│ rank_videos()   │        │
└─────────────────┘        │
    │                      │
    ├──────────────────────┘
    ▼
┌─────────────────┐
│ Calculate:      │
│ - Market Gap    │
│ - Opportunities │
│ - Strategy      │
└─────────────────┘
    │
    ▼ If Saturated
┌─────────────────┐
│ Recursive       │
│ Sub-Niche       │
│ Analysis        │
└─────────────────┘
    │
    ▼ JSON Response
┌─────────────────┐
│ Dashboard       │
│ Visualization   │
└─────────────────┘
```

### 2.3 AI Studio Tool Flow

```
User Input
    │
    ▼
┌─────────────────┐
│ CreatorTools    │
│ Component       │
└─────────────────┘
    │
    ▼ POST /creator/tools/{tool}
┌─────────────────┐
│ FastAPI         │
│ Endpoint        │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Creator Service │
│ Tool Method     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Bedrock Agent   │
│ _invoke_bedrock │
└─────────────────┐
    │
    ▼
┌─────────────────┐
│ AWS Bedrock API │
│ Claude 3 Sonnet │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ JSON Parsing    │
│ & Formatting    │
└─────────────────┘
    │
    ▼ Response
┌─────────────────┐
│ Frontend        │
│ Markdown Render │
└─────────────────┘
```

## 3. Database Schema

### 3.1 S3 Storage Structure

```
s3://hyperbolic-pantry/
├── videos/
│   ├── {video_id_1}.json
│   ├── {video_id_2}.json
│   └── ...
```

### 3.2 Video Metadata Schema (S3 JSON)

```json
{
  "video_id": "string",
  "title": "string",
  "channel": "string",
  "views": "string (formatted)",
  "raw_views": "integer",
  "published": "string (date)",
  "tags": ["string"],
  "transcript_summary": "string",
  "like_count": "integer",
  "comment_count": "integer",
  "engagement_rate": "float",
  "base_score": "float (0-100)",
  "hyperbolic_score": "float (0-100)",
  "match_reason": "string",
  "status": "string (active|deleted)",
  "_ingested_at": "ISO timestamp",
  "_last_updated": "ISO timestamp"
}
```

### 3.3 In-Memory Data Structures

#### Demand Matrix (Ranking Engine)
```python
demand_matrix: Counter[str, int]
# Key: keyword (lowercase)
# Value: cumulative feedback weight (+1 relevant, -1 not relevant)
```

#### Video Cache (Ranking Engine)
```python
video_cache: Dict[str, Video]
# Key: video_id
# Value: Video object for feedback loop
```

## 4. API Design

### 4.1 Consumer Endpoints

#### POST /feed
**Description**: Search for videos with hyperbolic ranking

**Request Body**:
```json
{
  "query": "string",
  "user_context": {
    "user_id": "string",
    "interests": ["string"],
    "current_mood": "string (optional)",
    "recent_searches": ["string"]
  }
}
```

**Response**:
```json
{
  "intent": {
    "sub_culture": "string",
    "vibe": "string",
    "target_audience": "string",
    "boost_keywords": ["string"],
    "suppress_keywords": ["string"]
  },
  "feed": [
    {
      "video_id": "string",
      "title": "string",
      "channel": "string",
      "views": "string",
      "published": "string",
      "tags": ["string"],
      "hyperbolic_score": "float",
      "base_score": "float",
      "match_reason": "string",
      "engagement_rate": "float"
    }
  ]
}
```

#### POST /consumer/feedback
**Description**: Submit relevance feedback

**Request Body**:
```json
{
  "video_id": "string",
  "is_relevant": "boolean",
  "context": ["string"]
}
```

**Response**:
```json
{
  "status": "Feedback Received",
  "matrix_updated": true
}
```

### 4.2 Creator Endpoints

#### POST /creator/insights
**Description**: Analyze niche for market opportunities

**Request Body**:
```json
{
  "query": "string",
  "user_context": null
}
```

**Response**:
```json
{
  "topic": "string",
  "market_gap_score": "float (0-100)",
  "avg_views": "string (formatted)",
  "avg_quality_density": "float (0-100)",
  "strategy": "string",
  "opportunities": [
    {
      "type": "string",
      "reason": "string",
      "target_video": "string"
    }
  ],
  "incumbents": [
    {
      "video_id": "string",
      "title": "string",
      "hyperbolic_score": "float"
    }
  ],
  "sub_niches": [
    {
      "topic": "string",
      "market_gap_score": "float",
      "strategy": "string"
    }
  ]
}
```

#### POST /creator/assessment
**Description**: Generate personalized niche recommendations

**Request Body**:
```json
{
  "primary_skills": ["string"],
  "weekly_hours": "integer",
  "risk_tolerance": "string (Stable|Balanced|Experimental)",
  "preferred_categories": ["string"]
}
```

**Response**:
```json
{
  "profile_summary": "string",
  "recommended_niches": [
    {
      "topic": "string",
      "market_gap_score": "float",
      "strategy": "string",
      "avg_views": "string",
      "avg_quality_density": "float"
    }
  ]
}
```

### 4.3 AI Studio Tool Endpoints

#### POST /creator/tools/script
**Request**: `{ "topic": "string", "angle": "string" }`
**Response**: `{ "script": "string (markdown)" }`

#### POST /creator/tools/summarize
**Request**: `{ "transcript": "string" }`
**Response**: `{ "summary": ["string"], "shorts_script": "string" }`

#### POST /creator/tools/repurpose
**Request**: `{ "transcript": "string", "format": "string" }`
**Response**: `{ "content": "string" }`

## 5. Algorithm Design

### 5.1 Hyperbolic Scoring Algorithm

```python
def calculate_hyperbolic_score(video, intent):
    # 1. Semantic Density (0-10)
    complexity = flesch_reading_ease(content)
    vocab_richness = unique_words / total_words
    semantic_density = (vocab_richness * 10) + ((100 - complexity) / 20)
    semantic_density = min(10.0, semantic_density)
    
    # 2. Rarity Bonus (0-10)
    log_views = log(max(1, raw_views))
    rarity_bonus = 10.0 / (log_views + 1)
    
    # 3. Demand Score (from feedback)
    demand_score = sum(demand_matrix[word] * 0.5 for word in keywords)
    
    # 4. Base Score
    hyperbolic_score = (semantic_density * 5.0) + (rarity_bonus * 5.0) + demand_score
    
    # 5. Vibe Alignment Boost
    if intent.boost_keywords match content:
        hyperbolic_score += 15.0
    
    return min(100.0, max(0.0, hyperbolic_score))
```

### 5.2 Market Gap Score Algorithm

```python
def calculate_market_gap_score(incumbents):
    # 1. Demand Signal (Logarithmic View Score)
    avg_views = sum(video.raw_views) / len(incumbents)
    view_score = log10(max(avg_views, 1)) * 10
    
    # 2. Engagement Bonus
    avg_engagement = sum(video.engagement_rate) / len(incumbents)
    engagement_bonus = avg_engagement * 500
    
    # 3. Competition Quality (Density Penalty)
    avg_density = sum(video.base_score) / len(incumbents)
    density_penalty = avg_density * 0.5
    
    # 4. Final Score
    market_gap_score = view_score + engagement_bonus - density_penalty
    return max(0, min(100, market_gap_score))
```

### 5.3 Intent Detection Logic

```python
def analyze_vibe(query, context):
    # Pattern matching for known domains
    if "quantum" in query:
        if "eli5" in query or "baby" in query:
            return HyperbolicIntent(
                sub_culture="Pop Science",
                vibe="Accessible & Fun",
                boost_keywords=["baby", "cartoon", "animation"],
                suppress_keywords=["lecture", "academic"]
            )
        else:
            return HyperbolicIntent(
                sub_culture="Academic Rigor",
                vibe="Intellectual & Deep",
                boost_keywords=["lecture", "mit", "professor"],
                suppress_keywords=["tiktok", "viral"]
            )
    
    # Dynamic fallback
    return HyperbolicIntent(
        sub_culture=f"{query.title()} Deep Dive",
        vibe="Signal-to-Noise Optimized",
        boost_keywords=query.split(),
        suppress_keywords=["reaction", "prank", "giveaway"]
    )
```

## 6. UI/UX Design

### 6.1 Design System

#### Color Palette
```css
/* Primary */
--violet-400: #a78bfa
--violet-500: #8b5cf6
--violet-600: #7c3aed
--indigo-500: #6366f1
--indigo-600: #4f46e5

/* Accents */
--pink-400: #f472b6
--emerald-400: #34d399
--cyan-400: #22d3ee
--red-400: #f87171

/* Neutrals */
--gray-100: #f3f4f6
--gray-500: #6b7280
--gray-700: #374151
--gray-900: #111827
--black: #0a0118
```

#### Typography
- **Headings**: System font stack, bold (600-900)
- **Body**: System font stack, regular (400)
- **Code**: Monospace font stack
- **Sizes**: 10px (labels) → 48px (hero)

#### Spacing
- **Base unit**: 4px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80

### 6.2 Component Patterns

#### Glass Card
```css
.glass-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  backdrop-filter: blur(20px);
}
```

#### Gradient Button
```css
.gradient-button {
  background: linear-gradient(to right, #7c3aed, #4f46e5);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  transition: opacity 0.2s;
}
```

#### Stat Card
```css
.stat-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 16px;
  border-radius: 16px;
  transition: border-color 0.3s;
}
.stat-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
}
```

### 6.3 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### 6.4 3D Visualization Design

#### Video Node Visualization
- **Size**: Proportional to hyperbolic_score (0.8 - 5.0 units)
- **Color**: 
  - Green (#00ff88): Score > 80
  - Cyan (#00ccff): Score 50-80
  - Red (#ff0055): Score < 50
- **Glow**: Emissive intensity increases on hover
- **Animation**: Gentle floating motion (sin wave)

#### Niche Galaxy Visualization
- **Layout**: Radial from center (main niche)
- **Shape**: Icosahedron (solid for Blue Ocean, wireframe for saturated)
- **Grid**: Concentric circles with radial lines
- **Labels**: HTML overlays with score and status

## 7. Security Design

### 7.1 Authentication & Authorization
- **Current**: No authentication (prototype)
- **Future**: JWT-based authentication, role-based access control

### 7.2 Input Validation
```python
# Query validation
def validate_query(query: str) -> bool:
    if not query or len(query) > 500:
        raise ValueError("Query must be 1-500 characters")
    return True

# Sanitization
def sanitize_input(text: str) -> str:
    # Remove potential injection patterns
    return text.strip()
```

### 7.3 API Security
- **CORS**: Configured for all origins (development), restricted in production
- **Rate Limiting**: Not implemented (future enhancement)
- **Input Sanitization**: Basic validation on all endpoints

### 7.4 Secrets Management
```python
# Environment variables
AWS_ACCESS_KEY_ID=<secret>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_REGION=us-east-1
S3_BUCKET_NAME=hyperbolic-pantry
```

## 8. Performance Optimization

### 8.1 Caching Strategy

#### S3 Cache ("Pantry")
- **Purpose**: Reduce YouTube scraping and Bedrock API calls
- **TTL**: Indefinite (manual invalidation)
- **Hit Rate Target**: > 60%
- **Structure**: One JSON file per video_id

#### In-Memory Cache
- **Video Cache**: Stores recent videos for feedback loop
- **Demand Matrix**: Persistent across requests (in-memory)

### 8.2 Parallel Processing

```python
# Parallel video fetching
with ThreadPoolExecutor(max_workers=10) as executor:
    futures = [executor.submit(fetch_video, id) for id in video_ids]
    results = [future.result() for future in as_completed(futures)]
```

### 8.3 Frontend Optimization
- **Code Splitting**: Lazy load 3D components
- **Asset Optimization**: Vite build optimization
- **Debouncing**: Search input debounced (300ms)
- **Virtualization**: Not implemented (future for large lists)

## 9. Error Handling

### 9.1 Backend Error Handling

```python
try:
    # Operation
except ClientError as e:
    logger.error(f"AWS Error: {e}")
    return fallback_response()
except Exception as e:
    logger.error(f"Unexpected Error: {e}")
    raise HTTPException(status_code=500, detail=str(e))
```

### 9.2 Frontend Error Handling

```javascript
try {
  const response = await fetch(endpoint, options);
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  return data;
} catch (err) {
  console.error(err);
  setError("Failed to connect to Hyperbolic Engine");
}
```

### 9.3 Graceful Degradation

- **AWS Bedrock Unavailable**: Switch to demo mode with mock responses
- **YouTube Scraping Fails**: Return empty results with error message
- **S3 Unavailable**: Skip caching, continue with fresh data
- **WebGL Not Supported**: Fall back to 2D list view

## 10. Testing Strategy

### 10.1 Unit Testing
- **Backend**: pytest for service layer functions
- **Frontend**: Jest + React Testing Library for components
- **Coverage Target**: > 70%

### 10.2 Integration Testing
- **API Endpoints**: Test with mock AWS services
- **Data Flow**: End-to-end search flow validation
- **Cache Behavior**: S3 read/write operations

### 10.3 Manual Testing
- **UI/UX**: Cross-browser testing (Chrome, Firefox, Safari, Edge)
- **3D Visualization**: Performance testing on various hardware
- **AI Output Quality**: Human review of generated content

## 11. Deployment Architecture

### 11.1 Development Environment
```
Frontend: Vite dev server (localhost:5173)
Backend: Uvicorn (localhost:8000)
Storage: AWS S3 (development bucket)
AI: AWS Bedrock (us-east-1)
```

### 11.2 Production Architecture (Proposed)
```
Frontend: Vercel / Netlify (CDN)
Backend: AWS ECS / Lambda (containerized)
Storage: AWS S3 (production bucket)
AI: AWS Bedrock (multi-region)
Database: DynamoDB (user data, future)
Monitoring: CloudWatch + Sentry
```

### 11.3 CI/CD Pipeline (Proposed)
```
GitHub Actions:
1. Lint & Format Check
2. Unit Tests
3. Build Frontend
4. Build Backend Docker Image
5. Deploy to Staging
6. Integration Tests
7. Deploy to Production (manual approval)
```

## 12. Monitoring & Observability

### 12.1 Logging
- **Backend**: Python logging module, structured JSON logs
- **Frontend**: Console logging (development), Sentry (production)
- **Log Levels**: DEBUG, INFO, WARNING, ERROR, CRITICAL

### 12.2 Metrics (Future)
- **API Latency**: P50, P95, P99 response times
- **Error Rates**: 4xx, 5xx by endpoint
- **Cache Hit Rate**: S3 cache effectiveness
- **AI Usage**: Bedrock API calls, token consumption
- **User Engagement**: Search volume, click-through rates

### 12.3 Alerting (Future)
- **Error Rate > 5%**: Page on-call engineer
- **API Latency > 10s**: Warning notification
- **AWS Cost Spike**: Budget alert
- **Service Down**: Immediate page

## 13. Scalability Considerations

### 13.1 Horizontal Scaling
- **Backend**: Stateless API servers, load balanced
- **Workers**: Separate scraping workers for parallel processing
- **Cache**: Distributed cache (Redis) for demand matrix

### 13.2 Vertical Scaling
- **Database**: DynamoDB auto-scaling
- **Compute**: ECS task size adjustment based on load
- **Storage**: S3 unlimited capacity

### 13.3 Bottlenecks
- **YouTube Scraping**: Rate limited by yt-dlp and YouTube
- **AWS Bedrock**: Token limits and API quotas
- **3D Rendering**: Client-side GPU performance

## 14. Future Technical Enhancements

### 14.1 Architecture Evolution
- **Microservices**: Split into search, creator, and tools services
- **Event-Driven**: Use SQS/SNS for async processing
- **GraphQL**: Replace REST with GraphQL for flexible queries
- **WebSockets**: Real-time updates for trend monitoring

### 14.2 AI/ML Improvements
- **Custom Models**: Train models on user feedback data
- **Embeddings**: Use vector embeddings for semantic search
- **Recommendation Engine**: Collaborative filtering for personalization
- **Automated Retraining**: Continuous model improvement pipeline

### 14.3 Data Infrastructure
- **Data Lake**: Store raw data for analytics
- **Data Warehouse**: Aggregate metrics for reporting
- **ETL Pipeline**: Automated data processing workflows
- **Real-time Analytics**: Stream processing with Kinesis

## 15. Appendix

### 15.1 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend Framework | React | 19.2.0 | UI components |
| Build Tool | Vite | 7.3.1 | Development & bundling |
| Styling | Tailwind CSS | 3.4.17 | Utility-first CSS |
| 3D Graphics | Three.js | 0.182.0 | WebGL rendering |
| 3D Helpers | @react-three/fiber | 9.5.0 | React Three.js integration |
| Backend Framework | FastAPI | Latest | REST API |
| Server | Uvicorn | Latest | ASGI server |
| Data Validation | Pydantic | Latest | Schema validation |
| AWS SDK | boto3 | Latest | AWS service integration |
| YouTube Scraper | yt-dlp | Latest | Video metadata extraction |
| NLP | textstat | Latest | Readability analysis |
| AI Service | AWS Bedrock | Claude 3 Sonnet | LLM inference |
| Storage | AWS S3 | - | Object storage |

### 15.2 File Structure

```
hyperbolic_final/
├── app/
│   ├── core/
│   │   ├── config.py          # Configuration & settings
│   │   └── models.py          # Pydantic data models
│   ├── services/
│   │   ├── bedrock_agent.py   # AI integration
│   │   ├── creator_service.py # Market analysis
│   │   ├── ranking_engine.py  # Scoring algorithm
│   │   ├── scraper.py         # YouTube scraping
│   │   └── storage_service.py # S3 operations
│   └── main.py                # FastAPI application
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CreatorAssessment.jsx
│   │   │   ├── CreatorTools.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── HyperbolicSpace.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── VideoCard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── requirements.txt
├── requirements.md            # This document
└── design.md                  # This document
```

### 15.3 Key Design Decisions

1. **Hyperbolic Geometry Metaphor**: Used as conceptual framework for "signal-to-noise" inversion, not literal mathematical implementation
2. **S3 as Cache**: Chosen for unlimited scalability and cost-effectiveness over traditional database
3. **Demo Mode**: Allows system to function without AWS credentials for development/testing
4. **Parallel Scraping**: ThreadPoolExecutor for 10x performance improvement
5. **React Three Fiber**: Declarative 3D rendering integrated with React component lifecycle
6. **Tailwind CSS**: Utility-first approach for rapid UI development and consistency
7. **FastAPI**: Chosen for automatic OpenAPI docs, type safety, and async support
8. **yt-dlp**: Most reliable YouTube scraping library with active maintenance
