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

# Serve movie posters as static files
# Ensure posters directory exists to avoid mount errors
if not os.path.exists("posters"):
    os.makedirs("posters")
app.mount("/posters", StaticFiles(directory="posters"), name="posters")

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
    """Searches for titles by name across all categories."""
    if not os.path.exists('movies_data.csv'):
        return []
    
    df = pd.read_csv('movies_data.csv')
    df = df.fillna('None')
    # Search in both Name and Genres
    mask = (df['Name'].str.contains(query, case=False, na=False)) | \
           (df['Genres'].str.contains(query, case=False, na=False))
    results = df[mask].to_dict(orient='records')
    return results[:12]

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
