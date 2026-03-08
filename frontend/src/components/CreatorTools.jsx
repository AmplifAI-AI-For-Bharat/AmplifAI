import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
    PenLine, CalendarDays, FlaskConical, TrendingUp,
    LayoutDashboard, Eye, Heart, Users, Clock,
    ArrowUpRight, ArrowDownRight, Sparkles,
    BarChart3, Lightbulb, Activity,
    MessageSquare, ArrowRight, AlertCircle,
    Search, Dna, RefreshCw, Radar, FileText
} from 'lucide-react';

const API = 'http://localhost:8000';
const inp = "w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-devfolio-text-primary focus:border-devfolio-blue focus:ring-4 focus:ring-devfolio-blue/5 outline-none transition-all placeholder:text-gray-300 font-medium font-sans";
const lbl = "block text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black mb-2 px-1";

/* ── Tool Categories ── */
// Kept only essential MVP tools per user feedback, marked others as Coming Soon
const CATS = [
    { name: 'DASHBOARD', tools: [{ id: 'dashboard', label: 'Overview', icon: LayoutDashboard, desc: 'Analytics, community signals & content opportunities' }] },
    {
        name: 'CREATE', tools: [
            { id: 'script', label: 'Script Writer', icon: PenLine, desc: 'AI hooks & retention mapping' },
            { id: 'planner', label: 'Content Planner', icon: CalendarDays, desc: 'Multi-platform scheduling intelligence' },
            { id: 'ab', label: 'A/B Title Lab', icon: FlaskConical, desc: 'CTR prediction & variation' },
            { id: 'predict', label: 'Engagement Insights', icon: TrendingUp, desc: 'ML-based performance predictions' },
        ]
    },
    {
        name: 'OPTIMIZE & SCALE', tools: [
            { id: 'seo', label: 'SEO Optimizer', icon: Search, desc: 'Rank mapping & keyword strategy' },
            { id: 'dna', label: 'Content DNA', icon: Dna, desc: 'Format deconstruction' },
            { id: 'repurpose', label: 'Repurposer', icon: RefreshCw, desc: 'Cross-platform adaptation' },
            { id: 'radar', label: 'Trend Radar', icon: Radar, desc: 'Early-signal anomaly detection' },
            { id: 'summary', label: 'Summarizer', icon: FileText, desc: 'Condense long-form material' },
            { id: 'audience', label: 'Audience Builder', icon: Users, desc: 'Community growth blueprints' },
        ]
    }
];

const PLATFORMS = ['YouTube', 'Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Blog'];

const signalColorMap = {
    red: 'bg-red-50 text-red-500', yellow: 'bg-yellow-50 text-yellow-500',
    blue: 'bg-blue-50 text-blue-500', purple: 'bg-purple-50 text-purple-500',
};

/* ── Skeleton ── */
const Skeleton = ({ className = '' }) => (
    <div className={`bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse rounded-xl ${className}`} />
);

/* ── Sparkline ── */
const Sparkline = ({ data = [], color = '#3770FF', h = 40, w = 120 }) => {
    if (!data.length) return <Skeleton className="h-10 w-32" />;
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(' ');
    return (
        <svg width={w} height={h} className="overflow-visible">
            <defs><linearGradient id={`sg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient></defs>
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M0,${h} L${pts} L${w},${h} Z`} fill={`url(#sg-${color.slice(1)})`} />
        </svg>
    );
};

