import React, { useState, useEffect } from 'react';
import { Play, Youtube, Facebook, Twitter, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { WatchifyTitle, getPosterUrl } from '../lib/api';

interface DynamicHeroProps {
    titles: WatchifyTitle[];
    relatedImages?: string[];
}

const DynamicHero: React.FC<DynamicHeroProps> = ({ titles, relatedImages = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (titles.length <= 1) return;

        const interval = setInterval(() => {
            handleNext();
        }, 8000); // Rotate every 8 seconds

        return () => clearInterval(interval);
    }, [titles.length, currentIndex]);

    const handleNext = () => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % titles.length);
            setIsFading(false);
        }, 500);
    };

    const handlePrev = () => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + titles.length) % titles.length);
            setIsFading(false);
        }, 500);
    };

    if (titles.length === 0) {
        return (
            <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <div className="text-center">
                    <div className="animate-pulse">
                        <h2 className="text-6xl font-black text-white/20 mb-4">WATCHIFY</h2>
                        <p className="text-white/40">Loading amazing content...</p>
                    </div>
                </div>
            </div>
        );
    }

    const title = titles[currentIndex];
    const posterUrl = getPosterUrl(title.Poster_Path);

    // Parse rating
    const rating = title.Rating ? title.Rating.split('/')[0].trim() : 'N/A';
    const maxRating = title.Rating ? title.Rating.split('/')[1]?.trim() : '10';

    // Get genres
    const genres = title.Genres.split(',').map(g => g.trim()).slice(0, 3);

    // Create thumbnail array
    const thumbnails = titles.slice(0, 6).map(t => getPosterUrl(t.Poster_Path));

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-slate-950">
            {/* Dynamic Background with Blur */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                <div
                    className="absolute inset-0 bg-cover bg-center filter blur-3xl scale-110 opacity-40"
                    style={{
                        backgroundImage: `url(${posterUrl})`,
                    }}
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
            </div>

            {/* Content Container */}
            <div className={`relative z-10 min-h-screen flex flex-col transition-all duration-700 ${isFading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                {/* Spacer for nav */}
                <div className="h-20"></div>

                {/* Main Content */}
                <div className="flex-1 flex items-center px-8 md:px-16 py-12">
                    <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Info */}
                        <div className="space-y-6">
                            {/* Movie Title */}
                            <div className="space-y-4">
                                <span className="inline-block px-3 py-1 bg-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-full text-blue-400 text-xs font-bold tracking-widest uppercase">
                                    {title.Category} Premiere
                                </span>
                                <h1 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tight drop-shadow-2xl">
                                    {title.Name.toUpperCase()}
                                </h1>
                                <p className="text-2xl text-white/80 font-light tracking-widest">
                                    {title.Year}
                                </p>
                            </div>

                            {/* Rating & Meta */}
                            <div className="flex items-center gap-6 flex-wrap">
                                <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg px-4 py-2">
                                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-white font-bold text-lg">{rating}</span>
                                    <span className="text-white/60">/ {maxRating}</span>
                                </div>

                                <div className="flex items-center gap-2 text-white/70">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="font-medium">Trending Now</span>
                                </div>
                            </div>

                            {/* Genres */}
                            <div className="flex items-center gap-3 text-sm">
                                {genres.map((genre, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white/60">
                                        {genre}
                                    </span>
                                ))}
                            </div>

                            {/* Plot */}
                            <p className="text-white/70 text-lg leading-relaxed max-w-2xl line-clamp-3">
                                {title.Plot}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 pt-4">
                                <button className="flex items-center gap-3 bg-white text-black hover:bg-white/90 px-8 py-4 rounded-xl font-bold text-lg transition-all active:scale-95">
                                    <Play className="w-5 h-5 fill-black" />
                                    Watch Now
                                </button>

                                <button className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all active:scale-95">
                                    <Youtube className="w-5 h-5" />
                                    Trailer
                                </button>
                            </div>
                        </div>

                        {/* Right: Large Poster */}
                        <div className="hidden lg:flex justify-center items-center">
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-blue-600/30 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                                <img
                                    src={posterUrl}
                                    alt={title.Name}
                                    className="relative w-80 h-[480px] object-cover rounded-2xl shadow-2xl border border-white/10"
                                />

                                {/* Manual Controls Overlay */}
                                <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={handlePrev} className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all">
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button onClick={handleNext} className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-all">
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="px-8 md:px-16 pb-12">
                    <div className="max-w-7xl mx-auto flex items-center gap-2">
                        {titles.slice(0, 8).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setIsFading(true);
                                    setTimeout(() => {
                                        setCurrentIndex(i);
                                        setIsFading(false);
                                    }, 500);
                                }}
                                className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex ? 'w-12 bg-white' : 'w-4 bg-white/20'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Social Media Icons (Right Side) */}
                <div className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-4 z-20">
                    {[Youtube, Facebook, Twitter, Instagram].map((Icon, i) => (
                        <button
                            key={i}
                            className="p-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/20 hover:scale-110 transition-all text-white/40 hover:text-white"
                        >
                            <Icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DynamicHero;
