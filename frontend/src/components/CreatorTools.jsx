import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    PenLine, CalendarDays, FlaskConical, Target, Dna, TrendingUp,
    RefreshCw, Clock, Waves, FileText, Users, LayoutDashboard,
    Eye, Heart, Share2, ArrowUpRight, ArrowDownRight, Sparkles,
    BarChart3, Zap, Globe, ChevronRight, Plus, X, Play, Pause
} from 'lucide-react';

/* ── Constants ── */
const PLATFORMS = ['YouTube', 'Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Blog'];
const DAYS_W = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
const inp = "w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:border-violet-500/40 outline-none transition-colors";
const lbl = "block text-[10px] text-gray-500 uppercase tracking-[0.15em] font-semibold mb-2";

const CATS = [
    {
        name: 'DASHBOARD', tools: [
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, desc: 'Campaign analytics, goals, earning trends & performance at a glance' },
        ]
    },
    {
        name: 'CREATE', tools: [
            { id: 'script', label: 'Script Writer', icon: PenLine, desc: 'AI script generation with hook optimization & retention mapping' },
            { id: 'planner', label: 'Content Planner', icon: CalendarDays, desc: 'Multi-platform content calendar with AI scheduling intelligence' },
            { id: 'ab', label: 'A/B Title Lab', icon: FlaskConical, desc: 'Generate & rank title variations with predicted CTR' },
        ]
    },
    {
        name: 'OPTIMIZE', tools: [
            { id: 'seo', label: 'SEO Optimizer', icon: Target, desc: 'Research-grade title, tag & description optimization' },
            { id: 'dna', label: 'Content DNA', icon: Dna, desc: 'Deep structural analysis — hooks, emotional arcs, viral potential' },
            { id: 'predict', label: 'Engagement AI', icon: TrendingUp, desc: 'ML-based predictions for views, engagement & algorithm boost' },
        ]
    },
    {
        name: 'DISTRIBUTE', tools: [
            { id: 'repurpose', label: 'Repurposer', icon: RefreshCw, desc: 'Cross-platform content adaptation engine' },
            { id: 'scheduler', label: 'Smart Scheduler', icon: Clock, desc: 'Visual weekly calendar with optimal posting windows' },
            { id: 'trends', label: 'Trend Radar', icon: Waves, desc: 'Real-time trend detection & opportunity mapping' },
        ]
    },
    {
        name: 'ANALYZE', tools: [
            { id: 'summarize', label: 'Summarizer', icon: FileText, desc: 'Key insight extraction, topic segmentation & timestamps' },
            { id: 'audience', label: 'Audience Builder', icon: Users, desc: 'Data-driven persona generation with psychographics' },
        ]
    },
];

const pColor = (p) => ({
    YouTube: 'text-red-400 bg-red-500/10 border-red-500/20',
    Instagram: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    'Twitter/X': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    LinkedIn: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    TikTok: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    Blog: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
}[p] || 'text-gray-400 bg-gray-500/10 border-gray-500/20');

const sColor = (s) =>
    s === 'scheduled' ? 'text-violet-300 bg-violet-500/10 border-violet-500/20'
        : s === 'published' ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
            : 'text-gray-400 bg-white/[0.04] border-white/[0.08]';

