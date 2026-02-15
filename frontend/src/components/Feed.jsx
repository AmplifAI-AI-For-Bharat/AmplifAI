import React from 'react';
import VideoCard from './VideoCard';

const Feed = ({ videos, intent }) => {
    if (!videos || videos.length === 0) return null;

    return (
        <div className="w-full max-w-5xl mx-auto anime-fade-in">
            {/* Intent Badge */}
            {intent && (
                <div className="mb-8 text-center bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                    <h2 className="text-gray-400 text-sm uppercase tracking-widest mb-2">Detected Hyperbolic Vector</h2>
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        {intent.sub_culture}
                    </div>
                    <div className="text-gray-300 mt-2 font-light italic">
                        "{intent.vibe}"
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                    <VideoCard key={video.video_id} video={video} />
                ))}
            </div>
        </div>
    );
};

export default Feed;
