import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import Feed from './components/Feed';
import HyperbolicSpace from './components/HyperbolicSpace';
import CreatorAssessment from './components/CreatorAssessment';
import CreatorTools from './components/CreatorTools';

/* ── SVG Wave Paths ── */
const WAVE = "M 20,150 C 60,30 110,30 150,150 C 190,270 230,270 270,150 C 310,30 350,30 390,150 C 430,270 470,270 510,150 C 535,80 555,120 570,140";
const WAVE_HL = "M 20,142 C 60,26 110,26 150,142 C 190,258 230,258 270,142 C 310,26 350,26 390,142 C 430,258 470,258 510,142 C 535,76 555,116 570,136";
const APP_NAME = 'AmplifAI';

/* ── 3D Wave Component ── */
const HyperbolicWave = () => (
  <div className="relative w-full max-w-[560px] h-[320px] mx-auto wave-wrap">
    <svg viewBox="0 0 580 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="25%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="75%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="wg2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="glow-sm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Deep glow layer */}
      <path d={WAVE} stroke="url(#wg2)" strokeWidth="65" fill="none"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" opacity="0.35" />

      {/* Mid glow */}
      <path d={WAVE} stroke="url(#wg)" strokeWidth="48" fill="none"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-sm)" opacity="0.5" />

      {/* Main body */}
      <path d={WAVE} stroke="url(#wg)" strokeWidth="32" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Specular highlight */}
      <path d={WAVE_HL} stroke="rgba(255,255,255,0.18)" strokeWidth="10" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Top highlight shimmer */}
      <path d={WAVE_HL} stroke="rgba(255,255,255,0.06)" strokeWidth="22" fill="none"
        strokeLinecap="round" strokeLinejoin="round" />

      {/* Connection lines */}
      <line x1="65" y1="248" x2="200" y2="260" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
      <circle cx="200" cy="260" r="4" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
      <circle cx="65" cy="248" r="3" fill="rgba(139,92,246,0.3)" />

      <line x1="480" y1="60" x2="370" y2="42" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
      <circle cx="370" cy="42" r="4" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
      <circle cx="480" cy="60" r="3" fill="rgba(139,92,246,0.3)" />
    </svg>

    {/* Decorative orbs */}
    <div className="deco-orb deco-orb-1" />
    <div className="deco-orb deco-orb-2" />
    <div className="deco-orb deco-orb-3" />
    <div className="deco-orb deco-orb-4" />

    {/* Left Feature Card */}
    <div className="absolute bottom-[5%] left-[-8%] z-20 feature-card-float">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/20 flex items-center justify-center border border-violet-500/20">
          <span className="text-base">📊</span>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-white leading-tight">Semantic</div>
          <div className="text-[11px] font-semibold text-white leading-tight">Density</div>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-violet-400 flex items-center gap-1 cursor-pointer hover:text-violet-300">
        View <span className="text-[8px]">⊕</span>
      </div>
    </div>

    {/* Right Feature Card */}
    <div className="absolute top-[10%] right-[-10%] z-20 feature-card-float">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/30 to-blue-600/20 flex items-center justify-center border border-indigo-500/20">
          <span className="text-base">🧭</span>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-white leading-tight">Blue Ocean</div>
          <div className="text-[11px] font-semibold text-white leading-tight">Detection</div>
        </div>
      </div>
    </div>
  </div>
);

