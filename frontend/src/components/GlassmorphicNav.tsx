import React, { useState } from 'react';

interface NavbarProps {
    activeCategory?: string;
    onCategoryChange?: (category: string) => void;
    onSearch?: (query: string) => void;
}

const GlassmorphicNav: React.FC<NavbarProps> = ({ activeCategory = 'home', onCategoryChange, onSearch }) => {
    const [searchOpen, setSearchOpen] = useState(false);

    const navItems = [
        { id: 'home', label: 'Home' },
        { id: 'movies', label: 'Movies' },
        { id: 'tv-series', label: 'TV Series' },
        { id: 'anime', label: 'Anime' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-4">
            <div className="mx-auto max-w-7xl">
                <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-2xl px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                WATCHIFY
                            </h1>

                            {/* Nav Links */}
                            <ul className="hidden md:flex items-center gap-6">
                                {navItems.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => onCategoryChange?.(item.id)}
                                            className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeCategory === item.id
                                                ? 'bg-white/20 text-white font-semibold'
                                                : 'text-white/70 hover:text-white hover:bg-white/10'
                                                }`}
                                        >
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSearchOpen(!searchOpen)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-all"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>

                            <button className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                    />
                                </svg>
                                Get Ticket Now
                            </button>
                        </div>
                    </div>

                    {/* Search Bar (Expandable) */}
                    {searchOpen && (
                        <div className="mt-4 animate-slideDown">
                            <input
                                type="text"
                                onChange={(e) => onSearch?.(e.target.value)}
                                placeholder="Search for movies, genres, anime..."
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                            />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default GlassmorphicNav;
