import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

class MovieRecommender:
    """
    Watchify Recommendation Engine
    This class handles the core logic for suggesting Movies, TV Shows, and Anime.
    It uses 'Content-Based Filtering' based on plot, genres, and cast.
    """
    def __init__(self, csv_path='movies_data.csv'):
        self.csv_path = csv_path
        self.movies = None
        self.similarity_matrix = None
        self.load_data()

    def load_data(self):
        """
        Loads the dataset and prepares the mathematical model for recommendations.
        """
        if not os.path.exists(self.csv_path):
            print(f"Warning: {self.csv_path} not found.")
            return False
        
        try:
            # 1. Load the dataset
            self.movies = pd.read_csv(self.csv_path)
            
            # 2. Data Cleaning: Fill missing values with 'None' to prevent errors
            self.movies = self.movies.fillna('None')
            
            # Ensure character columns are strings and handle any rogue 'nan' strings
            for col in ['Name', 'Genres', 'Actors', 'Plot', 'Rating', 'Year', 'Poster_Path', 'Category']:
                if col in self.movies.columns:
                    self.movies[col] = self.movies[col].astype(str).replace('nan', 'None')
            
            # 3. Feature Engineering: Create 'tags' for comparison
            # We combine the most important text features into a single string.
            # This allows the model to find similarities across multiple dimensions at once.
            if 'Category' not in self.movies.columns:
                self.movies['Category'] = 'Movie' # Default fallback
                
            self.movies['tags'] = (
                self.movies['Name'] + " " + 
                self.movies['Genres'] + " " + 
                self.movies['Actors'] + " " + 
                self.movies['Plot'] + " " +
                self.movies['Category']
            ).str.lower()
            
            # 4. Vectorization: Converting text into numbers
            # CountVectorizer counts the frequency of words in the 'tags' column.
            # We limit to 5000 features (top words) and remove common English 'stop words' (like 'the', 'is').
            cv = CountVectorizer(max_features=5000, stop_words='english')
            vectors = cv.fit_transform(self.movies['tags']).toarray()
            
            # 5. Cosine Similarity: Calculating the distance between titles
            # This creates a square matrix where each cell represents the similarity 
            # score (0 to 1) between two titles. 1 means identical, 0 means completely different.
            self.similarity_matrix = cosine_similarity(vectors)
            return True
        except Exception as e:
            print(f"Error loading data: {e}")
            return False

    def get_recommendations(self, title, num_recommendations=6, category=None):
        """
        Retrieves the most similar content based on a given title.
        Optionally filters results to a specific category (Movie, TV Show, Anime).
        """
        if self.movies is None or self.similarity_matrix is None:
            return []
        
        try:
            # Find the index of the title in the dataframe
            # We use lowercase comparison to be more forgiving
            matches = self.movies[self.movies['Name'].str.lower() == title.lower()]
            if matches.empty:
                return []
                
            movie_index = matches.index[0]
            
            # Get the similarity scores for this specific title
            distances = self.similarity_matrix[movie_index]
            
            # Sort the distance array:
            # enumerate(distances) gives us (index, score) pairs.
            # We sort descending by score and skip the first item (since it's the title itself with score 1.0).
            movie_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:50] 
            
            # Filter and collect results
            recommendations = []
            for i in movie_list:
                rec_data = self.movies.iloc[i[0]].to_dict()
                
                # Apply category filter if requested
                if category and rec_data['Category'].lower() != category.lower():
                    continue
                    
                recommendations.append(rec_data)
                
                if len(recommendations) >= num_recommendations:
                    break
                    
            return recommendations
        except Exception as e:
            print(f"Prediction Error: {e}")
            return []

    def get_trending(self, count=10):
        """Returns trending content (simulated using high ratings/latest years)"""
        if self.movies is None: return []
        # Sort by year (desc) and rating if available
        return self.movies.sort_values(by=['Year'], ascending=False).head(count).to_dict(orient='records')

if __name__ == "__main__":
    # Test script
    recommender = MovieRecommender()
    if recommender.movies is not None:
        test_title = "Avatar"
        print(f"Watchify: Recommending titles similar to '{test_title}':")
        recs = recommender.get_recommendations(test_title)
        for r in recs:
            print(f"- [{r['Category']}] {r['Name']} ({r['Year']}) - ★ {r['Rating']}")
