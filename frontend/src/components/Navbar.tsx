'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, User, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 px-4 md:px-12 py-4 flex items-center justify-between ${isScrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-gradient-to-b from-black/70 to-transparent'}`}>
            <div className="flex items-center gap-8">
                <h1 className="text-red-600 text-3xl font-black tracking-tighter uppercase cursor-pointer hover:scale-105 transition-transform">
                    Watchify
                </h1>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
                    <a href="#" className="hover:text-white transition-colors">Home</a>
                    <a href="#" className="hover:text-white transition-colors">TV Shows</a>
                    <a href="#" className="hover:text-white transition-colors">Movies</a>
                    <a href="#" className="hover:text-white transition-colors">Anime</a>
                    <a href="#" className="hover:text-white transition-colors">New & Popular</a>
                </div>
            </div>

            <div className="flex items-center gap-6 text-gray-300">
                <div className="hidden sm:flex items-center relative group">
                    <Search size={22} className="cursor-pointer hover:text-white" />
                    <input
                        type="text"
                        placeholder="Titles, people, genres"
                        className="w-0 group-hover:w-48 transition-all duration-300 bg-transparent border-b border-white outline-none text-sm px-2 py-1 opacity-0 group-hover:opacity-100"
                    />
                </div>
                <Bell size={22} className="cursor-pointer hover:text-white hidden sm:block" />
                <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center overflow-hidden">
                        <User size={20} className="text-white" />
                    </div>
                    <span className="hidden lg:block text-sm font-medium group-hover:text-white">John Doe</span>
                </div>
                <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 text-2xl font-bold md:hidden">
                    <a href="#" onClick={() => setMobileMenuOpen(false)}>Home</a>
                    <a href="#" onClick={() => setMobileMenuOpen(false)}>TV Shows</a>
                    <a href="#" onClick={() => setMobileMenuOpen(false)}>Movies</a>
                    <a href="#" onClick={() => setMobileMenuOpen(false)}>Anime</a>
                    <a href="#" onClick={() => setMobileMenuOpen(false)}>New & Popular</a>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
