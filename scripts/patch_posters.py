import pandas as pd
import os
from scraper import WatchifyScraper
import time
import random

def patch_missing_posters():
    scraper = WatchifyScraper()
    csv_path = "movies_data.csv"
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    df = pd.read_csv(csv_path)
    total_rows = len(df)
    
    # Fill NaN or 'None' values
    df['Poster_Path'] = df['Poster_Path'].fillna('None')
    
    # Identify rows needing a poster
    # We check if path is 'None' OR if the file doesn't actually exist locally
    def needs_patch(row):
        path = str(row['Poster_Path'])
        if path == 'None':
            return True
        # Check if local file exists (path stored as posters/Name_Year.jpg)
        return not os.path.exists(path)

    mask = df.apply(needs_patch, axis=1)
    missing_df = df[mask]
    
    print(f"Found {len(missing_df)} titles missing posters out of {total_rows}.")
    
    if len(missing_df) == 0:
        print("Everything looks good! No patching needed.")
        return

    count = 0
    save_interval = 10
    
    for index, row in missing_df.iterrows():
        url = row['Source_URL']
        name = row['Name']
        year = row['Year']
        category = row['Category']
        
        print(f"[{count+1}/{len(missing_df)}] Patching poster for: {name} ({year})...")
        
        # We reuse the scraper's get_details for the specific URL
        # This will now use the FIXED logic
        details = scraper.get_details(url, category)
        
        if details and details['Poster_Path'] != 'None':
            df.at[index, 'Poster_Path'] = details['Poster_Path']
            print(f"    Success! Saved to: {details['Poster_Path']}")
        else:
            print(f"    Failed to find poster for {name}")
        
        count += 1
        
        # Periodic save
        if count % save_interval == 0:
            df.to_csv(csv_path, index=False)
            print(f"--- Saved progress ({count} processed) ---")
        
        # Polite delay to avoid rate limiting
        time.sleep(random.uniform(0.5, 1.5))

    # Final save
    df.to_csv(csv_path, index=False)
    print("Patching complete.")

if __name__ == "__main__":
    patch_missing_posters()
