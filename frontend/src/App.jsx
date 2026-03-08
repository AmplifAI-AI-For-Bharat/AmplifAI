import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import Feed from './components/Feed';
import HyperbolicSpace from './components/HyperbolicSpace';
import CreatorAssessment from './components/CreatorAssessment';
import CreatorTools from './components/CreatorTools';
import InterestPicker from './components/InterestPicker';
import ExploreTerrain from './components/ExploreTerrain';

const APP_NAME = 'AmplifAI';

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
  const [watchHistory, setWatchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('amplifai_watch_history') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const savedContext = localStorage.getItem('amplifai_user_context');
    if (savedContext) {
      const parsed = JSON.parse(savedContext);
      setUserContext(parsed);
      if (parsed.deep_interests && parsed.deep_interests.length > 0) {
        handleSearch('', { id: 'returning_user', context: parsed.interests }, parsed);
      }
    } else {
      setShowInterestPicker(true);
    }
  }, []);

  const resetHome = () => {
    setCurrentFeed(null);
    setMarketInsights(null);
    setCurrentIntent(null);
    setError(null);
    setShowStudio(false);
    setShowExplore(false);
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
    setViewMode('feed');

    const activeContext = overrideContext || userContext || { user_id: persona?.id || 'default', interests: persona?.context || [] };

    try {
      const response = await fetch('http://localhost:8000/feed', {
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
      const response = await fetch('http://localhost:8000/creator/insights', {
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
          <button className="df-button-primary px-6 py-2.5 text-xs uppercase tracking-widest" onClick={() => { setShowExplore(true); setShowAssessment(true); }}>
            Unlock Potential
          </button>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      {!hasResults && !showStudio && !showExplore && !loading && (
        <section className="relative pt-28 pb-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 animate-df-fade-in">
              <h1 className="text-6xl lg:text-[5.5rem] mb-10 leading-[1.1] font-black tracking-tighter">
                Redefining <span className="text-devfolio-blue">signal</span> <br className="hidden lg:block" /> for creators with <span className="relative inline-block">AI<span className="absolute -bottom-3 left-0 w-full h-3 bg-devfolio-green/20 rounded-full -z-10"></span></span>
              </h1>
              <p className="text-xl mb-12 max-w-xl text-devfolio-text-secondary leading-relaxed font-medium">
                Stop guessing. Start building. AmplifAI uses hyperbolic geometry to surface high-signal content gaps and market opportunities tailored to your niche.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 mb-16">
                <button className="df-button-primary text-sm px-10 py-4 uppercase tracking-widest" onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}>
                  Explore Opportunities
                </button>
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
                <img src="/src/assets/doodles/idea.png" alt="Idea" className="absolute -top-10 -right-10 w-56 h-56 object-contain animate-bounce" style={{ animationDuration: '7s' }} />
                <img src="/src/assets/doodles/search.png" alt="Search" className="absolute -bottom-10 -left-10 w-48 h-48 object-contain animate-bounce" style={{ animationDuration: '9s', animationDelay: '1.5s' }} />
                <img src="/src/assets/doodles/tools.png" alt="Tools" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 object-contain animate-pulse" />

                {/* Repositioned Swipe Down Hint - Beside Yellow Pencil (tools.png) */}
                <div className="absolute top-1/2 -right-32 -translate-y-1/2 hidden xl:flex flex-col items-center gap-2 animate-bounce">
                  <div className="px-4 py-2 bg-devfolio-yellow/10 border-2 border-devfolio-yellow/20 rounded-full text-devfolio-yellow text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-devfolio-yellow animate-pulse"></span>
                    Scroll down to search
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-devfolio-yellow/40">
                    <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
                  </svg>
                </div>

              </div>
            </div>
          </div>

          <div id="search-section" className="mt-40 max-w-3xl mx-auto text-center px-6">
            <h2 className="text-4xl mb-6 font-black tracking-tight">What are you building today?</h2>
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>
      )}

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        {hasResults && !showStudio && (
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
                onSearch={async (query, persona) => {
                  await handleSearch(query, persona, null, true);
                }}
              />
            </div>
            {currentFeed && viewMode === 'feed' && (
              <div className="mt-20 pt-10 border-t-4 border-devfolio-blue/10">
                <Feed videos={currentFeed} intent={currentIntent} />
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
            onComplete={(placement, domainId, coordinates) => {
              setAtlasMappingResult({ placement, domainId, coordinates });
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

        {!showStudio && !loading && !error && currentFeed && viewMode === 'feed' && (
          <div className="animate-df-fade-in">
            <Feed videos={currentFeed} intent={currentIntent} />
          </div>
        )}

        {!showStudio && !loading && !error && currentFeed && viewMode === '3d' && (
          <div className="animate-df-fade-in">
            <div className="df-card overflow-hidden">
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
