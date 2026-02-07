'use client';

import React from 'react';
import { WatchifyTitle, getPosterUrl } from '../lib/api';

interface MovieCardProps {
    movie: WatchifyTitle;
    onClick: (movie: WatchifyTitle) => void;
    isSelected?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, isSelected }) => {
    return (
        <div
            onClick={() => onClick(movie)}
            className={`group relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 ${isSelected ? 'ring-2 ring-blue-500 rounded-lg p-1' : ''}`}
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg">
                <img
                    src={getPosterUrl(movie.Poster_Path)}
                    alt={movie.Name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-80"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x750?text=No+Poster';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4">
                    <p className="text-xs font-semibold text-blue-400 capitalize">{movie.Genres.split(',')[0]}</p>
                    <p className="text-sm font-bold text-white line-clamp-2">{movie.Name}</p>
                </div>
            </div>
            <div className="mt-2 w-full px-1">
                <h3 className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">{movie.Name}</h3>
                <div className="flex items-center justify-between mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{movie.Year}</span>
                    <span className="flex items-center gap-1 text-yellow-500">
                        ★ {movie.Rating.split('/')[0].trim() || 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