/* ── Stat Card ── */
const StatCard = ({ stat, loading }) => {
    const Icon = stat.icon;
    if (loading) return <div className="df-card p-6 flex-1"><Skeleton className="h-32 w-full" /></div>;
    return (
        <div className="df-card p-6 group hover:border-devfolio-blue/50 transition-all flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-devfolio-muted flex items-center justify-center text-devfolio-blue group-hover:bg-devfolio-blue group-hover:text-white transition-colors">
                    <Icon size={18} />
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-widest ${stat.up ? 'text-devfolio-green' : 'text-red-500'}`}>
                    {stat.up ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                    {stat.change}
                </div>
            </div>
            <div className="text-3xl font-black text-devfolio-text-primary mb-0.5 tracking-tighter">{stat.value}</div>
            <div className="text-[10px] text-devfolio-text-secondary uppercase tracking-[0.2em] font-black mb-4">{stat.label}</div>
            <Sparkline data={stat.sparkline} color={stat.color} />
        </div>
    );
};

/* ── Community Signal Card ── */
const SignalCard = ({ emoji, type, text, reactions, color }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-gray-50 hover:border-devfolio-blue/20 transition-all">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${signalColorMap[color] || 'bg-gray-50 text-gray-500'}`}>{emoji}</div>
        <div className="flex-1 min-w-0">
            <div className={`text-[9px] font-black uppercase tracking-widest mb-1 ${(signalColorMap[color] || '').replace('bg-', 'text-').split(' ')[1] || 'text-gray-500'}`}>{type}</div>
            <p className="text-xs font-medium text-devfolio-text-primary leading-relaxed line-clamp-2">{text}</p>
        </div>
        <div className="shrink-0 text-right">
            <div className="text-lg font-black text-devfolio-text-primary">{reactions}</div>
            <div className="text-[8px] text-gray-400 uppercase tracking-widest">reactions</div>
        </div>
    </div>
);

/* ── Opportunity Card ── */
const OpportunityCard = ({ rank, title, why, tag, setTool, setScriptTopic }) => {
    return (
        <div className="df-card p-7 flex flex-col group hover:border-devfolio-blue/40 hover:shadow-xl transition-all h-full">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-devfolio-muted flex items-center justify-center text-xs font-black text-devfolio-blue">#{rank}</div>
                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest bg-blue-50 border-blue-100 text-devfolio-blue">{tag}</span>
                </div>
            </div>
            <h4 className="text-base font-black text-devfolio-text-primary mb-3 leading-snug group-hover:text-devfolio-blue transition-colors flex-1">"{title}"</h4>
            <p className="text-xs font-medium text-devfolio-text-secondary leading-relaxed mb-6">{why}</p>

            <div className="flex gap-2 mt-auto">
                <button
                    onClick={() => { setTool('script'); setScriptTopic(title); }}
                    className="flex-1 py-2.5 rounded-xl bg-devfolio-blue text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                >
                    Explore Idea <ArrowRight size={12} />
                </button>
                <button
                    onClick={() => alert(`Opening Atlas to view the community for "${title}"...`)}
                    className="flex-1 py-2.5 rounded-xl bg-devfolio-muted text-devfolio-text-secondary border border-gray-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                    View in Atlas
                </button>
            </div>
        </div>
    );
};

/* ── API Hook ── */
const useAPI = (fetchFn, deps = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const result = await fetchFn();
            setData(result);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, deps); // eslint-disable-line

    useEffect(() => { load(); }, [load]);
    return { data, loading, error, refetch: load };
};

