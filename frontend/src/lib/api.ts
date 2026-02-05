const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface WatchifyTitle {
    Name: string;
    Year: string;
    Rating: string;
    Genres: string;
    Actors: string;
    Plot: string;
    Poster_Path: string;
    Source_URL: string;
    Category: 'Movie' | 'TV Show' | 'Anime' | string;
}

/**
 * Fetches titles from the API, optionally filtered by category.
 */
export async function fetchTitles(category?: string, page: number = 1, limit: number = 20) {
    const url = new URL(`${API_BASE_URL}/titles`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    if (category) url.searchParams.append('category', category);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch titles');
    return response.json();
}

/**
 * Fetches trending titles.
 */
export async function fetchTrending(count: number = 12) {
    const response = await fetch(`${API_BASE_URL}/trending?count=${count}`);
    if (!response.ok) throw new Error('Failed to fetch trending');
    return response.json();
}

/**
 * Searches for titles by query string.
 */
export async function searchTitles(query: string) {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search titles');
    return response.json();
}

/**
 * Gets AI recommendations based on a title name.
 */
export async function getRecommendations(name: string, category?: string) {
    let url = `${API_BASE_URL}/recommend/${encodeURIComponent(name)}`;
    if (category) url += `?category=${encodeURIComponent(category)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to get recommendations');
    return response.json();
}

/**
 * Utility to resolve local poster paths to full API URLs.
 */
export function getPosterUrl(path: string) {
    if (!path || path === 'None') return 'https://via.placeholder.com/500x750?text=No+Poster';

    // Convert Windows backslashes to forward slashes
    const cleanPath = path.replace(/\\/g, '/');

    // If it's already a full URL (though unlikely from local storage)
    if (cleanPath.startsWith('http')) return cleanPath;

    // Ensure we reference the /posters/ endpoint correctly
    if (cleanPath.startsWith('posters/')) {
        return `${API_BASE_URL}/${cleanPath}`;
    }

    return `${API_BASE_URL}/posters/${cleanPath}`;
}
