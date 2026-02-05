'use client';

import React from 'react';
import { Play, Plus, ChevronDown } from 'lucide-react';
import { WatchifyTitle, getPosterUrl } from '../lib/api';

interface WatchifyCardProps {
    title: WatchifyTitle;
    onClick: (title: WatchifyTitle) => void;
    isSelected?: boolean;
}

const WatchifyCard: React.FC<WatchifyCardProps> = ({ title, onClick, isSelected }) => {
    const imageUrl = getPosterUrl(title.Poster_Path);

    return (
        <div
            className={`relative group flex-shrink-0 w-36 sm:w-48 lg:w-56 overflow-hidden rounded-md transition-all duration-300 ${isSelected ? 'scale-105 ring-2 ring-red-600' : 'hover:scale-105 hover:z-10'}`}
            onClick={() => onClick(title)}
        >
            <div className="aspect-[2/3] relative">
                <img
                    src={imageUrl}
                    alt={title.Name}
                    className="w-full h-full object-cover transition-transform group-hover:brightness-50"
                    loading="lazy"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 bg-gradient-to-t from-black to-transparent">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                            <Play fill="currentColor" size={16} />
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center text-white hover:border-white transition-colors">
                            <Plus size={16} />
                        </div>
                        <div className="ml-auto w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center text-white hover:border-white transition-colors">
                            <ChevronDown size={16} />
                        </div>
                    </div>
                    <h3 className="text-white text-sm font-bold truncate">{title.Name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-300 mt-1">
                        <span className="text-green-500 font-bold">{title.Rating}</span>
                        <span>{title.Year}</span>
                        <span className="border border-gray-500 px-1 rounded-sm uppercase">{title.Category}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchifyCard;