/* ── Mini SVG Sparkline ── */
const Sparkline = ({ data, color = '#8b5cf6', h = 40, w = 120 }) => {
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(' ');
    return (
        <svg width={w} height={h} className="overflow-visible">
            <defs><linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${color.replace('#', '')})`} stroke="none" />
        </svg>
    );
};

/* ── Dashboard Overview Component ── */
const DashboardView = () => {
    const stats = [
        { label: 'Total Views', value: '174.6K', change: '+18%', up: true, icon: Eye, color: 'violet', data: [20, 40, 35, 60, 55, 70, 85, 90, 78, 95, 110, 120] },
        { label: 'Engagement', value: '26.8K', change: '+12%', up: true, icon: Heart, color: 'pink', data: [10, 15, 12, 22, 26, 20, 30, 28, 35, 32, 38, 42] },
        { label: 'Shares', value: '8.4K', change: '+24%', up: true, icon: Share2, color: 'blue', data: [5, 8, 6, 12, 10, 15, 14, 18, 20, 22, 25, 30] },
        { label: 'Growth Rate', value: '16.2%', change: '-2%', up: false, icon: TrendingUp, color: 'emerald', data: [18, 20, 19, 22, 21, 18, 17, 16, 18, 15, 14, 16] },
    ];

    const goals = [
        { label: 'Content Calendar', target: '30 posts', progress: 73, color: 'from-violet-500 to-indigo-500' },
        { label: 'Audience Growth', target: '10K followers', progress: 48, color: 'from-pink-500 to-rose-500' },
        { label: 'Engagement Rate', target: '5% avg', progress: 85, color: 'from-blue-500 to-cyan-500' },
        { label: 'SEO Score', target: '90+', progress: 62, color: 'from-emerald-500 to-teal-500' },
    ];

    const campaigns = [
        { name: 'Q1 Product Launch', platform: 'YouTube', status: 'active', views: '42.3K', engagement: '3.8K' },
        { name: 'Brand Awareness', platform: 'Instagram', status: 'active', views: '28.1K', engagement: '5.2K' },
        { name: 'Thought Leadership', platform: 'LinkedIn', status: 'scheduled', views: '—', engagement: '—' },
        { name: 'Community Build', platform: 'Twitter/X', status: 'completed', views: '15.7K', engagement: '2.1K' },
    ];

    const earningData = [12, 18, 15, 25, 22, 35, 30, 42, 38, 50, 45, 56];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="space-y-5">
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.map(s => (
                    <div key={s.label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 hover:border-white/[0.1] transition-all group">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-9 h-9 rounded-xl bg-${s.color}-500/10 flex items-center justify-center`}>
                                <s.icon size={16} className={`text-${s.color}-400`} />
                            </div>
                            <div className={`flex items-center gap-1 text-[11px] font-semibold ${s.up ? 'text-emerald-400' : 'text-red-400'}`}>
                                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {s.change}
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white mb-0.5">{s.value}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">{s.label}</div>
                        <Sparkline data={s.data} color={s.color === 'violet' ? '#8b5cf6' : s.color === 'pink' ? '#ec4899' : s.color === 'blue' ? '#3b82f6' : '#10b981'} />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* ── Earning ── */}
                <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between">
                    <div className="text-sm font-semibold text-white flex items-center gap-2"><BarChart3 size={14} className="text-violet-400" /> Your Earning</div>
                    <div className="text-3xl font-black text-violet-400">$56.80</div>
                </div>

                {/* ── Goals ── */}
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                    <div className="text-sm font-semibold text-white flex items-center gap-2 mb-4"><Zap size={14} className="text-yellow-400" /> Goals</div>
                    <div className="space-y-4">
                        {goals.map(g => (
                            <div key={g.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] text-gray-400 font-medium">{g.label}</span>
                                    <span className="text-[10px] text-gray-600">{g.progress}%</span>
                                </div>
                                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${g.color} transition-all`} style={{ width: `${g.progress}%` }} />
                                </div>
                                <div className="text-[9px] text-gray-600 mt-1">Target: {g.target}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Campaigns Table ── */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold text-white flex items-center gap-2"><Globe size={14} className="text-cyan-400" /> Campaigns</div>
                    <div className="text-[10px] text-gray-600 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1">Set a Google Analytics code for your products</div>
                </div>
                <div className="space-y-2">
                    {campaigns.map(c => (
                        <div key={c.name} className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 hover:border-white/[0.08] transition-all group">
                            <div className="flex-1 min-w-0">
                                <div className="text-[12px] text-white font-medium truncate">{c.name}</div>
                                <div className={`text-[10px] font-semibold mt-0.5 ${pColor(c.platform).split(' ')[0]}`}>{c.platform}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[12px] text-white font-semibold">{c.views}</div>
                                <div className="text-[9px] text-gray-600">views</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[12px] text-white font-semibold">{c.engagement}</div>
                                <div className="text-[9px] text-gray-600">engaged</div>
                            </div>
                            <div className={`text-[9px] font-bold px-2 py-1 rounded-full border ${c.status === 'active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                : c.status === 'scheduled' ? 'text-violet-400 bg-violet-500/10 border-violet-500/20'
                                    : 'text-gray-500 bg-white/[0.04] border-white/[0.06]'
                                }`}>{c.status}</div>
                            <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


/* ══════════════════════════════════════════ */
/*         MAIN CREATOR TOOLS COMPONENT       */
/* ══════════════════════════════════════════ */
const CreatorTools = () => {
    const [tool, setTool] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const [scriptP, setScriptP] = useState({ topic: '', angle: '' });
    const [plannerP, setPlannerP] = useState({ niche: '', platforms: ['YouTube', 'Twitter/X'], days: 7, tone: 'Professional' });
    const [abP, setAbP] = useState({ topic: '', platform: 'YouTube', count: 8 });
    const [seoP, setSeoP] = useState({ title: '', description: '', platform: 'YouTube', keywords: '' });
    const [dnaP, setDnaP] = useState({ transcript: '' });
    const [predictP, setPredictP] = useState({ topic: '', platform: 'YouTube', type: 'Long-form Video', length: '10 min' });
    const [repurposeP, setRepurposeP] = useState({ transcript: '', format: 'Twitter Thread' });
    const [trendP, setTrendP] = useState({ niche: '' });
    const [sumP, setSumP] = useState({ transcript: '' });
    const [audP, setAudP] = useState({ niche: '', contentType: 'Long-form Video', size: '1K-10K' });

    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ platform: 'YouTube', title: '', day: 'Mon', time: '9 AM', status: 'draft' });

    const toolMeta = CATS.flatMap(c => c.tools).find(t => t.id === tool);
    const ToolIcon = toolMeta?.icon || Sparkles;

    const handleGenerate = async () => {
        setLoading(true); setResult('');
        let endpoint = '/creator/tools/script', body = {};

        switch (tool) {
            case 'script': body = scriptP; break;
            case 'summarize': endpoint = '/creator/tools/summarize'; body = sumP; break;
            case 'repurpose': endpoint = '/creator/tools/repurpose'; body = repurposeP; break;
            case 'planner':
                body = { topic: `Create a detailed ${plannerP.days}-day social media content calendar for the niche: "${plannerP.niche}". Platforms: ${plannerP.platforms.join(', ')}. Tone: ${plannerP.tone}. For EACH day provide: Day number, Platform, Content Type (Reel/Post/Video/Story/Thread), Title/Hook, Caption snippet (2-3 lines), Hashtags (5), Best posting time. Format as a structured calendar.`, angle: `${plannerP.tone} content strategist` }; break;
            case 'ab':
                body = { topic: `A/B Title Testing Lab — Generate ${abP.count} alternative titles for "${abP.topic}" optimized for ${abP.platform}. For EACH title provide:\n1. The title\n2. Clickability Score (1-100)\n3. Emotional trigger (curiosity/fear/aspiration/urgency/controversy)\n4. SEO keyword density\n5. Predicted CTR range\n6. Best suited audience segment\nRank from highest to lowest predicted performance.`, angle: 'data-driven A/B testing expert' }; break;
            case 'seo':
                body = { topic: `SEO OPTIMIZATION REPORT for ${seoP.platform}:\nCurrent Title: "${seoP.title}"\nCurrent Description: "${seoP.description}"\n${seoP.keywords ? `Target Keywords: ${seoP.keywords}` : ''}\n\nProvide:\n1. OPTIMIZED TITLE (with power words, under 70 chars)\n2. OPTIMIZED DESCRIPTION (under 160 chars, with CTA)\n3. PRIMARY KEYWORDS (5) with search volume estimate\n4. SECONDARY KEYWORDS (10)\n5. HASHTAGS (15, mix of high & low competition)\n6. SEO SCORE: Current vs Optimized (1-100)\n7. READABILITY SCORE (Flesch-Kincaid)\n8. COMPETITOR KEYWORD GAPS\n9. BEST POSTING TIME for this content type\n10. THUMBNAIL TEXT SUGGESTIONS (3 options)`, angle: 'SEO research analyst' }; break;
            case 'dna':
                body = { topic: `CONTENT DNA DEEP ANALYSIS:\n\n"${dnaP.transcript.slice(0, 3000)}"\n\nProvide research-level breakdown:\n1. HOOK ANALYSIS: Hook type, effectiveness score (1-100), first-30-second retention prediction\n2. EMOTIONAL ARC: Map the journey, dominant emotion per section\n3. PACING ANALYSIS: Density per section, attention curve, ideal length\n4. ENGAGEMENT TRIGGERS: Moments that drive comments/shares/saves\n5. UNIQUENESS SCORE (1-100)\n6. VIRAL COEFFICIENT (1-100) with reasoning\n7. CONTENT GAPS: What top performers include\n8. IMPROVEMENT ROADMAP: Top 5 changes ranked by impact`, angle: 'content research scientist' }; break;
            case 'predict':
                body = { topic: `ENGAGEMENT PREDICTION MODEL:\nTopic: "${predictP.topic}"\nPlatform: ${predictP.platform}\nContent Type: ${predictP.type}\nLength: ${predictP.length}\n\nProvide ML-grade predictions:\n1. VIEW RANGE: Min—Max predicted views (80% confidence)\n2. ENGAGEMENT RATE: Predicted likes/comments/shares ratio\n3. ALGORITHM BOOST SCORE (1-100)\n4. AUDIENCE DEMOGRAPHICS: Age, gender, interests\n5. CONTENT-MARKET FIT (1-100)\n6. OPTIMAL POSTING WINDOW\n7. GROWTH IMPACT\n8. RISK FACTORS\n9. THUMBNAIL APPROACH\n10. 90-DAY TRAJECTORY`, angle: 'data science engagement analyst' }; break;
            case 'trends':
                body = { topic: `TREND RADAR ANALYSIS for niche: "${trendP.niche}"\n\nProvide comprehensive intelligence:\n1. TOP 5 EMERGING TRENDS with trajectory, opportunity window, competition\n2. CONTENT GAPS: High demand / low supply topics\n3. FIRST-MOVER OPPORTUNITIES about to break out\n4. SEASONAL PATTERNS (next 30-90 days)\n5. CROSS-PLATFORM MOMENTUM\n6. TREND RISK ASSESSMENT\n7. TOP 3 CONTENT PLAYS for this week`, angle: 'trend intelligence analyst' }; break;
            case 'audience':
                body = { topic: `AUDIENCE PERSONA BUILDER:\nNiche: "${audP.niche}"\nContent Type: ${audP.contentType}\nAudience Size: ${audP.size}\n\nBuild 3 detailed personas. For EACH:\n1. NAME & ARCHETYPE\n2. DEMOGRAPHICS: Age, gender, location, education, income\n3. PSYCHOGRAPHICS: Values, lifestyle, personality\n4. CONTENT PREFERENCES: Formats, length, tone, platforms\n5. PAIN POINTS: Top 3 problems\n6. DISCOVERY PATH\n7. ENGAGEMENT PATTERN\n8. CONVERSION TRIGGERS\n9. CONTENT HOOKS THAT WORK\n10. ANTI-PATTERNS`, angle: 'audience research psychologist' }; break;
            default: break;
        }

        try {
            const res = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
            });
            const data = await res.json();
            if (tool === 'summarize') setResult(JSON.stringify(data, null, 2));
            else if (tool === 'repurpose') setResult(data.content);
            else setResult(data.script);
        } catch (err) { setResult(`Error: ${err.message}`); }
        setLoading(false);
    };

    const addPost = () => { if (!newPost.title.trim()) return; setPosts(p => [...p, { ...newPost, id: Date.now() }]); setNewPost({ ...newPost, title: '' }); };
    const delPost = (id) => setPosts(p => p.filter(x => x.id !== id));
    const cycleStatus = (id) => setPosts(p => p.map(x => x.id === id ? { ...x, status: x.status === 'draft' ? 'scheduled' : x.status === 'scheduled' ? 'published' : 'draft' } : x));

    const PillSelect = ({ options, selected, onChange }) => (
        <div className="flex flex-wrap gap-2">
            {options.map(o => (
                <button key={o} onClick={() => onChange(o)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${(Array.isArray(selected) ? selected.includes(o) : selected === o)
                        ? 'bg-violet-600 text-white border-violet-500 shadow-lg shadow-violet-900/20'
                        : 'text-gray-500 bg-white/[0.03] border-white/[0.08] hover:text-gray-300'
                        }`}>{o}</button>
            ))}
        </div>
    );

    const renderInput = () => {
        switch (tool) {
            case 'script': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Topic</label><input className={inp} placeholder="e.g. Quantum Computing for beginners" value={scriptP.topic} onChange={e => setScriptP({ ...scriptP, topic: e.target.value })} /></div>
                    <div><label className={lbl}>Angle / Vibe</label><input className={inp} placeholder="e.g. Controversial, Deep Dive, Storytelling" value={scriptP.angle} onChange={e => setScriptP({ ...scriptP, angle: e.target.value })} /></div>
                </div>
            );
            case 'planner': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Your Niche</label><input className={inp} placeholder="e.g. AI Productivity, Fitness Tech" value={plannerP.niche} onChange={e => setPlannerP({ ...plannerP, niche: e.target.value })} /></div>
                    <div><label className={lbl}>Platforms</label>
                        <PillSelect options={PLATFORMS} selected={plannerP.platforms} onChange={p => setPlannerP(prev => ({ ...prev, platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p] }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Duration</label><select className={inp} value={plannerP.days} onChange={e => setPlannerP({ ...plannerP, days: +e.target.value })}><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option></select></div>
                        <div><label className={lbl}>Tone</label><select className={inp} value={plannerP.tone} onChange={e => setPlannerP({ ...plannerP, tone: e.target.value })}><option>Professional</option><option>Casual & Fun</option><option>Educational</option><option>Bold & Provocative</option><option>Storytelling</option></select></div>
                    </div>
                </div>
            );
            case 'ab': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Content Topic / Description</label><input className={inp} placeholder="e.g. How AI will replace 50% of jobs by 2030" value={abP.topic} onChange={e => setAbP({ ...abP, topic: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Platform</label><select className={inp} value={abP.platform} onChange={e => setAbP({ ...abP, platform: e.target.value })}>{PLATFORMS.map(p => <option key={p}>{p}</option>)}</select></div>
                        <div><label className={lbl}>Variations</label><select className={inp} value={abP.count} onChange={e => setAbP({ ...abP, count: +e.target.value })}><option value={5}>5</option><option value={8}>8</option><option value={12}>12</option></select></div>
                    </div>
                </div>
            );
            case 'seo': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Current Title</label><input className={inp} placeholder="Your video/post title" value={seoP.title} onChange={e => setSeoP({ ...seoP, title: e.target.value })} /></div>
                    <div><label className={lbl}>Description</label><textarea className={inp + " h-24 resize-none font-mono"} placeholder="Current description text..." value={seoP.description} onChange={e => setSeoP({ ...seoP, description: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Platform</label><select className={inp} value={seoP.platform} onChange={e => setSeoP({ ...seoP, platform: e.target.value })}>{PLATFORMS.map(p => <option key={p}>{p}</option>)}</select></div>
                        <div><label className={lbl}>Target Keywords</label><input className={inp} placeholder="comma-separated" value={seoP.keywords} onChange={e => setSeoP({ ...seoP, keywords: e.target.value })} /></div>
                    </div>
                </div>
            );
            case 'dna': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Content / Transcript to Analyze</label><textarea className={inp + " h-56 resize-none font-mono"} placeholder="Paste your video transcript, blog post, or any content here for deep structural analysis..." value={dnaP.transcript} onChange={e => setDnaP({ ...dnaP, transcript: e.target.value })} /></div>
                </div>
            );
            case 'predict': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Content Topic</label><input className={inp} placeholder="e.g. Building a SaaS with AI in 2024" value={predictP.topic} onChange={e => setPredictP({ ...predictP, topic: e.target.value })} /></div>
                    <div className="grid grid-cols-3 gap-3">
                        <div><label className={lbl}>Platform</label><select className={inp} value={predictP.platform} onChange={e => setPredictP({ ...predictP, platform: e.target.value })}>{PLATFORMS.map(p => <option key={p}>{p}</option>)}</select></div>
                        <div><label className={lbl}>Content Type</label><select className={inp} value={predictP.type} onChange={e => setPredictP({ ...predictP, type: e.target.value })}><option>Long-form Video</option><option>Short / Reel</option><option>Thread</option><option>Blog Post</option><option>Story</option><option>Carousel</option></select></div>
                        <div><label className={lbl}>Length</label><select className={inp} value={predictP.length} onChange={e => setPredictP({ ...predictP, length: e.target.value })}><option>Under 1 min</option><option>1-3 min</option><option>5 min</option><option>10 min</option><option>15+ min</option><option>30+ min</option></select></div>
                    </div>
                </div>
            );
            case 'repurpose': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Source Content</label><textarea className={inp + " h-48 resize-none font-mono"} placeholder="Paste video transcript or article..." value={repurposeP.transcript} onChange={e => setRepurposeP({ ...repurposeP, transcript: e.target.value })} /></div>
                    <div><label className={lbl}>Output Format</label><select className={inp} value={repurposeP.format} onChange={e => setRepurposeP({ ...repurposeP, format: e.target.value })}><option>Twitter Thread</option><option>LinkedIn Post</option><option>Instagram Caption</option><option>TikTok Script</option><option>YouTube Shorts Script</option><option>Blog Post</option><option>Newsletter</option><option>Reddit Post</option></select></div>
                </div>
            );
            case 'trends': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Your Niche / Industry</label><input className={inp} placeholder="e.g. AI Tools, Personal Finance, Game Dev" value={trendP.niche} onChange={e => setTrendP({ ...trendP, niche: e.target.value })} /></div>
                    <div className="bg-violet-500/5 border border-violet-500/10 rounded-xl p-4 space-y-2">
                        <div className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider flex items-center gap-1.5"><Waves size={12} /> Intelligence Report Includes</div>
                        <div className="text-[11px] text-gray-500 leading-relaxed space-y-1">
                            <div className="flex items-center gap-2"><ArrowUpRight size={10} className="text-emerald-500" /> Emerging trends with trajectory & windows</div>
                            <div className="flex items-center gap-2"><Target size={10} className="text-violet-400" /> Content gaps — high demand, low supply</div>
                            <div className="flex items-center gap-2"><Zap size={10} className="text-yellow-400" /> First-mover opportunities about to break</div>
                            <div className="flex items-center gap-2"><CalendarDays size={10} className="text-blue-400" /> Seasonal hooks for next 30–90 days</div>
                            <div className="flex items-center gap-2"><Globe size={10} className="text-cyan-400" /> Cross-platform momentum analysis</div>
                        </div>
                    </div>
                </div>
            );
            case 'summarize': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Content to Summarize</label><textarea className={inp + " h-56 resize-none font-mono"} placeholder="Paste video transcript, article, or long-form content..." value={sumP.transcript} onChange={e => setSumP({ ...sumP, transcript: e.target.value })} /></div>
                </div>
            );
            case 'audience': return (
                <div className="space-y-4">
                    <div><label className={lbl}>Your Niche</label><input className={inp} placeholder="e.g. Productivity Software, Indie Music" value={audP.niche} onChange={e => setAudP({ ...audP, niche: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={lbl}>Content Type</label><select className={inp} value={audP.contentType} onChange={e => setAudP({ ...audP, contentType: e.target.value })}><option>Long-form Video</option><option>Short-form / Reels</option><option>Podcasts</option><option>Blog / Newsletter</option><option>Social Posts</option></select></div>
                        <div><label className={lbl}>Audience Size</label><select className={inp} value={audP.size} onChange={e => setAudP({ ...audP, size: e.target.value })}><option>0-1K (Starting)</option><option>1K-10K (Growing)</option><option>10K-100K (Established)</option><option>100K+ (Scaled)</option></select></div>
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="text-white flex gap-6 min-h-[600px]">
            {/* ── SIDEBAR ── */}
            <aside className="w-52 shrink-0 space-y-5">
                <h2 className="text-lg font-bold px-3 mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-violet-400" /> <span className="text-white">Amplif</span><span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 font-black">AI</span> <span className="text-gray-500 font-medium text-sm">Studio</span>
                </h2>
                {CATS.map(cat => (
                    <div key={cat.name}>
                        <div className="text-[9px] text-gray-600 uppercase tracking-[0.2em] font-bold mb-1.5 px-3">{cat.name}</div>
                        {cat.tools.map(t => {
                            const Icon = t.icon;
                            return (
                                <button key={t.id} onClick={() => { setTool(t.id); setResult(''); }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium flex items-center gap-2.5 transition-all mb-0.5 ${tool === t.id
                                        ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                                        : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03] border border-transparent'
                                        }`}>
                                    <Icon size={14} className={tool === t.id ? 'text-violet-400' : 'text-gray-600'} />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </aside>

            {/* ── MAIN ── */}
            <div className="flex-1 min-w-0">
                {/* Tool Header */}
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-1">
                        <ToolIcon size={20} className="text-violet-400" />
                        <h3 className="text-lg font-bold text-white">{toolMeta?.label}</h3>
                    </div>
                    <p className="text-[12px] text-gray-500">{toolMeta?.desc}</p>
                </div>

                {/* ── DASHBOARD ── */}
                {tool === 'dashboard' && <DashboardView />}

                {/* ── SCHEDULER ── */}
                {tool === 'scheduler' && (
                    <div className="space-y-5">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5"><Plus size={12} /> Schedule Post</div>
                            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
                                <select className={inp} value={newPost.platform} onChange={e => setNewPost({ ...newPost, platform: e.target.value })}>
                                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                                </select>
                                <input className={inp + " col-span-2"} placeholder="Post title / hook..." value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })} onKeyDown={e => e.key === 'Enter' && addPost()} />
                                <select className={inp} value={newPost.day} onChange={e => setNewPost({ ...newPost, day: e.target.value })}>
                                    {DAYS_W.map(d => <option key={d}>{d}</option>)}
                                </select>
                                <select className={inp} value={newPost.time} onChange={e => setNewPost({ ...newPost, time: e.target.value })}>
                                    {TIMES.map(t => <option key={t}>{t}</option>)}
                                </select>
                                <button onClick={addPost} className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 transition-opacity">Add</button>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5"><CalendarDays size={12} /> Weekly View</div>
                            {posts.length === 0 ? (
                                <div className="text-center py-16 text-gray-700"><Clock size={28} className="mx-auto mb-2 text-gray-700" /><p className="text-sm">No posts scheduled yet</p></div>
                            ) : (
                                <div className="grid grid-cols-7 gap-2">
                                    {DAYS_W.map(day => (
                                        <div key={day} className="min-h-[140px]">
                                            <div className="text-[10px] text-gray-600 uppercase font-semibold mb-2 text-center">{day}</div>
                                            {posts.filter(p => p.day === day).map(p => (
                                                <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2 mb-1.5 group">
                                                    <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full inline-block border mb-1 ${pColor(p.platform)}`}>{p.platform}</div>
                                                    <div className="text-[11px] text-white font-medium truncate">{p.title}</div>
                                                    <div className="text-[10px] text-gray-600 mt-0.5">{p.time}</div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <button onClick={() => cycleStatus(p.id)} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${sColor(p.status)}`}>{p.status}</button>
                                                        <button onClick={() => delPost(p.id)} className="text-gray-700 hover:text-red-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {posts.length > 0 && (
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { l: 'Total', v: posts.length, Icon: BarChart3, c: 'violet' },
                                    { l: 'Scheduled', v: posts.filter(p => p.status === 'scheduled').length, Icon: Clock, c: 'emerald' },
                                    { l: 'Published', v: posts.filter(p => p.status === 'published').length, Icon: Play, c: 'pink' },
                                    { l: 'Platforms', v: [...new Set(posts.map(p => p.platform))].length, Icon: Globe, c: 'blue' },
                                ].map(s => (
                                    <div key={s.l} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
                                        <s.Icon size={14} className={`text-${s.c}-400 mx-auto mb-1`} />
                                        <div className={`text-xl font-black text-${s.c}-400`}>{s.v}</div>
                                        <div className="text-[10px] text-gray-600 mt-0.5">{s.l}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── AI TOOL VIEW ── */}
                {tool !== 'dashboard' && tool !== 'scheduler' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
                            {renderInput()}
                            <button onClick={handleGenerate} disabled={loading}
                                className={`mt-5 w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loading ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-violet-900/20'
                                    }`}>
                                {loading ? <><div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />Analyzing...</> : <>Run <span className="font-black">{toolMeta?.label}</span></>}
                            </button>
                        </div>

                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 min-h-[400px] max-h-[800px] overflow-y-auto">
                            <div className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-4 flex items-center gap-1.5"><Sparkles size={10} /> AI Output</div>
                            {result ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {typeof result === 'string' ? <ReactMarkdown>{result}</ReactMarkdown> : <pre className="whitespace-pre-wrap font-mono text-sm text-emerald-400">{result}</pre>}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-700 py-16">
                                    <ToolIcon size={32} className="mb-3 text-gray-700" />
                                    <p className="text-sm">Ready to {toolMeta?.label?.toLowerCase()}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorTools;
