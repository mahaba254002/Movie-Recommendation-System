import pandas as pd
import os

# Load the CSV
df = pd.read_csv('movies_data.csv')

# Function to fix poster paths
def fix_poster_path(row):
    name = row['Name']
    year = row['Year']
    
    # Create expected filename from name and year
    # Replace special characters and spaces
    safe_name = name.replace('/', '_').replace('\\', '_').replace(':', '_').replace('?', '').replace('!', '').replace('&', '_')
    safe_name = safe_name.replace('"', '').replace("'", '').replace('  ', ' ').strip()
    filename = f"{safe_name}_{year}.jpg"
    
    # Check if file exists in posters directory
    poster_path = os.path.join('posters', filename)
    if os.path.exists(poster_path):
        return poster_path
    
    # If not found, return the original path
    return row['Poster_Path']

# Apply the fix
print("Fixing poster paths...")
df['Poster_Path'] = df.apply(fix_poster_path, axis=1)

# Save the updated CSV
df.to_csv('movies_data.csv', index=False)
print(f"Updated {len(df)} entries")

# Show sample of fixed paths
print("\nSample of poster paths:")
print(df[['Name', 'Poster_Path']].head(10))
