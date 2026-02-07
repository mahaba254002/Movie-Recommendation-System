from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from recommender import MovieRecommender
import pandas as pd
import os
from typing import Optional

app = FastAPI(title="Watchify API", description="Premium Movie, TV Show, and Anime Recommendation Engine")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve movie posters as static files with caching
# Ensure posters directory exists to avoid mount errors
if not os.path.exists("posters"):
    os.makedirs("posters")
app.mount("/posters", StaticFiles(directory="posters", html=False), name="posters")

# Add cache control headers for static files
@app.middleware("http")
async def add_cache_headers(request, call_next):
    response = await call_next(request)
    # Cache poster images for 1 week (604800 seconds)
    if request.url.path.startswith("/posters/"):
        response.headers["Cache-Control"] = "public, max-age=604800, immutable"
    return response

# Initialize recommender
recommender = MovieRecommender()

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Watchify API",
        "status": "online",
        "categories": ["Movie", "TV Show", "Anime"]
    }

@app.get("/titles")
def get_titles(
    category: Optional[str] = None, 
    page: int = 1, 
    limit: int = 20
):
    """Returns a paginated list of titles, optionally filtered by category."""
    if not os.path.exists('movies_data.csv'):
        return {"titles": [], "total": 0}
    
    df = pd.read_csv('movies_data.csv')
    df = df.fillna('None')
    
    # Filter by category if provided
    if category:
        df = df[df['Category'].str.lower() == category.lower()]
    
    total = len(df)
    start = (page - 1) * limit
    end = start + limit
    
    titles_list = df.iloc[start:end].to_dict(orient='records')
    return {
        "titles": titles_list,
        "total": total,
        "page": page,
        "limit": limit
    }

@app.get("/trending")
def get_trending(count: int = 10):
    """Returns the latest/highest rated titles across all categories."""
    if recommender.movies is None:
        recommender.load_data()
    return recommender.get_trending(count)

@app.get("/search")
def search_titles(query: str):
    """Searches for titles by name, genre, or actors with fuzzy matching."""
    # Validate query length
    if len(query.strip()) < 2:
        return []
    
    # Use cached data from recommender instead of reading CSV every time
    if recommender.movies is None:
        recommender.load_data()
    
    df = recommender.movies.copy()
    query_lower = query.lower().strip()
    
    # Split query into words for better matching
    query_words = query_lower.split()
    
    def calculate_relevance(row):
        """Calculate relevance score for ranking results"""
        score = 0
        name_lower = str(row['Name']).lower()
        genres_lower = str(row['Genres']).lower()
        actors_lower = str(row['Actors']).lower()
        
        # Exact match in name (highest priority)
        if query_lower in name_lower:
            score += 100
        
        # Name starts with query
        if name_lower.startswith(query_lower):
            score += 50
        
        # All query words found in name
        if all(word in name_lower for word in query_words):
            score += 30
        
        # Match in genres
        if query_lower in genres_lower:
            score += 20
        
        # Match in actors
        if query_lower in actors_lower:
            score += 15
        
        # Partial word matches in name (e.g., "spider" matches "Spider-Man")
        name_words = name_lower.replace('-', ' ').replace(':', ' ').split()
        for query_word in query_words:
            for name_word in name_words:
                if name_word.startswith(query_word):
                    score += 10
        
        return score
    
    # Calculate relevance scores
    df['relevance'] = df.apply(calculate_relevance, axis=1)
    
    # Filter results with score > 0
    results = df[df['relevance'] > 0].sort_values('relevance', ascending=False)
    
    # Drop the relevance column before returning
    results = results.drop('relevance', axis=1)
    
    return results.head(12).to_dict(orient='records')

@app.get("/recommend/{name}")
def get_recommendations(
    name: str, 
    num: int = 6, 
    category: Optional[str] = None
):
    """Gets AI-powered recommendations for a given title, optionally filtered by category."""
    if recommender.movies is None:
        recommender.load_data()
        
    recs = recommender.get_recommendations(name, num_recommendations=num, category=category)
    return recs

@app.get("/refresh")
def refresh_data():
    """Forces the recommender to reload the CSV data."""
    success = recommender.load_data()
    return {"status": "success" if success else "failed"}

if __name__ == "__main__":
    import uvicorn
    # Get port from environment variable for deployment (default to 8000)
    port = int(os.environ.get("PORT", 8000))
    # Clean output by running through uvicorn directly
    uvicorn.run(app, host="0.0.0.0", port=port)
