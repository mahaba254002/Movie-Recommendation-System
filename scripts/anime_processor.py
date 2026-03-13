
import os
import pandas as pd
from bs4 import BeautifulSoup
import requests
import re
import urllib.parse

def clean_filename(filename):
    return re.sub(r'[\\/*?:"<>|]', "", filename).replace(" ", "_")

def process_anime_html(html_path, csv_path, posters_dir):
    if not os.path.exists(posters_dir):
        os.makedirs(posters_dir)

    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    cards = soup.find_all('li', class_='card')[:30]
    
    new_data = []
    
    for card in cards:
        a_tag = card.find('a', class_='tooltip')
        if not a_tag:
            continue
            
        name = card.find('h3', class_='cardName').get_text(strip=True)
        img_tag = card.find('img')
        img_url = img_tag.get('data-src') or img_tag.get('src')
        
        # Parse the tooltip title attribute
        tooltip_html = a_tag.get('title')
        tooltip_soup = BeautifulSoup(tooltip_html, 'html.parser')
        
        # Extract metadata from tooltip
        entry_bar = tooltip_soup.find('ul', class_='entryBar')
        year_li = entry_bar.find('li', class_='iconYear') if entry_bar else None
        year_text = year_li.get_text(strip=True) if year_li else "Unknown"
        # Take the start year
        year = re.search(r'\d{4}', year_text)
        year = year.group(0) if year else "Unknown"
        
        rating_div = tooltip_soup.find('div', class_='ttRating')
        rating = rating_div.get_text(strip=True) if rating_div else "None"
        
        plot_p = tooltip_soup.find('p')
        plot = plot_p.get_text(strip=True) if plot_p else "No description available."
        
        tags_ul = tooltip_soup.find('div', class_='tags')
        genres = []
        if tags_ul:
            genres = [li.get_text(strip=True) for li in tags_ul.find_all('li')]
        genres_str = ", ".join(genres)
        
        # Actors (not easily available on this page, but we can put Source/Studio)
        studio_li = entry_bar.find_all('li')[1] if entry_bar and len(entry_bar.find_all('li')) > 1 else None
        actors = studio_li.get_text(strip=True) if studio_li else "Unknown Studio"
        
        # Handle poster
        poster_filename = f"{clean_filename(name)}_{year}.jpg"
        poster_path = f"posters/{poster_filename}"
        
        if img_url:
            try:
                img_response = requests.get(img_url, timeout=10)
                if img_response.status_code == 200:
                    with open(os.path.join(posters_dir, poster_filename), 'wb') as f_img:
                        f_img.write(img_response.content)
                else:
                    poster_path = "None"
            except Exception as e:
                print(f"Failed to download image for {name}: {e}")
                poster_path = "None"
        
        source_url = "https://www.anime-planet.com" + a_tag.get('href')
        
        new_data.append({
            'Name': name,
            'Year': year,
            'Rating': rating,
            'Genres': genres_str,
            'Actors': actors,
            'Plot': plot,
            'Poster_Path': poster_path,
            'Category': 'Anime',
            'Source_URL': source_url
        })
        print(f"Processed: {name}")

    if new_data:
        df_new = pd.DataFrame(new_data)
        if os.path.exists(csv_path):
            df_old = pd.read_csv(csv_path)
            df_final = pd.concat([df_old, df_new], ignore_index=True)
            # Remove duplicates based on Name and Year
            df_final = df_final.drop_duplicates(subset=['Name', 'Year'], keep='last')
            df_final.to_csv(csv_path, index=False)
        else:
            df_new.to_csv(csv_path, index=False)
        print(f"Successfully added {len(new_data)} anime to {csv_path}")

if __name__ == "__main__":
    process_anime_html("anime_page.html", "movies_data.csv", "posters")
