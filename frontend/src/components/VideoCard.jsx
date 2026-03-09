import React from 'react';
import ReactDOM from 'react-dom';

const VideoCard = ({ video, onShowOnMap }) => {
    const [feedback, setFeedback] = React.useState(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [translating, setTranslating] = React.useState(false);
    const [translation, setTranslation] = React.useState(null);
    const [showPopup, setShowPopup] = React.useState(false);
    const isBoosted = video.hyperbolic_score > video.base_score + 10;
    const isSuppressed = video.hyperbolic_score < video.base_score - 10;

    const handleFeedback = async (type) => {
        setFeedback(type);
        try {
            await fetch('http://localhost:8000/consumer/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    video_id: video.video_id,
                    is_relevant: type === 'relevant',
                    context: []
                })
            });
        } catch (e) {
            console.error("Feedback failed", e);
        }
    };

    const handleTranslate = async () => {
        if (translation) {
            setShowPopup(true);
            return;
        }
        setTranslating(true);
        try {
            const response = await fetch('http://localhost:8000/translate/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ video_id: video.video_id, title: video.title || "" })
            });
            const data = await response.json();
            if (data.error || data.detail) throw new Error(data.error || data.detail);
            setTranslation(data.translated_text);
            setShowPopup(true);
        } catch (e) {
            console.error("Translation failed", e);
            alert(e.message || "Translation failed. Ensure SARVAM_API_KEY is active.");
        } finally {
            setTranslating(false);
        }
    };

    // Popup rendered via portal
    const translationPopup = showPopup && translation ? ReactDOM.createPortal(
        <div
            onClick={() => setShowPopup(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '1rem' }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ background: '#fff', borderRadius: '1rem', maxWidth: '28rem', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
                {/* Header */}
                <div style={{ background: 'linear-gradient(to right, #3B82F6, #2563EB)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>🌐</span>
                        <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', margin: 0 }}>English Translation</h4>
                    </div>
                    <button
                        onClick={() => setShowPopup(false)}
                        style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.5rem', fontWeight: 700, width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                    >×</button>
                </div>
                {/* Thumbnail */}
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#f3f4f6' }}>
                    <img src={`https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {/* Content */}
                <div style={{ padding: '1.25rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Original</span>
                        <p style={{ color: '#4B5563', fontSize: '0.875rem', marginTop: '0.25rem', lineHeight: 1.6 }}>{video.title}</p>
                    </div>
                    <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '0.75rem', padding: '1rem' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>English Translation</span>
                        <p style={{ color: '#111827', fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem', lineHeight: 1.6 }}>{translation}</p>
                    </div>
                    <p style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.75rem' }}>
                        {video.channel} • {video.views}
                    </p>
                </div>
                {/* Footer */}
                <div style={{ padding: '0 1.25rem 1.25rem' }}>
                    <button
                        onClick={() => setShowPopup(false)}
                        style={{ width: '100%', padding: '0.625rem', background: '#3B82F6', color: '#fff', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
                    >Close</button>
                </div>
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <>
            {translationPopup}
            <div className={`
                df-card group overflow-hidden
                ${isBoosted ? 'border-t-[6px] border-t-devfolio-blue' : 'border-t-[6px] border-t-gray-100'}
                ${isSuppressed ? 'opacity-50 grayscale' : ''}
            `}>
                {/* Thumbnail / Video Player */}
                <div className="w-full aspect-video bg-gray-50 relative overflow-hidden">
                    {!isPlaying ? (
                        <button onClick={() => setIsPlaying(true)} className="w-full h-full relative">
                            <img
                                src={`https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`}
                                alt={video.title}
                                onError={(e) => {
                                    if (e.target.src.includes('hqdefault')) {
                                        e.target.src = `https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`;
                                    }
                                }}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                    <span className="text-devfolio-blue text-lg ml-1">▶</span>
                                </div>
                            </div>
                            {isBoosted && (
                                <div className="absolute top-3 right-3 bg-devfolio-blue text-white font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full z-10 shadow-sm">
                                    HIGH SIGNAL
                                </div>
                            )}
                        </button>
                    ) : (
                        <iframe
                            width="100%" height="100%"
                            src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1`}
                            title={video.title} frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen className="absolute inset-0"
                        ></iframe>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h3 className="text-devfolio-text-primary font-black text-lg leading-snug mb-2 line-clamp-2 group-hover:text-devfolio-blue transition-colors">
                                {video.title}
                            </h3>
                            <p className="text-devfolio-text-secondary text-xs font-bold uppercase tracking-widest">
                                {video.channel} • {video.views}
                            </p>
                        </div>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-black text-xs ${isBoosted ? 'border-devfolio-blue text-devfolio-blue' : 'border-gray-100 text-gray-300'}`}>
                            {video.hyperbolic_score.toFixed(0)}
                        </div>
                    </div>

                    {video.match_reason && (
                        <div className={`mt-5 text-[11px] font-bold p-3 rounded-lg leading-relaxed ${isBoosted ? 'bg-devfolio-blue/5 text-devfolio-blue border border-devfolio-blue/10' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                            <span className="mr-2">{isBoosted ? '🌊' : '🔻'}</span>
                            {video.match_reason}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-50">
                        <button
                            onClick={() => handleFeedback('relevant')}
                            className={`flex-1 min-w-[80px] text-[10px] font-black uppercase tracking-widest py-2 rounded-lg border transition-all ${feedback === 'relevant' ? 'bg-devfolio-blue/10 border-devfolio-blue/30 text-devfolio-blue' : 'border-gray-100 bg-white hover:border-devfolio-blue/30 text-gray-400 hover:text-devfolio-blue'}`}
                        >Relevant</button>
                        <button
                            onClick={() => handleFeedback('not_relevant')}
                            className={`flex-1 min-w-[80px] text-[10px] font-black uppercase tracking-widest py-2 rounded-lg border transition-all ${feedback === 'not_relevant' ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-100 bg-white hover:border-red-200 text-gray-400 hover:text-red-600'}`}
                        >Hide</button>
                        <button
                            onClick={handleTranslate}
                            disabled={translating}
                            className={`flex-1 min-w-[80px] text-[10px] font-black uppercase tracking-widest py-2 rounded-lg border transition-all flex items-center justify-center gap-2 ${translating ? 'bg-devfolio-yellow/10 border-devfolio-yellow/30 text-devfolio-yellow cursor-wait' : translation ? 'bg-devfolio-green/10 border-devfolio-green/30 text-devfolio-green' : 'border-gray-100 bg-white hover:border-devfolio-yellow/30 hover:text-devfolio-yellow'}`}
                        >
                            {translating ? (
                                <>
                                    <div className="w-2 h-2 border-2 border-devfolio-yellow/30 border-t-devfolio-yellow rounded-full animate-spin" />
                                    ...
                                </>
                            ) : translation ? '✅ EN' : 'Translate'}
                        </button>
                        <button
                            onClick={() => onShowOnMap && onShowOnMap(video)}
                            className="flex-1 min-w-[80px] text-[10px] font-black uppercase tracking-widest py-2 rounded-lg border border-devfolio-blue/20 bg-devfolio-blue/5 text-devfolio-blue hover:bg-devfolio-blue hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <span className="text-sm">📍</span> Map
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoCard;
