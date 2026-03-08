import React, { useState } from 'react';
import {
    Cpu, Rocket, FlaskConical, Palette, Music,
    BarChart3, Camera, Heart, Globe, Brain,
    Sparkles, ArrowRight, Check
} from 'lucide-react';

const INTERESTS = [
    { id: 'tech', label: 'Technology', icon: Cpu, color: 'blue' },
    { id: 'science', label: 'Science', icon: FlaskConical, color: 'emerald' },
    { id: 'finance', label: 'Finance', icon: BarChart3, color: 'amber' },
    { id: 'space', label: 'Space', icon: Rocket, color: 'indigo' },
    { id: 'art', label: 'Art & Design', icon: Palette, color: 'pink' },
    { id: 'music', label: 'Music', icon: Music, color: 'rose' },
    { id: 'philosophy', label: 'Philosophy', icon: Brain, color: 'violet' },
    { id: 'nature', label: 'Nature', icon: Heart, color: 'cyan' },
    { id: 'world', label: 'World Affairs', icon: Globe, color: 'sky' }
];

const InterestPicker = ({ onComplete }) => {
    const [selected, setSelected] = useState([]);
    const [step, setStep] = useState('select'); // 'select' or 'mapping'
    const [mappingData, setMappingData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const toggleInterest = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleNext = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:8000/user/map-interests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interests: selected })
            });
            const data = await res.json();
            setMappingData(data.deep_interests);
            setStep('mapping');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
            <div className="w-full max-w-5xl">
                {step === 'select' ? (
                    <div className="animate-df-fade-in">
                        <div className="text-center mb-16 relative">
                            <img src="/src/assets/doodles/idea.png" alt="" className="absolute -top-20 -left-10 w-32 h-32 opacity-20 rotate-12 pointer-events-none" />
                            <img src="/src/assets/doodles/tools.png" alt="" className="absolute -top-10 -right-10 w-28 h-28 opacity-20 -rotate-12 pointer-events-none" />

                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-devfolio-blue/10 border border-devfolio-blue/20 text-devfolio-blue text-xs font-black tracking-widest uppercase mb-8">
                                <Sparkles size={14} className="fill-devfolio-blue" /> Personalize Your Signal
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-black text-devfolio-text-primary mb-6 tracking-tighter leading-none">
                                What sparks your <span className="text-devfolio-blue">curiosity?</span>
                            </h1>
                            <p className="text-devfolio-text-secondary text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                                Select at least 3 topics. Our AI will map your interests to deep,
                                high-signal sub-cultures for a noise-free experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                            {INTERESTS.map(item => {
                                const isSelected = selected.includes(item.id);
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleInterest(item.id)}
                                        className={`relative group p-8 rounded-[2rem] border-2 transition-all duration-300 text-left overflow-hidden ${isSelected
                                            ? 'bg-devfolio-blue border-devfolio-blue shadow-xl scale-[1.02]'
                                            : 'bg-white border-gray-100 hover:border-devfolio-blue/30 hover:bg-devfolio-muted'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${isSelected ? 'bg-white text-devfolio-blue' : 'bg-devfolio-muted text-gray-400 group-hover:scale-110'
                                            }`}>
                                            <Icon size={28} />
                                        </div>
                                        <h3 className={`text-xl font-black transition-colors ${isSelected ? 'text-white' : 'text-devfolio-text-primary group-hover:text-devfolio-blue'}`}>
                                            {item.label}
                                        </h3>
                                        <p className={`text-sm mt-2 transition-colors ${isSelected ? 'text-white/80' : 'text-devfolio-text-secondary'}`}>
                                            Explore curated {item.label.toLowerCase()} niches.
                                        </p>
                                        {isSelected && (
                                            <div className="absolute top-6 right-6 text-white animate-df-fade-in">
                                                <div className="bg-white/20 p-1.5 rounded-full">
                                                    <Check size={20} strokeWidth={4} />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex justify-center flex-col items-center gap-6">
                            <button
                                onClick={handleNext}
                                disabled={selected.length < 1 || isLoading}
                                className={`group px-12 py-5 rounded-full font-black text-lg flex items-center gap-3 transition-all duration-300 ${selected.length >= 1
                                    ? 'df-button-primary shadow-xl shadow-devfolio-blue/20 hover:scale-105 active:scale-95'
                                    : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
                                    }`}
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Map Your Interest Vectors <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                            {selected.length < 3 && selected.length > 0 && (
                                <p className="text-devfolio-blue text-xs font-black uppercase tracking-widest animate-df-fade-in">Select {3 - selected.length} more for optimal results</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-df-fade-in">
                        <div className="text-center mb-16 relative">
                            <img src="/src/assets/doodles/search.png" alt="" className="absolute -top-10 left-10 w-24 h-24 opacity-30 rotate-12 pointer-events-none" />
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-devfolio-green/10 border border-devfolio-green/20 text-devfolio-green text-xs font-black tracking-widest uppercase mb-6">
                                <Check size={14} strokeWidth={3} /> Mapping Complete
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-black text-devfolio-text-primary mb-6 tracking-tighter">Your Niche <span className="text-devfolio-green">Unpacked.</span></h1>
                            <p className="text-devfolio-text-secondary text-xl font-medium">We've expanded your interests into high-signal sub-cultures.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-h-[500px] overflow-y-auto p-4 custom-scrollbar">
                            {mappingData.map((item, idx) => (
                                <div key={idx} className="df-card p-8 group hover:border-devfolio-green transition-all bg-devfolio-muted/30">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-black text-devfolio-text-primary group-hover:text-devfolio-green transition-colors">{item.name}</h3>
                                        <div className="w-2.5 h-2.5 rounded-full bg-devfolio-green shadow-[0_0_8px_rgba(39,196,153,0.5)]"></div>
                                    </div>
                                    <p className="text-devfolio-text-secondary font-medium leading-relaxed mb-6">{item.vibe}</p>
                                    <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                                        {item.boost_keywords.map(kw => (
                                            <span key={kw} className="text-[10px] px-3 py-1.5 rounded-lg bg-white text-devfolio-text-secondary font-black border border-gray-100 uppercase tracking-wider">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => onComplete(mappingData)}
                                className="df-button-primary px-16 py-5 rounded-full text-xl font-black hover:scale-105 active:scale-95 shadow-2xl shadow-devfolio-blue/20 transition-all uppercase tracking-widest"
                            >
                                Enter The Hyperbolic Space
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterestPicker;
