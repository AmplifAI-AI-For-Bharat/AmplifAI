import React from 'react';
import VideoCard from './VideoCard';

const Feed = ({ videos, intent }) => {
    if (!videos || videos.length === 0) return null;

    return (
        <div className="w-full max-w-6xl mx-auto animate-df-fade-in">
            {/* Intent Badge */}
            {intent && (
                <div className="mb-12 text-center bg-devfolio-muted border border-gray-100 p-10 rounded-3xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-devfolio-blue"></div>
                    <h2 className="text-devfolio-blue text-[10px] uppercase tracking-[0.3em] font-black mb-4">Hyperbolic Vector Detected</h2>
                    <div className="text-5xl font-black text-devfolio-text-primary tracking-tighter mb-4">
                        {intent.sub_culture}
                    </div>
                    <div className="text-devfolio-text-secondary font-medium italic text-lg opacity-80 decoration-devfolio-green decoration-2 underline-offset-8 underline">
                        "{intent.vibe}"
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
                {videos.map(video => (
                    <VideoCard key={video.video_id} video={video} />
                ))}
            </div>
        </div>
    );
};

export default Feed;
