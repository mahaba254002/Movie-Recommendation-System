import requests
from bs4 import BeautifulSoup
import pandas as pd
import os
import time
import random
import re

class AnimePlanetScraper:
    def __init__(self):
        self.base_url = "https://www.anime-planet.com"
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Referer": "https://www.anime-planet.com/"
        })
        self.posters_dir = "posters"
        if not os.path.exists(self.posters_dir):
            os.makedirs(self.posters_dir)
        self.csv_path = "movies_data.csv"

    def download_image(self, url, filename):
        if not url or url == "None":
            return "None"
        try:
            # Clean filename
            filename = re.sub(r'[\\/*?:"<>|]', "", filename)
            filename = filename.replace(" ", "_")
            filepath = os.path.join(self.posters_dir, f"{filename}.jpg")
            
            if os.path.exists(filepath):
                return f"posters/{filename}.jpg"

            # Anime-Planet sometimes uses internal paths for images
            if url.startswith('/'):
                url = self.base_url + url

            response = self.session.get(url, timeout=20)
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                return f"posters/{filename}.jpg"
        except Exception as e:
            print(f"Error downloading image: {e}")
        return "None"

    def get_anime_details(self, url):
        try:
            response = self.session.get(url, timeout=10)
            if response.status_code != 200:
                return None
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Title and Year
            title_tag = soup.find('h1', itemprop="name")
            name = title_tag.get_text(strip=True) if title_tag else "Unknown"
            
            year_tag = soup.find('span', class_='type')
            year_text = year_tag.get_text(strip=True) if year_tag else ""
            year_match = re.search(r'\d{4}', year_text)
            year = year_match.group(0) if year_match else "Unknown"
            
            # Rating (Anime-Planet uses 5 star scale, we'll convert to 1/100ish or just keep as is)
            # Actually Watchify seems to use "Rating" as "88 / 100"
            rating_tag = soup.find('div', class_='avgRating')
            rating_val = rating_tag.get_text(strip=True) if rating_tag else "0"
            try:
                # Convert 4.5 to 90 / 100
                score = float(rating_val) * 20
                rating = f"{int(score)} / 100"
            except:
                rating = "None"
            
            # Genres
            genres = [tag.get_text(strip=True) for tag in soup.select('.tags ul li a')]
            
            # Plot
            plot_tag = soup.find('div', itemprop="description")
            plot = plot_tag.get_text(strip=True) if plot_tag else "None"
            
            # Poster
            poster_tag = soup.find('img', class_='mainPosterImg')
            poster_url = poster_tag['src'] if poster_tag else None
            
            local_poster = "None"
            if poster_url:
                local_poster = self.download_image(poster_url, f"{name}_{year}")

            return {
                "Name": name,
                "Year": year,
                "Rating": rating,
                "Genres": ", ".join(genres[:5]),
                "Actors": "Various", # Harder to get from AP easily
                "Plot": plot,
                "Poster_Path": local_poster,
                "Category": "Anime",
                "Source_URL": url
            }
        except Exception as e:
            print(f"Error getting details for {url}: {e}")
            return None

    def run(self, count=30):
        target_url = "https://www.anime-planet.com/anime/all?sort=status_1&order=desc"
        print(f"Fetching top {count} anime from Anime-Planet...")
        
        response = self.session.get(target_url, timeout=10)
        if response.status_code != 200:
            print(f"Failed to fetch Anime-Planet: {response.status_code}")
            return

        soup = BeautifulSoup(response.content, 'html.parser')
        anime_items = soup.select('li.card')[:count]
        
        new_data = []
        for item in anime_items:
            link_tag = item.find('a', href=True)
            if not link_tag: continue
            
            full_link = self.base_url + link_tag['href']
            print(f"Processing: {full_link}")
            
            details = self.get_anime_details(full_link)
            if details:
                new_data.append(details)
                print(f"  Added: {details['Name']}")
            
            time.sleep(random.uniform(1.0, 2.0))

        if new_data:
            # Load existing
            if os.path.exists(self.csv_path):
                df = pd.read_csv(self.csv_path)
                # Remove old anime if user says they are empty/broken
                # Actually user said "anime movies and poster are empty", maybe I should just append
                # But let's avoid duplicates
                existing_names = set(df['Name'].tolist())
                final_new = [d for d in new_data if d['Name'] not in existing_names]
                
                df_new = pd.DataFrame(final_new)
                df_combined = pd.concat([df, df_new], ignore_index=True)
                df_combined.to_csv(self.csv_path, index=False)
                print(f"Saved {len(final_new)} new anime titles to {self.csv_path}")
            else:
                pd.DataFrame(new_data).to_csv(self.csv_path, index=False)
                print(f"Created {self.csv_path} with {len(new_data)} anime titles")

if __name__ == "__main__":
    scraper = AnimePlanetScraper()
    scraper.run(30)
