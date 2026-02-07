'use client';

import React, { useState, useEffect } from 'react';
import GlassmorphicNav from '../components/GlassmorphicNav';
import DynamicHero from '../components/DynamicHero';
import ContentGrid from '../components/ContentGrid';
import {
  WatchifyTitle,
  fetchTitles,
  fetchTrending,
  searchTitles
} from '../lib/api';

export default function Home() {
  const [trending, setTrending] = useState<WatchifyTitle[]>([]);
  const [movies, setMovies] = useState<WatchifyTitle[]>([]);
  const [tvShows, setTvShows] = useState<WatchifyTitle[]>([]);
  const [anime, setAnime] = useState<WatchifyTitle[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<WatchifyTitle[]>([]);

  const [activeCategory, setActiveCategory] = useState('home');
  const [searchResults, setSearchResults] = useState<WatchifyTitle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Watchify: Starting data fetch...');

        const fetchResults = await Promise.allSettled([
          fetchTrending(12),
          fetchTitles('Movie', 1, 12),
          fetchTitles('TV Show', 1, 12),
          fetchTitles('Anime', 1, 12)
        ]);

        console.log('Watchify: Fetch complete. Processing results...');

        const trendingData = fetchResults[0].status === 'fulfilled' ? fetchResults[0].value : [];
        const moviesData = fetchResults[1].status === 'fulfilled' ? fetchResults[1].value : { titles: [] };
        const tvData = fetchResults[2].status === 'fulfilled' ? fetchResults[2].value : { titles: [] };
        const animeData = fetchResults[3].status === 'fulfilled' ? fetchResults[3].value : { titles: [] };

        console.log('Watchify Debug:', {
          trendingCount: trendingData.length,
          moviesCount: moviesData.titles?.length,
          tvCount: tvData.titles?.length
        });

        setTrending(trendingData);
        setMovies(moviesData.titles || []);
        setTvShows(tvData.titles || []);
        setAnime(animeData.titles || []);

        // Simulate recently watched (take a mix of random items)
        const allContent = [...(moviesData.titles || []), ...(tvData.titles || [])];
        const recent = allContent.sort(() => 0.5 - Math.random()).slice(0, 12);
        setRecentlyWatched(recent);

        if (trendingData.length > 0) {
          console.log('Watchify: Selecting title from trending:', trendingData[0].Name);
        } else if (moviesData.titles?.length > 0) {
          console.log('Watchify: Selecting title from movies:', moviesData.titles[0].Name);
        } else {
          console.warn('Watchify: No titles found to select!');
        }
      } catch (error) {
        console.error('Error loading Watchify data:', error);
      }
    };

    loadInitialData();
  }, []);

  const handleTitleSelect = async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setIsSearching(false);
    // Optionally scroll to the relevant section
    if (category !== 'home') {
      const sectionMap: Record<string, string> = {
        'movies': 'movies-section',
        'tv-series': 'tv-section',
        'anime': 'anime-section'
      };
      const elementId = sectionMap[category];
      if (elementId) {
        document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim().length > 2) {
      setIsSearching(true);
      try {
        const results = await searchTitles(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Debounced search handler
  const debouncedSearch = React.useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handleSearch(query), 300); // 300ms delay
      };
    })(),
    []
  );

  // Determine what content to show based on active category
  const getFilteredContent = () => {
    switch (activeCategory) {
      case 'movies':
        return { primary: movies, title: 'All Movies' };
      case 'tv-series':
        return { primary: tvShows, title: 'All TV Series' };
      case 'anime':
        return { primary: anime, title: 'All Anime' };
      default:
        return null;
    }
  };

  const filteredContent = getFilteredContent();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <GlassmorphicNav
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onSearch={debouncedSearch}
      />

      <DynamicHero titles={trending.length > 0 ? trending : movies.slice(0, 8)} />

      {/* Content Sections */}
      <div className="relative z-10 bg-gradient-to-b from-transparent to-slate-900 -mt-32">
        {isSearching ? (
          <ContentGrid title="Search Results" items={searchResults} onItemClick={handleTitleSelect} />
        ) : activeCategory === 'home' ? (
          <>
            <ContentGrid title="Trending Now" items={trending} onItemClick={handleTitleSelect} />
            <ContentGrid title="Recently Watched" items={recentlyWatched} onItemClick={handleTitleSelect} />
            <div id="movies-section">
              <ContentGrid title="Blockbuster Movies" items={movies.slice(0, 12)} onItemClick={handleTitleSelect} />
            </div>
            <div id="tv-section">
              <ContentGrid title="Top TV Series" items={tvShows.slice(0, 12)} onItemClick={handleTitleSelect} />
            </div>
            {anime.length > 0 && (
              <div id="anime-section">
                <ContentGrid title="Anime Collection" items={anime.slice(0, 12)} onItemClick={handleTitleSelect} />
              </div>
            )}
          </>
        ) : filteredContent ? (
          <ContentGrid title={filteredContent.title} items={filteredContent.primary} onItemClick={handleTitleSelect} />
        ) : null}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-8 md:px-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h3 className="text-3xl font-black text-white">WATCHIFY</h3>
          <p className="text-white/60 max-w-2xl mx-auto">
            Your premium AI-powered entertainment recommendation system. Discover movies, TV series, and anime tailored to your taste.
          </p>
          <div className="flex justify-center gap-8 text-sm text-white/40 pt-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
