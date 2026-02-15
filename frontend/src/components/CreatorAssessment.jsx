import React, { useState } from 'react';

const SKILL_OPTIONS = [
    "Video Editing", "Storytelling", "Coding/Tech", "Finance/Business",
    "Comedy/Humor", "Education", "Art/Design", "Music", "Analysis/Commentary"
];

const CreatorAssessment = ({ onComplete, onClose }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState({
        primary_skills: [],
        weekly_hours: 10,
        risk_tolerance: "Balanced", // Stable, Balanced, Experimental
    });
    const [results, setResults] = useState(null);

    const handleAssessmentSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:8000/creator/assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            });
            const data = await response.json();
            setResults(data);
            setStep(3); // Results Step
        } catch (e) {
            console.error("Assessment Failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSkill = (skill) => {
        setProfile(prev => {
            if (prev.primary_skills.includes(skill)) {
                return { ...prev, primary_skills: prev.primary_skills.filter(s => s !== skill) };
            } else {
                if (prev.primary_skills.length >= 3) return prev; // Max 3 skills
                return { ...prev, primary_skills: [...prev.primary_skills, skill] };
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>

                {/* Progress Bar */}
                <div className="h-1 bg-gray-800 w-full">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                </div>

                <div className="p-8">

                    {/* Step 1: Skills & Profile */}
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-2">Creator Strategy Assessment</h2>
                            <p className="text-gray-400 mb-6">Identify your unfair advantages to find your blue ocean.</p>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-300 mb-3">What are your top skills? (Max 3)</label>
                                <div className="flex flex-wrap gap-2">
                                    {SKILL_OPTIONS.map(skill => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleSkill(skill)}
                                            className={`px-4 py-2 rounded-full text-sm border transition-all ${profile.primary_skills.includes(skill)
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-bold text-gray-300 mb-3">Risk Tolerance</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['Stable', 'Balanced', 'Experimental'].map(risk => (
                                        <button
                                            key={risk}
                                            onClick={() => setProfile({ ...profile, risk_tolerance: risk })}
                                            className={`p-4 rounded-xl border text-left transition-all ${profile.risk_tolerance === risk
                                                    ? 'bg-blue-900/40 border-blue-500 ring-1 ring-blue-500'
                                                    : 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                                                }`}
                                        >
                                            <div className={`font-bold mb-1 ${profile.risk_tolerance === risk ? 'text-blue-400' : 'text-gray-300'}`}>{risk}</div>
                                            <div className="text-xs text-gray-500">
                                                {risk === 'Stable' && "Proven formats, consistent growth."}
                                                {risk === 'Balanced' && "Mix of trends and evergreen."}
                                                {risk === 'Experimental' && "High risk, viral potential."}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => { setStep(2); handleAssessmentSubmit(); }}
                                    disabled={profile.primary_skills.length === 0}
                                    className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Analyze Market Opportunities →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Loading Analysis */}
                    {step === 2 && isLoading && (
                        <div className="text-center py-12 animate-fade-in">
                            <div className="inline-block relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Analyzing 4,000+ Niches...</h3>
                            <p className="text-gray-400">Matching your skills with high-demand, low-supply markets.</p>
                        </div>
                    )}

                    {/* Step 3: Results */}
                    {step === 3 && results && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-2">Strategic Recommendations</h2>
                            <p className="text-gray-400 mb-6">{results.profile_summary}</p>

                            <div className="grid grid-cols-1 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                                {results.recommended_niches.map((niche, idx) => (
                                    <div key={idx} className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all flex justify-between items-center group">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-white">{niche.topic}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${niche.market_gap_score > 75 ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                                                    }`}>
                                                    Score: {niche.market_gap_score}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">{niche.strategy}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                onComplete(niche.topic);
                                                onClose();
                                            }}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            Select Strategy
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CreatorAssessment;
