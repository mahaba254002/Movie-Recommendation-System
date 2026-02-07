'use client';

import React from 'react';

/**
 * Loading skeleton for movie cards
 * Provides visual feedback while images are loading
 */
const MovieCardSkeleton: React.FC = () => {
    return (
        <div className="group relative flex flex-col items-center animate-pulse">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-gray-700/50 shadow-lg">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/20 to-transparent animate-shimmer"></div>
            </div>
            <div className="mt-2 w-full px-1 space-y-2">
                <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-700/50 rounded w-12"></div>
                    <div className="h-3 bg-gray-700/50 rounded w-8"></div>
                </div>
            </div>
        </div>
    );
};

export default MovieCardSkeleton;
