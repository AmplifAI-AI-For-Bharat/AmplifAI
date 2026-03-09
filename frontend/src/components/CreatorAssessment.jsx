import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, Play, Music, Monitor, Mic, Video, PenTool, Check } from 'lucide-react';

const INTERESTS = [
    { id: 'Music', label: 'Music', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80' },
    { id: 'Fashion', label: 'Fashion', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80' },
    { id: 'Science & Tech', label: 'Science & Tech', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80' },
    { id: 'Cinema & Media', label: 'Cinema & Media', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=80' },
    { id: 'Art', label: 'Art', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400&q=80' },
    { id: 'Business', label: 'Business', img: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&w=400&q=80' },
    { id: 'Food', label: 'Food', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80' },
    { id: 'Travel', label: 'Travel', img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80' },
    { id: 'Gaming', label: 'Gaming', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80' },
    { id: 'Education', label: 'Education', img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=400&q=80' },
    { id: 'Comedy', label: 'Comedy', img: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=400&q=80' }
];

const STYLES = [
    { id: 'tutorial', label: 'Tutorial', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80' },
    { id: 'storytelling', label: 'Storytelling', img: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=400&q=80' },
    { id: 'vlog', label: 'Vlog', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80' },
    { id: 'analysis', label: 'Analysis', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80' },
    { id: 'reaction', label: 'Reaction', img: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=400&q=80' }
];

const GOALS = [
    'Build a dedicated community',
    'Monetize my expertise',
    'Educate & inspire others',
    'Entertain & captivate audiences',
    'Document my personal journey'
];

const CHALLENGES = [
    'Finding my exact niche',
    'Growing consistently',
    'Keeping the audience engaged',
    'High-quality production',
    'Monetization strategies'
];

const getDynamicAudiences = (interests) => {
    if (!interests || interests.length === 0) return ['Students', 'Fans', 'General Audience'];
    const map = {
        'Music': ['Producers', 'Audiophiles', 'Casual Listeners', 'DJs'],
        'Fashion': ['Hypebeasts', 'Designers', 'Vintage Collectors', 'Stylists'],
        'Science & Tech': ['Tech Enthusiasts', 'Founders', 'Academics', 'Early Adopters'],
        'Cinema & Media': ['Film Buffs', 'Filmmakers', 'Critics', 'Binge Watchers'],
        'Art': ['Creatives', 'Collectors', 'Hobbyists', 'Digital Artists'],
        'Business': ['Entrepreneurs', 'Marketers', 'Investors', 'Hustlers'],
        'Food': ['Foodies', 'Home Chefs', 'Critics', 'Health Nuts'],
        'Travel': ['Backpackers', 'Digital Nomads', 'Vacationers', 'Explorers'],
        'Gaming': ['Streamers', 'Esports Fans', 'Casual Gamers', 'Retro Fans'],
        'Education': ['Students', 'Professionals', 'Curious Minds', 'Teachers'],
        'Comedy': ['Stand-up Fans', 'Meme Lovers', 'Satirists', 'Scrollers']
    };
    let set = new Set(['General Audience']);
    interests.forEach(i => {
        if (map[i]) map[i].forEach(a => set.add(a));
    });
    return Array.from(set).slice(0, 8);
};
const TOOLS = [
    { id: 'camera', label: 'Camera / Video', icon: Video },
    { id: 'screen', label: 'Screen Recording', icon: Monitor },
    { id: 'audio', label: 'Audio / DAW', icon: Mic },
    { id: 'animation', label: 'Animation / 3D', icon: Play },
    { id: 'writing', label: 'Writing / Code', icon: PenTool },
    { id: 'music', label: 'Instruments', icon: Music },
    { id: 'business', label: 'Biz Tools', icon: Sparkles }
];

const LANGUAGES = [
    'Hindi', 'English', 'Tamil', 'Telugu', 'Marathi',
    'Bengali', 'Gujarati', 'Malayalam', 'Kannada',
    'Odia', 'Punjabi', 'Assamese', 'Urdu', 'Bhojpuri'
];

const CreatorAssessment = ({ onComplete, onClose }) => {
    const [step, setStep] = useState(1);
    const [answers, setAnswers] = useState({
        interests: [], style: '', goal: '', challenge: '', audience: '', tools: [], languages: []
    });
    const [multiLangMode, setMultiLangMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleArray = (key, val, max = null) => {
        setAnswers(prev => {
            const arr = prev[key];
            if (arr.includes(val)) return { ...prev, [key]: arr.filter(x => x !== val) };
            if (max && arr.length >= max) return prev;
            return { ...prev, [key]: [...arr, val] };
        });
    };

    const nextStep = () => setStep(s => s + 1);

    const handleSubmit = async (finalLanguages) => {
        const payload = { ...answers, languages: finalLanguages };
        setAnswers(payload);
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8000/creator/atlas-mapping", {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            const data = await res.json();

            // Wait a tiny bit extra for the UI polish "Locating your space..." effect
            await new Promise(r => setTimeout(r, 1500));

            onComplete(data.placement_string, data.domain_id, data.coordinates, data.personalized_name, data.mountain_steps, payload);
            onClose();
        } catch (e) {
            console.error(e);
            onComplete("Offline -> Prototype Network", { x: 100, y: 100 });
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white/85 backdrop-blur-2xl z-[60] flex items-center justify-center p-4 sm:p-8 overflow-y-auto animate-df-fade-in">
            {step > 1 && !isLoading && (
                <button onClick={() => setStep(s => s - 1)} className="absolute top-8 left-8 h-12 px-6 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-400 hover:text-black transition-all z-50 transform hover:scale-105 font-black text-xs uppercase tracking-widest">
                    ← Back
                </button>
            )}
            <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center text-gray-400 hover:text-black transition-all z-50 transform hover:scale-105">
                <X size={24} strokeWidth={3} />
            </button>

            {isLoading ? (
                <div className="text-center animate-df-fade-in flex flex-col items-center max-w-md">
                    <div className="w-24 h-24 border-[6px] border-devfolio-blue border-t-transparent rounded-full animate-spin mb-10 shadow-lg"></div>
                    <h3 className="text-4xl font-black text-black mb-4 tracking-tighter">Connecting you with communities...</h3>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">Analyzing your creative choices to find your place on the atlas.</p>
                </div>
            ) : (
                <div className="w-full max-w-5xl relative">
                    {/* Header line progress tracker */}
                    <div className="flex gap-2 mb-12 justify-center">
                        {[1, 2, 3, 4, 5, 6, 7].map(s => (
                            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${s === step ? 'w-12 bg-black' : s < step ? 'w-4 bg-gray-300' : 'w-4 bg-gray-100'}`} />
                        ))}
                    </div>

                    <div className="bg-white/60 p-6 sm:p-8 rounded-[3.5rem] border-2 border-white/50 shadow-2xl backdrop-blur-3xl relative overflow-y-auto" style={{ maxHeight: 'calc(100vh - 100px)' }}>

                        {/* Step 1: Interests (Images) */}
                        {step === 1 && (
                            <div className="animate-df-fade-in">
                                <h2 className="text-4xl sm:text-5xl font-black text-black mb-3 tracking-tighter text-center">What moves you?</h2>
                                <p className="text-gray-500 font-medium text-lg text-center mb-6">Select 1-3 core domains to position within the Atlas.</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                                    {INTERESTS.map(i => {
                                        const sel = answers.interests.includes(i.id);
                                        return (
                                            <button key={i.id} onClick={() => toggleArray('interests', i.id, 3)}
                                                className={`relative h-28 sm:h-32 rounded-[1.5rem] overflow-hidden group transition-all duration-300 transform ${sel ? 'scale-95 ring-[4px] ring-black shadow-lg' : 'hover:-translate-y-1 hover:shadow-2xl'}`}>
                                                <img src={i.img} alt={i.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity ${sel ? 'opacity-80' : 'group-hover:opacity-100'}`} />
                                                <div className="absolute inset-x-0 bottom-0 p-5 flex items-end">
                                                    <span className="text-white font-black text-sm tracking-widest uppercase">{i.label}</span>
                                                </div>
                                                {sel && <div className="absolute top-4 right-4 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center animate-df-fade-in"><Check size={16} strokeWidth={4} /></div>}
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="mt-8 pb-2 flex justify-center">
                                    <button onClick={nextStep} disabled={answers.interests.length === 0} className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-black/20">Continue <ArrowRight size={16} className="inline ml-2" strokeWidth={3} /></button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Content Style (YouTube iFrames) */}
                        {step === 2 && (
                            <div className="animate-df-fade-in">
                                <h2 className="text-4xl sm:text-5xl font-black text-black mb-3 tracking-tighter text-center">How do you deliver?</h2>
                                <p className="text-gray-500 font-medium text-lg text-center mb-10">Select your core content format.</p>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {STYLES.map(s => {
                                        const sel = answers.style === s.id;
                                        return (
                                            <button key={s.id} onClick={() => { setAnswers({ ...answers, style: s.id }); setTimeout(nextStep, 600); }}
                                                className={`relative aspect-[9/16] rounded-3xl overflow-hidden group transition-all duration-300 ${sel ? 'ring-[4px] ring-black shadow-lg scale-95' : 'hover:-translate-y-2 hover:shadow-2xl'}`}>
                                                <div className="absolute inset-0 bg-black">
                                                    <img src={s.img} alt={s.label} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-5">
                                                    <span className="text-white font-black text-xs uppercase tracking-widest z-10">{s.label}</span>
                                                </div>
                                                {sel && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center animate-df-fade-in"><Check strokeWidth={4} /></div>}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Creator Goal (Text) */}
                        {step === 3 && (
                            <div className="animate-df-fade-in flex flex-col items-center">
                                <h2 className="text-4xl font-black text-black mb-10 tracking-tighter text-center">What is your creative goal?</h2>
                                <div className="flex flex-col gap-3 w-full max-w-lg">
                                    {GOALS.map(g => (
                                        <button key={g} onClick={() => { setAnswers({ ...answers, goal: g }); setTimeout(nextStep, 400); }}
                                            className="w-full py-6 px-8 rounded-3xl bg-gray-50 hover:bg-black hover:text-white transition-all text-left font-black text-xl tracking-tighter border border-transparent hover:border-black/10 hover:-translate-y-1 shadow-sm hover:shadow-2xl group flex justify-between items-center">
                                            {g}
                                            <ArrowRight size={24} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Challenge */}
                        {step === 4 && (
                            <div className="animate-df-fade-in flex flex-col items-center">
                                <h2 className="text-4xl font-black text-black mb-10 tracking-tighter text-center">Your main creative challenge?</h2>
                                <div className="flex flex-col gap-3 w-full max-w-lg">
                                    {CHALLENGES.map(c => (
                                        <button key={c} onClick={() => { setAnswers({ ...answers, challenge: c }); setTimeout(nextStep, 400); }}
                                            className="w-full py-6 px-8 rounded-3xl bg-white border border-gray-100 hover:border-black hover:bg-black hover:text-white transition-all text-left font-black text-lg tracking-tighter shadow-sm hover:shadow-2xl group flex justify-between items-center">
                                            {c}
                                            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 5: Audience */}
                        {step === 5 && (
                            <div className="animate-df-fade-in flex flex-col items-center">
                                <h2 className="text-4xl font-black text-black mb-10 tracking-tighter text-center">Who are you speaking to?</h2>
                                <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
                                    {getDynamicAudiences(answers.interests).map(a => (
                                        <button key={a} onClick={() => { setAnswers({ ...answers, audience: a }); setTimeout(nextStep, 400); }}
                                            className={`px-8 py-5 rounded-full border-2 transition-all font-black text-[11px] uppercase tracking-widest shadow-sm hover:shadow-xl hover:-translate-y-1 ${answers.audience === a ? 'bg-black text-white border-black scale-105' : 'bg-white border-gray-100 hover:border-black hover:bg-black hover:text-white'}`}>
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 6: Tools (Icons) */}
                        {step === 6 && (
                            <div className="animate-df-fade-in flex flex-col items-center">
                                <h2 className="text-4xl font-black text-black mb-6 tracking-tighter text-center">Your Weapons of Choice</h2>
                                <p className="text-gray-500 font-medium text-lg text-center mb-10">Select your active tools.</p>
                                <div className="flex flex-wrap justify-center gap-6 w-full max-w-4xl">
                                    {TOOLS.map(t => {
                                        const sel = answers.tools.includes(t.id);
                                        const Icon = t.icon;
                                        return (
                                            <button key={t.id} onClick={() => toggleArray('tools', t.id)}
                                                className={`w-32 sm:w-36 aspect-square flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all duration-300 border-2 ${sel ? 'border-black bg-black text-white shadow-2xl scale-105' : 'border-gray-50 bg-white hover:border-gray-200 text-gray-500 hover:text-black hover:-translate-y-1 hover:shadow-xl'}`}>
                                                <Icon size={36} className="mb-4" strokeWidth={1.5} />
                                                <span className="font-black text-[10px] uppercase tracking-widest text-center">{t.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="mt-12 flex justify-center">
                                    <button onClick={nextStep} disabled={answers.tools.length === 0} className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-black/20">Verify Toolkit <ArrowRight size={16} className="inline ml-2" strokeWidth={3} /></button>
                                </div>
                            </div>
                        )}

                        {/* Step 7: Language */}
                        {step === 7 && (
                            <div className="animate-df-fade-in flex flex-col items-center">
                                <h2 className="text-4xl font-black text-black mb-6 tracking-tighter text-center">Community Language</h2>
                                <p className="text-gray-500 font-medium text-lg text-center mb-8">Bhashini / Saaras V3 Supported</p>
                                <div className="flex flex-wrap justify-center gap-3 w-full max-w-4xl mb-6">
                                    {!multiLangMode ? LANGUAGES.map(l => (
                                        <button key={l} onClick={() => handleSubmit([l])}
                                            className={`px-6 py-4 rounded-[2rem] border-2 transition-all font-black text-sm tracking-wide shadow-sm hover:shadow-xl hover:-translate-y-1 bg-white border-gray-100 hover:border-black hover:bg-black hover:text-white`}>
                                            {l}
                                        </button>
                                    )) : LANGUAGES.map(l => {
                                        const sel = answers.languages.includes(l);
                                        return (
                                            <button key={l} onClick={() => toggleArray('languages', l)}
                                                className={`px-6 py-4 rounded-[2rem] border-2 transition-all font-black text-sm tracking-wide shadow-sm hover:shadow-xl hover:-translate-y-1 ${sel ? 'bg-black text-white border-black scale-105' : 'bg-white border-gray-100 hover:border-black hover:text-black'}`}>
                                                {l}
                                                {sel && <Check size={16} strokeWidth={4} className="inline ml-2" />}
                                            </button>
                                        )
                                    })}
                                </div>
                                {!multiLangMode ? (
                                    <button onClick={() => setMultiLangMode(true)}
                                        className="w-full max-w-sm py-4 rounded-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-black transition-all font-black text-sm uppercase tracking-widest hover:text-black bg-transparent hover:bg-white shadow-[0_0_0_0_rgba(0,0,0,0)] hover:shadow-xl">
                                        Select Multiple Languages
                                    </button>
                                ) : (
                                    <div className="mt-4 flex justify-center animate-df-fade-in">
                                        <button onClick={() => handleSubmit(answers.languages)} disabled={answers.languages.length === 0} className="px-10 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-black/20">Synthesize Coordinates <ArrowRight size={16} className="inline ml-2" strokeWidth={3} /></button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Inject small animation style for audio hovering indicator */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulseWave {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
                    50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
                    100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
                }
                .wave-anim {
                    animation: pulseWave 2s infinite ease-in-out;
                }
            `}} />
        </div>
    );
};

export default CreatorAssessment;
