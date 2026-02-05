'use client';

import React from 'react';
import { Play, Info } from 'lucide-react';
import { WatchifyTitle, getPosterUrl } from '../lib/api';

interface HeroProps {
    title: WatchifyTitle | null;
    onPlay: (title: WatchifyTitle) => void;
    onInfo: (title: WatchifyTitle) => void;
}

const Hero: React.FC<HeroProps> = ({ title, onPlay, onInfo }) => {
    if (!title) return (
        <div className="w-full h-[85vh] bg-black animate-pulse flex items-center justify-center">
            <h2 className="text-4xl font-bold text-gray-800">Watchify</h2>
        </div>
    );

    const imageUrl = getPosterUrl(title.Poster_Path);

    return (
        <div className="relative w-full h-[85vh] mb-4">
            {/* Background Image / Gradient */}
            <div className="absolute inset-0">
                <img
                    src={imageUrl}
                    alt={title.Name}
                    className="w-full h-full object-cover object-top filter brightness-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center px-4 md:px-12 max-w-2xl gap-4">
                <span className="text-red-600 font-bold uppercase tracking-widest text-sm">
                    {title.Category}
                </span>
                <h1 className="text-4xl md:text-7xl font-black text-white leading-tight">
                    {title.Name}
                </h1>

                <div className="flex items-center gap-3 text-white font-medium">
                    <span className="text-green-500 font-bold">{title.Rating} Rating</span>
                    <span>{title.Year}</span>
                </div>

                <p className="text-gray-200 text-lg line-clamp-3 md:line-clamp-4 leading-relaxed font-medium">
                    {title.Plot}
                </p>

                <div className="flex items-center gap-4 mt-6">
                    <button
                        onClick={() => onPlay(title)}
                        className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded font-bold text-lg hover:bg-white/80 transition-colors shadow-lg"
                    >
                        <Play fill="currentColor" size={24} /> Play
                    </button>
                    <button
                        onClick={() => onInfo(title)}
                        className="flex items-center gap-2 bg-gray-500/50 text-white px-6 py-2 rounded font-bold text-lg hover:bg-gray-500/70 transition-colors backdrop-blur-md"
                    >
                        <Info size={24} /> More Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
