import pandas as pd
import os

def clean_and_truncate():
    csv_path = 'movies_data.csv'
    posters_dir = 'posters'
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    print("Loading data...")
    df = pd.read_csv(csv_path)
    
    # Filter categories
    movies = df[df['Category'] == 'Movie'].head(100)
    tv_shows = df[df['Category'] == 'TV Show'].head(100)
    anime = df[df['Category'] == 'Anime']
    
    # Combine back
    new_df = pd.concat([movies, tv_shows, anime])
    
    # Save new CSV
    new_df.to_csv(csv_path, index=False)
    print(f"Truncated CSV saved. Total rows: {len(new_df)}")
    
    # Cleanup posters
    referenced_posters = set()
    for path in new_df['Poster_Path']:
        if isinstance(path, str) and path != 'None':
            # Handle posters/ prefix if present
            clean_path = path.replace('posters/', '')
            referenced_posters.add(clean_path)
    
    print(f"Referenced posters count: {len(referenced_posters)}")
    
    deleted_count = 0
    if os.path.exists(posters_dir):
        for filename in os.listdir(posters_dir):
            if filename not in referenced_posters:
                file_path = os.path.join(posters_dir, filename)
                try:
                    os.remove(file_path)
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
                    
    print(f"Cleanup complete. Deleted {deleted_count} unused posters.")

if __name__ == "__main__":
    clean_and_truncate()
