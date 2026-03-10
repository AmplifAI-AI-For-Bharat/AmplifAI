import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import Feed from './components/Feed';
import HyperbolicSpace from './components/HyperbolicSpace';
import CreatorAssessment from './components/CreatorAssessment';
import CreatorTools from './components/CreatorTools';
import InterestPicker from './components/InterestPicker';
import ExploreTerrain, { STATIC_MAP } from './components/ExploreTerrain';

const APP_NAME = 'AmplifAI';
const API_BASE_URL = 'https://amplifai-backend-fea3.onrender.com';

const SwipeDownHint = ({ text = "Swipe down to search" }) => (
  <div className="animate-bounce flex flex-col items-center gap-2 mb-6">
    <div className="px-4 py-2 bg-devfolio-blue/10 border-2 border-devfolio-blue/20 rounded-full text-devfolio-blue text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-devfolio-blue animate-pulse"></span>
      {text}
    </div>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-devfolio-blue/40">
      <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
    </svg>
  </div>
);

function App() {
  const [currentFeed, setCurrentFeed] = useState(null);
  const [marketInsights, setMarketInsights] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [fetchingInsights, setFetchingInsights] = useState(false);
  const [currentIntent, setCurrentIntent] = useState(null);
  const [viewMode, setViewMode] = useState('feed');
  const [showAssessment, setShowAssessment] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [showInterestPicker, setShowInterestPicker] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [atlasMappingResult, setAtlasMappingResult] = useState(null);
  const [mapTarget, setMapTarget] = useState(null);
  const [watchHistory, setWatchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('amplifai_watch_history') || '[]'); } catch { return []; }
  });
  const [personalizedMountain, setPersonalizedMountain] = useState(null);
  const [communityVision, setCommunityVision] = useState(null);

  useEffect(() => {
    const savedContext = localStorage.getItem('amplifai_user_context');
    if (savedContext) {
      const parsed = JSON.parse(savedContext);
      setUserContext(parsed);
      if (parsed.deep_interests && parsed.deep_interests.length > 0) {
        handleSearch('', { id: 'returning_user', context: parsed.interests }, parsed);
      }
    } else {
      // Bypassing InterestPicker to show Hero section immediately
      setShowInterestPicker(false);
      // No automatic handleSearch call here to prevent the "Analyzing..." screen on first land
    }
  }, []);

  const resetHome = () => {
    setCurrentFeed(null);
    setMarketInsights(null);
    setCurrentIntent(null);
    setError(null);
    setShowStudio(false);
    setShowExplore(false);
    setCommunityVision(null);
  };

  const handleSearch = async (query, persona, overrideContext = null, skipDisambiguation = false) => {
    if (!query && !userContext?.deep_interests?.length) return false;
    setLoading(true);
    setError(null);
    setCurrentFeed(null);
    setMarketInsights(null);
    setCurrentIntent(null);
    setSelectedPersona(persona);
    setCurrentQuery(query);
    setShowStudio(false);
    setCommunityVision(null);
    setViewMode('feed');

    const activeContext = overrideContext || userContext || { user_id: persona?.id || 'default', interests: persona?.context || [] };

    try {
      const response = await fetch(`${API_BASE_URL}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          user_context: activeContext,
          refinement: persona?.refinement || null
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      if (data.feed.length === 0) { setError("No videos found. Try a broader query."); return false; }
      else {
        setCurrentFeed(data.feed);
        setCurrentIntent(data.intent);
        // Track search as watch history for terrain personalisation
        if (query) {
          setWatchHistory(prev => {
            const updated = [query, ...prev.filter(q => q !== query)].slice(0, 30);
            localStorage.setItem('amplifai_watch_history', JSON.stringify(updated));
            return updated;
          });
        }
        return true;
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to Hyperbolic Engine. Check backend.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleShowOnMap = (domainId, topic = null) => {
    setMapTarget({ domainId, topic });
    setShowExplore(true);
    setShowStudio(false);
    setMarketInsights(null);
    setCommunityVision(null);
    // Note: currentFeed is kept so it might show below map if needed
  };

  const handlePersonalStepClick = async (stepName) => {
    if (!userContext) return;
    setLoading(true);
    setError(null);
    // We scroll down automatically after fetching
    try {
      const resp = await fetch(`${API_BASE_URL}/creator/community-vision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          community_name: stepName,
          quiz_context: {
            audience: userContext.audience || 'Target Audience',
            goal: userContext.goal || 'Creative Goal',
            style: userContext.style || 'Style/Format',
            tools: userContext.tools || 'Primary Tools',
            languages: userContext.languages || 'Languages'
          }
        })
      });
      if (!resp.ok) throw new Error('Failed to generate vision');
      const data = await resp.json();
      setCommunityVision(data);
      // Wait for state to update, then scroll
      setTimeout(() => {
        window.scrollTo({ top: window.innerHeight - 100, behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError("AI was unable to generate a blueprint for this community.");
    } finally {
      setLoading(false);
    }
  };



  const handleInterestComplete = (deepInterests) => {
    const newContext = {
      user_id: `user_${Date.now()}`,
      interests: [],
      deep_interests: deepInterests
    };
    setUserContext(newContext);
    localStorage.setItem('amplifai_user_context', JSON.stringify(newContext));
    setShowInterestPicker(false);
    handleSearch('', { id: newContext.user_id, context: [] }, newContext);
  };

  const loadMarketInsights = async () => {
    setFetchingInsights(true);
    setError(null);
    try {
      const userContext = { user_id: selectedPersona?.id || 'default', interests: selectedPersona?.context || [] };
      const response = await fetch(`${API_BASE_URL}/creator/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery, user_context: userContext }),
      });
      if (!response.ok) throw new Error('Failed to fetch insights');
      const data = await response.json();
      setMarketInsights(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load Market Insights.");
      setViewMode('feed');
    } finally {
      setFetchingInsights(false);
    }
  };

  const hasResults = currentFeed !== null || marketInsights !== null;

  return (
    <div className="min-h-screen bg-white text-devfolio-text-primary selection:bg-devfolio-blue/10 selection:text-devfolio-blue relative font-sans">

      {/* ═══════ NAV ═══════ */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetHome}>
          <div className="w-10 h-10 bg-devfolio-blue rounded-lg flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M5 8l7-5 7 5" /><path d="M5 16l7 5 7-5" /></svg>
          </div>
          <span className="text-2xl font-black tracking-tighter text-devfolio-text-primary">AmplifAI</span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-sm font-black text-devfolio-text-secondary uppercase tracking-widest">
          <span className={`${!showExplore && !showStudio ? 'text-devfolio-text-primary' : ''} hover:text-devfolio-blue cursor-pointer transition-colors`} onClick={resetHome}>Discover</span>
          <span className={`${showExplore ? 'text-devfolio-blue' : ''} hover:text-devfolio-blue cursor-pointer transition-colors`} onClick={() => { setShowExplore(true); setShowStudio(false); setCurrentFeed(null); setMarketInsights(null); }}>Explore</span>
          <span className={`${showStudio ? 'text-devfolio-text-primary' : ''} hover:text-devfolio-blue cursor-pointer transition-colors`} onClick={() => { setShowStudio(true); setShowExplore(false); }}>Studio</span>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={() => setShowStudio(!showStudio)}
            className="hidden sm:block text-devfolio-blue font-black text-xs uppercase tracking-widest hover:underline"
          >
            {showStudio ? "Back to Discover" : "Enter Studio"}
          </button>
          <button className="df-button-primary px-6 py-2.5 text-xs uppercase tracking-widest" onClick={() => {
            setPersonalizedMountain(null); // Clear previous peak on re-attempt
            setShowExplore(true);
            setShowAssessment(true);
          }}>
            Know Your Blue Ocean
          </button>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      {!hasResults && !showStudio && !showExplore && !loading && (
        <section className="relative pt-2 pb-24 px-6 max-w-7xl mx-auto">

          {/* SEARCH AT THE TOP */}
          <div className="max-w-3xl mx-auto text-center mb-8 animate-df-fade-in shadow-xl rounded-df bg-white/50 backdrop-blur-sm p-4 border border-devfolio-blue/10">
            <h2 className="text-2xl mb-4 font-black tracking-tight text-devfolio-text-primary">What are you building today?</h2>
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 animate-df-fade-in delay-100">
              <h1 className="text-6xl lg:text-[5.5rem] mb-10 leading-[1.1] font-black tracking-tighter">
                Redefining <span className="text-devfolio-blue">signal</span> <br className="hidden lg:block" /> for creators with <span className="relative inline-block">AI<span className="absolute -bottom-3 left-0 w-full h-3 bg-devfolio-green/20 rounded-full -z-10"></span></span>
              </h1>
              <p className="text-xl mb-12 max-w-xl text-devfolio-text-secondary leading-relaxed font-medium">
                Stop guessing. Start building. AmplifAI uses hyperbolic geometry to surface high-signal content gaps and market opportunities tailored to your niche.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 mb-16">
                <button className="df-button-secondary text-sm px-10 py-4 uppercase tracking-widest" onClick={() => setShowStudio(true)}>
                  Try Studio
                </button>
              </div>

              {/* Minimal Brand Strip */}
              <div className="flex flex-wrap gap-x-10 gap-y-4 text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-devfolio-blue"></span> Semantic NLP</span>
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-devfolio-green"></span> Blue Ocean Detection</span>
                <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-devfolio-yellow"></span> Content Planner</span>
              </div>
            </div>

            <div className="lg:col-span-5 relative animate-df-fade-in delay-200">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-devfolio-muted rounded-full opacity-40 blur-3xl -z-10"></div>
                <img src="/doodles/idea.png" alt="Idea" className="absolute -top-10 -right-10 w-56 h-56 object-contain animate-bounce" style={{ animationDuration: '7s' }} />
                <img src="/doodles/search.png" alt="Search" className="absolute -bottom-10 -left-10 w-48 h-48 object-contain animate-bounce" style={{ animationDuration: '9s', animationDelay: '1.5s' }} />
                <img src="/doodles/tools.png" alt="Tools" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 object-contain animate-pulse" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        {hasResults && !showStudio && !showExplore && (
          <div className="pt-12 pb-16 flex justify-center">
            <div className="w-full max-w-2xl">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        )}

        {showStudio && (
          <div className="animate-df-fade-in pt-12">
            <CreatorTools />
          </div>
        )}

        {showExplore && (
          <div className="animate-df-fade-in">
            <div style={{ height: 'calc(100vh - 80px)', marginTop: '-24px' }}>
              <ExploreTerrain
                watchHistory={watchHistory}
                atlasMappingResult={atlasMappingResult}
                onClearMapping={() => setAtlasMappingResult(null)}
                mapTarget={mapTarget}
                onClearTarget={() => setMapTarget(null)}
                onSearch={async (query, persona) => {
                  const ok = await handleSearch(query, persona, null, false);
                  if (ok) setShowExplore(false);
                  return ok;
                }}
                personalizedMountain={personalizedMountain}
                onPersonalStepClick={handlePersonalStepClick}
              />
            </div>
            {(currentFeed || communityVision) && viewMode === 'feed' && (
              <div className="mt-20 pt-10 border-t-4 border-devfolio-blue/10">
                <Feed
                  videos={currentFeed}
                  intent={currentIntent}
                  onShowOnMap={(video) => handleShowOnMap(currentIntent?.domain_id, currentIntent?.sub_culture)}
                  communityVision={communityVision}
                />
              </div>
            )}
          </div>
        )}

        {showAssessment && (
          <CreatorAssessment
            onClose={() => {
              setShowAssessment(false);
              // if they close manually without completing, we could optionally revert showExplore if no result
            }}
            onComplete={(placement, domainId, coordinates, personalizedName, mountainSteps, quizAnswers) => {
              // Ensure we use the hardcoded steps for the Personal Peak based on quiz results
              const primaryInterest = quizAnswers.interests?.[0] || 'Business';
              const hardcodedSteps = STATIC_MAP[primaryInterest] || STATIC_MAP['Business'];

              const peakData = {
                name: personalizedName,
                steps: hardcodedSteps,
                domainId: domainId // Base domain reference
              };
              setAtlasMappingResult({ placement, domainId, coordinates });
              setPersonalizedMountain(peakData);
              // [REMOVED] localStorage.setItem('amplifai_personalized_peak', JSON.stringify(peakData)); 
              // Peak is now transient per session

              // Store quiz answers in context for better AI blueprints
              const updatedContext = {
                ...userContext,
                ...quizAnswers,
                quiz: quizAnswers
              };
              setUserContext(updatedContext);
              localStorage.setItem('amplifai_user_context', JSON.stringify(updatedContext));

              setShowExplore(true); // already true, but explicit
              setShowStudio(false);
              setCurrentFeed(null);
              setMarketInsights(null);
              setShowAssessment(false);
            }}
          />
        )}

        {showInterestPicker && (
          <InterestPicker onComplete={handleInterestComplete} />
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-df-fade-in">
            <div className="w-16 h-16 border-[6px] border-devfolio-blue border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-2xl font-black mb-2">Analyzing Semantic Density...</h3>
              <p className="text-devfolio-text-secondary font-medium tracking-wide">Running real-time NLP on YouTube metadata</p>
            </div>
          </div>
        )}

        {fetchingInsights && (
          <div className="flex flex-col items-center justify-center py-40 space-y-8 animate-df-fade-in">
            <div className="w-16 h-16 border-[6px] border-devfolio-green border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-devfolio-green mb-2">Analyzing Market Gaps...</h3>
              <p className="text-devfolio-text-secondary font-medium tracking-wide">Finding blue ocean opportunities</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center py-16">
            <div className="bg-red-50 border-2 border-red-100 rounded-df px-8 py-5 flex items-center gap-5 animate-df-fade-in shadow-sm">
              <span className="text-red-500 text-3xl">⚠️</span>
              <p className="text-red-700 font-black text-lg">{error}</p>
            </div>
          </div>
        )}

        {!showStudio && (currentFeed) && (
          <div className="animate-df-fade-in">
            <div className="flex justify-center mb-16">
              <div className="flex bg-devfolio-muted rounded-df p-2 border border-gray-200 shadow-sm">
                <button onClick={() => setViewMode('feed')}
                  className={`px-8 py-2.5 rounded-df text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'feed' ? 'bg-white text-devfolio-blue shadow-md scale-[1.02]' : 'text-devfolio-text-secondary hover:text-devfolio-blue'}`}>
                  Standard Feed
                </button>
                <button onClick={() => setViewMode('3d')}
                  className={`px-8 py-2.5 rounded-df text-xs font-black uppercase tracking-widest transition-all ${viewMode === '3d' ? 'bg-white text-devfolio-blue shadow-md scale-[1.02]' : 'text-devfolio-text-secondary hover:text-devfolio-blue'}`}>
                  Video Space
                </button>
              </div>
            </div>
          </div>
        )}

        {!showStudio && !loading && !error && (currentFeed || communityVision) && viewMode === 'feed' && (
          <div className="animate-df-fade-in">
            <Feed
              videos={currentFeed || []}
              intent={currentIntent}
              onShowOnMap={(video) => handleShowOnMap(currentIntent?.domain_id, currentIntent?.sub_culture)}
              communityVision={communityVision}
            />
          </div>
        )}

        {!showStudio && !loading && !error && currentFeed && viewMode === '3d' && (
          <div className="animate-df-fade-in">
            <div className="bg-white border-2 border-gray-100 rounded-[3rem] overflow-hidden shadow-2xl h-[800px]">
              <HyperbolicSpace data={currentFeed} mode="videos" />
            </div>
          </div>
        )}

        {/* Market Insights sections removed */}
      </div>
    </div>
  );
}

export default App;
