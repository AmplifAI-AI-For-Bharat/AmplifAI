import React from 'react';

const VideoCard = ({ video }) => {
    const [feedback, setFeedback] = React.useState(null);
    const [isPlaying, setIsPlaying] = React.useState(false);
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
                    context: [] // todo: pass user context
                })
            });
        } catch (e) {
            console.error("Feedback failed", e);
        }
    };

    return (
        <div className={`
      relative p-4 rounded-xl border border-gray-800 bg-gray-900 
      transition-all duration-300 hover:scale-[1.02]
      ${isBoosted ? 'shadow-[0_0_20px_rgba(34,197,94,0.3)] border-green-900/50' : ''}
      ${isSuppressed ? 'opacity-50 grayscale' : ''}
    `}>
            {/* Thumbnail / Video Player */}
            <div className="w-full aspect-video bg-gray-800 rounded-lg mb-3 relative overflow-hidden group">
                {!isPlaying ? (
                    <button
                        onClick={() => setIsPlaying(true)}
                        className="w-full h-full relative"
                    >
                        <img
                            src={`https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`}
                            alt={video.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <span className="text-white text-xl ml-1">▶</span>
                            </div>
                        </div>
                        {isBoosted && (
                            <div className="absolute top-2 right-2 bg-green-500 text-black font-bold text-xs px-2 py-1 rounded-full animate-pulse z-10">
                                HYPERBOLIC MATCH
                            </div>
                        )}
                    </button>
                ) : (
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.video_id}?autoplay=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0"
                    ></iframe>
                )}
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2">{video.title}</h3>
                    <p className="text-gray-400 text-sm">{video.channel} • {video.views}</p>
                </div>

                {/* Score Badge */}
                <div className={`
          flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 
          ${isBoosted ? 'border-green-500 text-green-400' : 'border-gray-700 text-gray-500'}
        `}>
                    <span className="text-xs font-bold">{video.hyperbolic_score.toFixed(0)}</span>
                </div>
            </div>

            {/* Match Reason */}
            {video.match_reason && (
                <div className={`mt-3 text-xs p-2 rounded 
          ${isBoosted ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'}
        `}>
                    {isBoosted ? '🚀' : '🔻'} {video.match_reason}
                </div>
            )}

            {/* Relevance Feedback (Professional Surveyor Style) */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-800/50">
                <button
                    onClick={() => handleFeedback('relevant')}
                    className={`flex-1 text-xs py-1.5 rounded border flex items-center justify-center gap-2 transition-colors ${feedback === 'relevant'
                        ? 'bg-green-900/40 border-green-500/50 text-green-300'
                        : 'border-transparent bg-gray-800/50 hover:bg-gray-800 text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <span>👍</span> Relevant
                </button>
                <button
                    onClick={() => handleFeedback('not_relevant')}
                    className={`flex-1 text-xs py-1.5 rounded border flex items-center justify-center gap-2 transition-colors ${feedback === 'not_relevant'
                        ? 'bg-red-900/40 border-red-500/50 text-red-300'
                        : 'border-transparent bg-gray-800/50 hover:bg-gray-800 text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <span>👎</span> Not Relevant
                </button>
            </div>
        </div>
    );
};

export default VideoCard;