/* ═══════════════════════════════════════════════════════
   DASHBOARD VIEW — Central MVP feature overview
═══════════════════════════════════════════════════════ */
const DashboardView = ({ setTool, setScriptTopic }) => {
    const [activeTab, setActiveTab] = useState('opportunities');

    const { data: growthData, loading: gLoading } = useAPI(() =>
        fetch(`${API}/creator/analytics/growth`).then(r => r.json()).then(r => r.data)
    );
    const { data: communityData, loading: cLoading } = useAPI(() =>
        fetch(`${API}/creator/analytics/community`).then(r => r.json()).then(r => r.data)
    );
    const { data: oppData, loading: oLoading } = useAPI(() =>
        fetch(`${API}/creator/analytics/opportunities`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
        }).then(r => r.json()).then(r => r.data)
    );

    const statDefs = [
        { key: 'total_views', label: 'Total Views', icon: Eye, color: '#3770FF' },
        { key: 'engagement_rate', label: 'Engagement Rate', icon: Heart, color: '#F178B6' },
        { key: 'subscriber_growth', label: 'Subscriber Growth', icon: Users, color: '#27C299' },
        { key: 'avg_watch_time', label: 'Avg Watch Time', icon: Clock, color: '#F9B233' },
    ];

    const stats = statDefs.map(d => ({
        ...d,
        ...(growthData?.[d.key] || { value: '—', change: '—', up: true, sparkline: [] })
    }));

    const tabs = [
        { id: 'opportunities', label: 'Opportunities', icon: Lightbulb },
        { id: 'community', label: 'Community', icon: MessageSquare },
        { id: 'overview', label: 'Growth', icon: Activity },
    ];

    return (
        <div className="space-y-6 animate-df-fade-in">
            {/* Tab Bar */}
            <div className="flex gap-2 p-1.5 bg-devfolio-muted rounded-2xl border border-gray-100 w-fit">
                {tabs.map(t => {
                    const Icon = t.icon;
                    return (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === t.id
                                ? 'bg-white shadow-md text-devfolio-blue' : 'text-gray-400 hover:text-devfolio-blue'}`}>
                            <Icon size={13} />{t.label}
                        </button>
                    );
                })}
            </div>

            {/* ═══ OPPORTUNITIES TAB ═══ */}
            {activeTab === 'opportunities' && (
                <div className="animate-df-fade-in space-y-6">
                    {/* Simplified AI Banner */}
                    <div className="df-card p-8 bg-gradient-to-br from-white to-blue-50/30 border-t-[6px] border-t-devfolio-blue">
                        <div className="flex items-start justify-between gap-6">
                            <div>
                                <div className="text-[10px] font-black text-devfolio-blue uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                    <Lightbulb size={14} className="fill-devfolio-blue" /> AI Opportunity Detection
                                </div>
                                <p className="text-sm font-medium text-devfolio-text-secondary max-w-xl">
                                    Opportunity detection mapping based on community demand and content supply.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Opportunity Cards */}
                    {oLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full" />)}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(oppData?.opportunities || []).slice(0, 3).map(o => (
                                <OpportunityCard
                                    key={o.rank}
                                    {...o}
                                    setTool={setTool}
                                    setScriptTopic={setScriptTopic}
                                />
                            ))}
                        </div>
                    )}

                    {/* Simplified Supply vs Demand Visualization */}
                    <div className="df-card p-8">
                        <div className="text-[10px] font-black text-devfolio-text-primary uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <BarChart3 size={14} className="text-devfolio-green" /> Niche Supply vs. Demand
                        </div>
                        {oLoading ? <div className="space-y-5">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div> : (
                            <div className="space-y-4">
                                {(oppData?.supply_demand || []).map(row => (
                                    <div key={row.topic} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-devfolio-blue/20 transition-all bg-white">
                                        <span className="text-sm font-black text-devfolio-text-primary">{row.topic}</span>
                                        <div className="flex gap-3">
                                            {row.supply < 40 ? (
                                                <span className="text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest bg-blue-50 text-devfolio-blue">Low Supply</span>
                                            ) : (
                                                <span className="text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest bg-gray-50 text-gray-500">High Supply</span>
                                            )}
                                            {row.demand > 60 ? (
                                                <span className="text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest bg-green-50 text-green-600">High Demand</span>
                                            ) : (
                                                <span className="text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest bg-gray-50 text-gray-500">Low Demand</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ COMMUNITY TAB ═══ */}
            {activeTab === 'community' && (
                <div className="animate-df-fade-in space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Sentiment */}
                        <div className="df-card p-8 lg:col-span-1">
                            <div className="text-[10px] font-black text-devfolio-text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <MessageSquare size={14} className="text-devfolio-blue" /> Audience Sentiment
                            </div>
                            {cLoading ? <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div> : (
                                <div className="space-y-4">
                                    {[
                                        { label: 'Positive', pct: communityData?.sentiment?.positive || 0, color: 'bg-devfolio-green', emoji: '😍' },
                                        { label: 'Questions', pct: communityData?.sentiment?.questions || 0, color: 'bg-devfolio-blue', emoji: '🤔' },
                                        { label: 'Confusion', pct: communityData?.sentiment?.confusion || 0, color: 'bg-red-400', emoji: '😤' },
                                    ].map(s => (
                                        <div key={s.label}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-black text-devfolio-text-primary flex items-center gap-1.5">{s.emoji} {s.label}</span>
                                                <span className="text-xs font-black text-devfolio-blue">{s.pct}%</span>
                                            </div>
                                            <div className="h-2.5 bg-devfolio-muted rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%`, transition: 'width 1.2s ease' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Signals Feed */}
                        <div className="df-card p-8 lg:col-span-2">
                            <div className="text-[10px] font-black text-devfolio-text-primary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Activity size={14} className="text-devfolio-yellow fill-devfolio-yellow" /> High-Signal Community Activity
                            </div>
                            {cLoading ? <div className="space-y-3">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div> : (
                                <div className="space-y-3">
                                    {(communityData?.signals || []).map((s, i) => <SignalCard key={i} {...s} />)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ GROWTH TAB ═══ */}
            {activeTab === 'overview' && (
                <div className="space-y-6 animate-df-fade-in">
                    {/* Stats */}
                    <div className="flex flex-wrap gap-5">
                        {stats.map(s => <StatCard key={s.key} stat={s} loading={gLoading} />)}
                    </div>
                </div>
            )}
        </div>
    );
};


/* ══════════════════════════════════════════════════════════
   CREATOR TOOLS — Main Component
══════════════════════════════════════════════════════════ */
const CreatorTools = () => {
    const [tool, setTool] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    // Tools State
    const [scriptP, setScriptP] = useState({ topic: '', angle: '' });
    const [plannerP, setPlannerP] = useState({ niche: '', platforms: ['YouTube', 'Twitter/X'], days: 7, tone: 'Professional' });
    const [abP, setAbP] = useState({ topic: '', platform: 'YouTube', count: 8 });
    const [seoP, setSeoP] = useState({ topic: '' });
    const [dnaP, setDnaP] = useState({ example: '' });
    const [repurposeP, setRepurposeP] = useState({ transcript: '', format: 'Twitter Thread' });
    const [summaryP, setSummaryP] = useState({ transcript: '' });

    const toolMeta = CATS.flatMap(c => c.tools).find(t => t.id === tool);
    const ToolIcon = toolMeta?.icon || Sparkles;

    const handleGenerate = async () => {
        setLoading(true); setResult('');
        let endpoint = '/creator/tools/script', body = {};
        switch (tool) {
            case 'script': body = scriptP; break;
            case 'planner': body = { topic: `Create a detailed ${plannerP.days}-day content calendar for "${plannerP.niche}" on ${plannerP.platforms.join(', ')}.`, angle: `${plannerP.tone} content strategist` }; break;
            case 'ab': body = { topic: `Generate ${abP.count} high-CTR title variations for: ${abP.topic}`, angle: 'data-driven title optimizer' }; break;
            case 'predict': body = { topic: 'Provide engagement insights for typical high-performing formats.', angle: 'analyst' }; break;
            case 'seo': body = { topic: `Generate a high-ranking SEO strategy for: ${seoP.topic}`, angle: 'YouTube algorithm expert' }; break;
            case 'dna': body = { topic: `Deconstruct the content format of: ${dnaP.example}`, angle: 'format analyzer' }; break;
            case 'repurpose': endpoint = '/creator/tools/repurpose'; body = repurposeP; break;
            case 'summary': endpoint = '/creator/tools/summarize'; body = summaryP; break;
            case 'radar': body = { topic: 'What are the fastest rising micro-trends in my niche today?', angle: 'trend forecaster' }; break;
            case 'audience': body = { topic: 'Generate a 3-step strategy to convert casual viewers into community members.', angle: 'community builder' }; break;
            default: body = { topic: tool, angle: 'expert' };
        }
        try {
            const res = await fetch(`${API}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            setResult(data.script || data.content || JSON.stringify(data, null, 2));
        } catch (err) { setResult(`⚠️ Error: ${err.message}`); }
        setLoading(false);
    };

    const PillSelect = ({ options, selected, onChange }) => (
        <div className="flex flex-wrap gap-2 pt-2">
            {options.map(o => (
                <button key={o} onClick={() => onChange(o)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${(Array.isArray(selected) ? selected.includes(o) : selected === o)
                        ? 'bg-devfolio-blue text-white border-devfolio-blue shadow-md'
                        : 'text-devfolio-text-secondary bg-white border-gray-100 hover:border-devfolio-blue/30 hover:text-devfolio-blue'}`}>{o}</button>
            ))}
        </div>
    );

    const renderInput = () => {
        switch (tool) {
            case 'script': return (
                <div className="space-y-6">
                    <div><label className={lbl}>Target Topic</label><input className={inp} placeholder="e.g. The future of AI Agents in 2025" value={scriptP.topic} onChange={e => setScriptP({ ...scriptP, topic: e.target.value })} /></div>
                    <div><label className={lbl}>Creator Angle / Brand Vibe</label><input className={inp} placeholder="e.g. Minimalist, Expert, Documentary Style" value={scriptP.angle} onChange={e => setScriptP({ ...scriptP, angle: e.target.value })} /></div>
                </div>
            );
            case 'planner': return (
                <div className="space-y-6">
                    <div><label className={lbl}>Content Niche</label><input className={inp} placeholder="e.g. Tech Reviews, Fitness Motivation" value={plannerP.niche} onChange={e => setPlannerP({ ...plannerP, niche: e.target.value })} /></div>
                    <div><label className={lbl}>Platforms</label><PillSelect options={PLATFORMS} selected={plannerP.platforms} onChange={p => setPlannerP(prev => ({ ...prev, platforms: prev.platforms.includes(p) ? prev.platforms.filter(x => x !== p) : [...prev.platforms, p] }))} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Timeframe</label><select className={inp} value={plannerP.days} onChange={e => setPlannerP({ ...plannerP, days: +e.target.value })}><option value={7}>7 days</option><option value={14}>14 days</option><option value={30}>30 days</option></select></div>
                        <div><label className={lbl}>Content Tone</label><select className={inp} value={plannerP.tone} onChange={e => setPlannerP({ ...plannerP, tone: e.target.value })}><option>Professional</option><option>Casual & Raw</option><option>Deep Educational</option><option>High Energy</option></select></div>
                    </div>
                </div>
            );
            case 'ab': return (
                <div className="space-y-6">
                    <div><label className={lbl}>Video Topic</label><input className={inp} placeholder="e.g. How I grew to 10K subscribers in 90 days" value={abP.topic} onChange={e => setAbP({ ...abP, topic: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className={lbl}>Platform</label><PillSelect options={['YouTube', 'Instagram', 'LinkedIn']} selected={abP.platform} onChange={p => setAbP({ ...abP, platform: p })} /></div>
                        <div><label className={lbl}>No. of Variations</label><select className={inp} value={abP.count} onChange={e => setAbP({ ...abP, count: +e.target.value })}><option value={5}>5</option><option value={8}>8</option><option value={12}>12</option></select></div>
                    </div>
                </div>
            );
            case 'seo': return (
                <div className="space-y-6">
                    <div><label className={lbl}>Target Keyword / Topic</label><input className={inp} placeholder="e.g. React Native Tutorial 2024" value={seoP.topic} onChange={e => setSeoP({ ...seoP, topic: e.target.value })} /></div>
                </div>
            );
            case 'dna': return (
                <div className="space-y-6">
                    <div><label className={lbl}>Example Video URL or Title</label><input className={inp} placeholder="e.g. MrBeast 100 Days in Circle" value={dnaP.example} onChange={e => setDnaP({ ...dnaP, example: e.target.value })} /></div>
                </div>
            );
            case 'repurpose': return (
                <div className="space-y-6">
                    <div><label className={lbl}>Target Format</label><select className={inp} value={repurposeP.format} onChange={e => setRepurposeP({ ...repurposeP, format: e.target.value })}><option>Twitter Thread</option><option>LinkedIn Post</option><option>TikTok Script</option><option>Newsletter Issue</option></select></div>
                    <div><label className={lbl}>Source Transcript / Ideas</label><textarea className={`${inp} min-h-[120px] resize-none`} placeholder="Paste your video transcript here..." value={repurposeP.transcript} onChange={e => setRepurposeP({ ...repurposeP, transcript: e.target.value })} /></div>
                </div>
            );
            case 'summary': return (
                <div className="space-y-6">
                    <div><label className={lbl}>Long-form Content</label><textarea className={`${inp} min-h-[160px] resize-none`} placeholder="Paste article or transcript here..." value={summaryP.transcript} onChange={e => setSummaryP({ ...summaryP, transcript: e.target.value })} /></div>
                </div>
            );
            case 'radar':
            case 'audience':
            case 'predict': return (
                <div className="space-y-6">
                    <div className="bg-devfolio-muted/50 border border-gray-100 rounded-[1.5rem] p-6 space-y-3">
                        <div className="text-[10px] text-devfolio-blue font-black uppercase tracking-[0.2em] flex items-center gap-2"><TrendingUp size={14} /> Metric Projections</div>
                        <p className="text-xs font-medium text-devfolio-text-secondary leading-relaxed">
                            Run the engagement AI model to get predicted click-through rates and high-retention frameworks based on recent market trends.
                        </p>
                    </div>
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="flex gap-10 min-h-[700px] animate-df-fade-in pb-20">
            {/* Sidebar */}
            <aside className="w-64 shrink-0">
                <div className="sticky top-28 space-y-8">
                    <div className="px-4">
                        <h2 className="text-xl font-black text-devfolio-text-primary mb-2 flex items-center gap-3">
                            Studio <span className="text-[10px] font-black bg-devfolio-blue text-white px-2 py-1 rounded uppercase tracking-widest">Beta</span>
                        </h2>
                        <p className="text-[11px] font-bold text-devfolio-text-secondary uppercase tracking-widest">Hyperbolic Creator Suite</p>
                    </div>
                    <div className="space-y-6">
                        {CATS.map(cat => (
                            <div key={cat.name}>
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-3 px-4">{cat.name}</div>
                                <div className="space-y-1">
                                    {cat.tools.map(t => {
                                        const Icon = t.icon;
                                        const isActive = tool === t.id;
                                        return (
                                            <button key={t.id} onClick={() => { setTool(t.id); setResult(''); }}
                                                className={`w-full group text-left px-4 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-between transition-all ${isActive
                                                    ? 'bg-devfolio-blue text-white shadow-lg shadow-devfolio-blue/20 scale-[1.02]'
                                                    : 'text-devfolio-text-secondary hover:text-devfolio-blue hover:bg-devfolio-muted'}`}>
                                                <div className="flex items-center gap-3">
                                                    <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-devfolio-blue'} />
                                                    {t.label}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0">
                <div className="mb-10 flex items-end justify-between border-b-2 border-gray-50 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-devfolio-blue/10 flex items-center justify-center text-devfolio-blue"><ToolIcon size={24} /></div>
                            <h3 className="text-4xl font-black text-devfolio-text-primary tracking-tighter">{toolMeta?.label}</h3>
                        </div>
                        <p className="text-lg font-medium text-devfolio-text-secondary">{toolMeta?.desc}</p>
                    </div>
                </div>

                {tool === 'dashboard' && <DashboardView setTool={setTool} setScriptTopic={(t) => setScriptP(prev => ({ ...prev, topic: t }))} />}

                {tool !== 'dashboard' && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        <div className="xl:col-span-5 space-y-8">
                            <div className="df-card p-10 bg-gradient-to-br from-white to-devfolio-muted">
                                <div className="text-[10px] font-black text-devfolio-blue uppercase tracking-[0.2em] mb-8 border-b border-gray-100 pb-4">Configuration</div>
                                {renderInput()}
                                <button onClick={handleGenerate} disabled={loading}
                                    className={`mt-10 w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${loading
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                                        : 'df-button-primary shadow-xl shadow-devfolio-blue/20'}`}>
                                    {loading ? <><div className="w-5 h-5 border-[3px] border-devfolio-blue border-t-transparent rounded-full animate-spin" />Processing...</>
                                        : <>Run AI Engine <Sparkles size={14} /></>}
                                </button>
                            </div>
                        </div>

                        <div className="xl:col-span-7">
                            <div className="df-card p-10 min-h-[600px] border-t-[6px] border-t-devfolio-green relative flex flex-col">
                                <div className="text-[10px] font-black text-devfolio-green uppercase tracking-[0.2em] mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
                                    <div className="flex items-center gap-2"><Sparkles size={14} className="fill-devfolio-green" /> Output Stream</div>
                                </div>
                                {result ? (
                                    <div className="prose prose-blue prose-lg max-w-none text-devfolio-text-primary font-medium animate-df-fade-in flex-1">
                                        {result.startsWith('⚠️') ? (
                                            <div className="flex items-start gap-3 p-5 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-medium"><AlertCircle size={20} className="shrink-0 mt-0.5" />{result}</div>
                                        ) : (
                                            <ReactMarkdown>{result}</ReactMarkdown>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center flex-1 text-gray-200">
                                        <ToolIcon size={64} className="mb-6 opacity-10" />
                                        <div className="text-center">
                                            <p className="text-base font-black uppercase tracking-widest mb-2 text-gray-300">Awaiting Pipeline</p>
                                            <p className="text-sm font-medium text-gray-300">Run the AI engine to generate results.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorTools;
