import React from 'react';
import { WatchifyTitle, getPosterUrl } from '../lib/api';

interface ContentGridProps {
    title: string;
    items: WatchifyTitle[];
    onItemClick: (item: WatchifyTitle) => void;
}

const ContentGrid: React.FC<ContentGridProps> = ({ title, items, onItemClick }) => {
    if (items.length === 0) return null;

    return (
        <div className="px-8 md:px-16 py-12">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-black text-white mb-8 tracking-tight">
                    {title}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {items.map((item, idx) => {
                        const posterUrl = getPosterUrl(item.Poster_Path);
                        const rating = item.Rating ? item.Rating.split('/')[0].trim() : 'N/A';

                        return (
                            <button
                                key={`${item.Name}-${idx}`}
                                onClick={() => onItemClick(item)}
                                className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 hover:z-10"
                            >
                                {/* Poster Image */}
                                <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
                                    <img
                                        src={posterUrl}
                                        alt={item.Name}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Poster';
                                        }}
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Info on Hover */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                                            {item.Name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-yellow-400 font-semibold">⭐ {rating}</span>
                                            <span className="text-white/60">{item.Year}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Category Badge */}
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs font-semibold text-white">
                                    {item.Category}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ContentGrid;