/* ── Main App ── */
function App() {
  const [currentFeed, setCurrentFeed] = useState(null);
  const [currentIntent, setCurrentIntent] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard');
  const [isCreatorMode, setCreatorMode] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);

  useEffect(() => {
    setCurrentFeed(null);
    setCurrentIntent(null);
    setError(null);
    setShowStudio(false);
  }, [isCreatorMode]);

  const handleSearch = async (query, persona) => {
    setLoading(true);
    setError(null);
    setCurrentFeed(null);
    setCurrentIntent(null);
    setSelectedPersona(persona);
    setShowStudio(false);
    const endpoint = isCreatorMode ? 'http://localhost:8000/creator/insights' : 'http://localhost:8000/feed';
    try {
      const userContext = { user_id: persona.id, interests: persona.context || [] };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, user_context: userContext }),
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      if (isCreatorMode) {
        setCurrentFeed(data);
      } else {
        if (data.feed.length === 0) setError("No videos found. Try a broader query.");
        else { setCurrentFeed(data.feed); setCurrentIntent(data.intent); }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to Hyperbolic Engine. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const hasResults = currentFeed !== null;

  return (
    <div className="min-h-screen bg-[#0a0118] text-gray-100 selection:bg-violet-900/50 selection:text-white relative">

      {/* ═══════ NAV ═══════ */}
      <nav className="sticky top-0 z-50 px-8 py-4 flex items-center justify-between bg-[#0a0118]/70 backdrop-blur-2xl border-b border-white/[0.03]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M5 8l7-5 7 5" /><path d="M5 16l7 5 7-5" /></svg>
          </div>
          <span className="text-[16px] font-bold tracking-tight"><span className="text-white">Amplif</span><span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 font-black">AI</span></span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-[13px] text-gray-500">
          <span className="text-white cursor-pointer">Home</span>
          <span className="hover:text-gray-300 cursor-pointer transition-colors"
            onClick={() => { setCreatorMode(false); setCurrentFeed(null); }}>Consumer</span>
          <span className="hover:text-gray-300 cursor-pointer transition-colors"
            onClick={() => setCreatorMode(true)}>Creator</span>
          <span className="hover:text-gray-300 cursor-pointer transition-colors flex items-center gap-1"
            onClick={() => { setCreatorMode(true); setShowStudio(true); }}>Tools <span className="text-[10px]">↗</span></span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Mode Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            <div className={`w-1.5 h-1.5 rounded-full ${isCreatorMode ? 'bg-violet-400' : 'bg-emerald-400'}`} />
            <span className="text-[10px] text-gray-500 font-medium">{isCreatorMode ? 'CREATOR' : 'CONSUMER'}</span>
          </div>

          {isCreatorMode && (
            <button
              onClick={() => setShowStudio(!showStudio)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-all ${showStudio
                ? 'bg-pink-600 text-white glow-pink'
                : 'bg-white/[0.06] text-gray-300 border border-white/[0.08] hover:border-violet-500/30'
                }`}
            >
              {showStudio ? '✕ Studio' : 'AI Studio'}
            </button>
          )}

          <button className="px-4 py-1.5 rounded-full text-[11px] font-medium bg-white/[0.06] text-gray-300 border border-white/[0.08] hover:bg-white/[0.1] transition-all"
            onClick={() => setShowAssessment(true)}>
            Login
          </button>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      {!hasResults && !showStudio && !loading && (
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 pt-16 pb-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[70vh]">

            {/* Left: Text */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h1 className="text-[3.2rem] lg:text-[3.8rem] font-bold leading-[1.08] text-white mb-6 tracking-tight">
                Supercharge Your{' '}
                <br className="hidden lg:block" />
                Content Discovery{' '}
                <br className="hidden lg:block" />
                With AI That{' '}
                <br className="hidden lg:block" />
                <span className="text-gray-500">Works Like a Charm</span>
              </h1>

              <div className="flex gap-3 mb-10">
                <button
                  onClick={() => setCreatorMode(true)}
                  className="px-6 py-2.5 rounded-full text-sm font-medium border border-white/20 text-white hover:bg-white/5 transition-all"
                >
                  Get Started
                </button>
                <button
                  onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-2.5 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Learn More
                </button>
              </div>

              <p className="text-[13px] text-gray-500 max-w-sm leading-relaxed">
                Goodbye content fatigue. Our AI uses <span className="text-gray-300">hyperbolic geometry</span> to surface high-signal content, plan your social calendar, and drive smarter creator decisions.
              </p>
            </div>

            {/* Right: 3D Wave */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <HyperbolicWave />
            </div>
          </div>

          {/* ── Brand / Feature Strip ── */}
          <div className="brand-strip py-6 mt-4">
            <div className="max-w-5xl mx-auto flex items-center justify-center gap-8 text-gray-600 text-[12px] tracking-[0.15em] font-medium overflow-hidden flex-wrap">
              <span className="opacity-50">SEMANTIC NLP</span>
              <span className="opacity-20">|</span>
              <span className="opacity-50">CONTENT PLANNER</span>
              <span className="opacity-20">|</span>
              <span className="opacity-50">SCHEDULER</span>
              <span className="opacity-20">|</span>
              <span className="opacity-50">BEDROCK AI</span>
              <span className="opacity-20">|</span>
              <span className="opacity-50">AMPLIFAI ENGINE</span>
              <span className="opacity-20">|</span>
              <span className="opacity-50">BLUE OCEAN</span>
            </div>
          </div>

          {/* ── Search Section ── */}
          <div id="search-section" className="max-w-2xl mx-auto px-8 pt-14 pb-16">
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>
      )}

      {/* ═══════ MAIN CONTENT ═══════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 pb-20">

        {/* Search bar when results exist */}
        {hasResults && !showStudio && (
          <div className="pt-6 mb-4">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}

        {/* Studio */}
        {showStudio && (
          <div className="animate-fade-in-up pt-6">
            <CreatorTools />
          </div>
        )}

        {/* Assessment */}
        {showAssessment && (
          <CreatorAssessment
            onClose={() => setShowAssessment(false)}
            onComplete={(niche) => handleSearch(niche, { id: 'assessment_user', context: [] })}
          />
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-28">
            <div className="glass-card px-8 py-5 flex items-center gap-4 animate-fade-in-up">
              <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <div className="text-sm font-medium text-white">Analyzing Semantic Density...</div>
                <div className="text-xs text-gray-600 mt-0.5">Running real-time NLP on YouTube metadata</div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center py-12">
            <div className="glass-card px-6 py-4 border-red-500/20 flex items-center gap-3 animate-fade-in-up">
              <span className="text-red-400">⚠</span>
              <span className="text-red-300/80 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* ── Creator Market Gap Dashboard ── */}
        {!showStudio && currentFeed && currentFeed.market_gap_score !== undefined && isCreatorMode && viewMode === 'dashboard' && (
          <div className="animate-fade-in-up mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[11px] text-violet-400/60 uppercase tracking-widest font-semibold">Market Analysis</p>
                <h2 className="text-2xl font-bold text-white mt-1">{currentFeed.topic}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger">
              <div className="stat-card animate-fade-in-up">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Opportunity</div>
                <div className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {currentFeed.market_gap_score}
                </div>
                <div className="text-[10px] text-gray-600 mt-1">Market Gap Score</div>
              </div>
              <div className="stat-card animate-fade-in-up">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Strategy</div>
                <div className="text-lg font-bold text-white">{currentFeed.strategy}</div>
                <div className="text-xs text-gray-600 mt-1">Avg Views: <span className="text-gray-400">{currentFeed.avg_views}</span></div>
              </div>
              <div className="stat-card animate-fade-in-up">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Quality Density</div>
                <div className="text-lg font-bold text-white">{currentFeed.avg_quality_density}<span className="text-gray-600 text-sm">/100</span></div>
                <div className="mt-3 w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full" style={{ width: `${currentFeed.avg_quality_density}%`, transition: 'width 1s' }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {currentFeed.opportunities.map((opp, i) => (
                <div key={i} className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    <span className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">Target</span>
                  </div>
                  <div className="text-sm text-white font-medium mb-1">"{opp.target_video}"</div>
                  <div className="text-xs text-gray-600">{opp.reason}</div>
                </div>
              ))}
            </div>

            {currentFeed.sub_niches && currentFeed.sub_niches.length > 0 && (
              <>
                <div className="gradient-line my-6" />
                <h3 className="text-sm font-semibold text-indigo-400 mb-4">🌊 Blue Ocean Sub-Niches</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentFeed.sub_niches.map((sub, idx) => (
                    <button key={idx}
                      onClick={() => handleSearch(sub.topic, selectedPersona || { id: 'default', context: [] })}
                      className="glass-card p-4 text-left group w-full">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-white text-sm font-semibold">{sub.topic}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sub.market_gap_score > 70 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
                          {sub.market_gap_score}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">{sub.strategy}</div>
                      <span className="text-[10px] text-gray-700 group-hover:text-violet-400 transition-colors">Explore →</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* View Toggle (Creator) */}
        {!showStudio && currentFeed && isCreatorMode && (
          <div className="animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="flex bg-white/[0.03] rounded-full p-1 border border-white/[0.05]">
                <button onClick={() => setViewMode('dashboard')}
                  className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${viewMode === 'dashboard' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-gray-500 hover:text-gray-300'}`}>
                  📊 Dashboard
                </button>
                <button onClick={() => setViewMode('3d')}
                  className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${viewMode === '3d' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-gray-500 hover:text-gray-300'}`}>
                  🔮 Niche Galaxy
                </button>
              </div>
            </div>
            {viewMode === '3d' && (
              <div className="glass-card overflow-hidden rounded-2xl">
                <HyperbolicSpace data={[currentFeed, ...(currentFeed.sub_niches || [])]} mode="niches" />
              </div>
            )}
          </div>
        )}

        {/* Consumer Results */}
        {!showStudio && !loading && !error && currentFeed && Array.isArray(currentFeed) && !isCreatorMode && (
          <div className="animate-fade-in-up">
            <div className="flex justify-center mb-6">
              <div className="flex bg-white/[0.03] rounded-full p-1 border border-white/[0.05]">
                <button onClick={() => setViewMode('3d')}
                  className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${viewMode === '3d' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-gray-500 hover:text-gray-300'}`}>
                  🔮 3D Hyperspace
                </button>
                <button onClick={() => setViewMode('list')}
                  className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${viewMode === 'list' ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30' : 'text-gray-500 hover:text-gray-300'}`}>
                  📜 Standard Feed
                </button>
              </div>
            </div>
            {viewMode === '3d' ? (
              <div className="glass-card overflow-hidden rounded-2xl">
                <HyperbolicSpace data={currentFeed} mode="videos" />
              </div>
            ) : (
              <Feed videos={currentFeed} intent={currentIntent} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
