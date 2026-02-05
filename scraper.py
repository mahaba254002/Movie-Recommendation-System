import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import re
import os

class WatchifyScraper:
    """
    Watchify Scscraper Tool
    Optimized for extracting Movies, TV Shows, and Anime posters and data.
    """
    def __init__(self):
        self.base_url = "https://www.cinematerial.com"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        self.posters_dir = "posters"
        if not os.path.exists(self.posters_dir):
            os.makedirs(self.posters_dir)
        self.csv_path = "movies_data.csv"

    def download_image(self, url, filename):
        """Downloads a poster image to the local posters directory."""
        if not url or url == "None" or "base64" in url:
            return "None"
        try:
            # Clean filename for Windows file system - more aggressive cleaning
            filename = re.sub(r'[\\/*?:"<>|]', "", filename)
            filename = filename.replace(" ", "_")
            filepath = os.path.join(self.posters_dir, f"{filename}.jpg")
            
            if os.path.exists(filepath):
                return f"{self.posters_dir}/{filename}.jpg"

            response = self.session.get(url, timeout=20)
            if response.status_code == 200:
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                # Return relative path for frontend consistency
                return f"{self.posters_dir}/{filename}.jpg"
        except Exception as e:
            print(f"    Error downloading image {url}: {e}")
        return "None"

    def get_links(self, category_path, page_num):
        """Fetches title links for a specific category list page."""
        url = f"{self.base_url}/titles/{category_path}?page={page_num}"
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            links = []
            
            # Cinematerial uses /movies/ and /tv/ prefixes for links
            # Even for anime, they are often listed under /movies/ titles
            search_prefix = "/movies/" if "movies" in category_path or "anime" in category_path else "/tv/"
            
            for link in soup.select(f'a[href^="{search_prefix}"]'):
                href = link.get('href')
                # Skip secondary links like reviews or info pages
                if not any(x in href for x in ['/info', '/reviews', '/posters', '/trailers']):
                    full_url = f"{self.base_url}{href}"
                    if full_url not in links:
                        links.append(full_url)
            return links
        except Exception as e:
            print(f"Error fetching {category_path} page {page_num}: {e}")
            return []

    def get_details(self, url, default_category):
        """Extracts detailed information for a single movie/show/anime."""
        info_url = f"{url}/info"
        try:
            response = self.session.get(info_url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')

            # 1. Extract Title and Year
            title_tag = soup.find('h1')
            full_title = title_tag.get_text(strip=True) if title_tag else "Unknown"
            
            # Regex to find (2023) style years
            year_match = re.search(r'\((\d{4})\)', full_title) or re.search(r'(\d{4})$', full_title)
            if year_match:
                year = year_match.group(1)
                name = full_title[:year_match.start()].strip(" ()-")
            else:
                year_matches = re.findall(r'\d{4}', full_title)
                year = year_matches[-1] if year_matches else "Unknown"
                name = full_title.replace(year, "").strip(" ()-") if year != "Unknown" else full_title

            # 2. Extract Rating
            rating = "None"
            rating_match = soup.find(string=re.compile(r'\d+\s*/\s*100'))
            if rating_match:
                rating = rating_match.strip()

            # 3. Extract Genres and Categorize
            genres = [g.get_text(strip=True) for g in soup.select('a[href*="genre="]')]
            
            final_category = default_category
            # Custom logic to identify Anime
            if "Animation" in genres and ("Japanese" in genres or "Anime" in [g.title() for g in genres]):
                final_category = "Anime"
            elif any("Anime" in g.title() for g in genres):
                final_category = "Anime"

            # 4. Extract Plot (Overview)
            plot = "None"
            plot_search = soup.select_one('.movie-plot, .plot-summary, p.description')
            if plot_search:
                plot = plot_search.get_text(strip=True)
            else:
                # Find first descriptive paragraph
                for p in soup.find_all('p'):
                    p_text = p.get_text(strip=True)
                    if len(p_text) > 50 and not p.find('a', href=True):
                        plot = p_text
                        break

            # 5. Extract Actors
            actors = [a.get_text(strip=True) for a in soup.select('a[href^="/people/"]')][:10]
            
            # 6. Extract Poster URL
            poster_url = "None"
            
            # Try JSON-LD first (very reliable on Cinematerial)
            import json
            json_ld = soup.find('script', type='application/ld+json')
            if json_ld:
                try:
                    data = json.loads(json_ld.string)
                    poster_url = data.get('image', "None")
                except:
                    pass

            # Fallback to img tags if JSON-LD fails or doesn't have image
            if poster_url == "None":
                poster_search = soup.select_one('.movie-poster img, .poster img, #poster img, img[alt*="Poster"]')
                if poster_search:
                    # Check data-src first for lazy-loaded images
                    poster_url = poster_search.get('data-src') or poster_search.get('src')
            
            if poster_url and poster_url != "None" and "base64" not in poster_url:
                if not poster_url.startswith('http'):
                    poster_url = f"https:{poster_url}" if poster_url.startswith('//') else f"{self.base_url}{poster_url}"
                
                # Upgrade to high-res if possible (md -> hq or sm -> md)
                poster_url = poster_url.replace('/136x/', '/500x/').replace('/297x/', '/500x/')

                # Download locally
                poster_filename = f"{name}_{year}"
                local_path = self.download_image(poster_url, poster_filename)
            else:
                local_path = "None"

            return {
                "Name": name,
                "Year": year,
                "Rating": rating,
                "Genres": ", ".join(list(set(genres))),
                "Actors": ", ".join(actors),
                "Plot": plot,
                "Poster_Path": local_path,
                "Category": final_category,
                "Source_URL": url
            }
        except Exception as e:
            print(f"Error fetching details for {url}: {e}")
            return None

    def run_scrape(self, targets={"Movie": 500, "TV Show": 300, "Anime": 200}):
        """Main loop for scraping multiple categories until targets are reached."""
        all_data = []
        if os.path.exists(self.csv_path):
            try:
                existing_df = pd.read_csv(self.csv_path)
                all_data = existing_df.to_dict(orient='records')
                print(f"Loaded {len(all_data)} existing records.")
            except:
                print("Could not load existing CSV, starting fresh.")

        for category, target in targets.items():
            current_count = len([x for x in all_data if x.get('Category') == category])
            if current_count >= target:
                print(f"Target for {category} already reached ({current_count}/{target})")
                continue

            print(f"Scraping category: {category} (Goal: {target})")
            
            # Map category to URL paths
            url_path = "movies" if category == "Movie" else "tv"
            if category == "Anime":
                # For anime, we'll try the 'Animation' genre or searching
                url_path = "movies?genre=Animation"
            
            page = 1
            while current_count < target and page < 100:
                print(f"  Fetching page {page} for {category}...")
                links = self.get_links(url_path, page)
                if not links:
                    print(f"  No more links found for {category} at page {page}")
                    break
                
                for link in links:
                    # Avoid duplicates
                    if any(x.get('Source_URL') == link for x in all_data):
                        continue
                    
                    details = self.get_details(link, category)
                    if details:
                        all_data.append(details)
                        current_count += 1
                        print(f"    [{current_count}/{target}] Added: {details['Name']}")
                    
                    if current_count >= target:
                        break
                        
                    # Polite delay
                    time.sleep(random.uniform(0.1, 0.4))
                
                # Save progress after each page
                pd.DataFrame(all_data).to_csv(self.csv_path, index=False)
                page += 1
                
        print(f"Scraping task complete. Final total: {len(all_data)} items.")

if __name__ == "__main__":
    scraper = WatchifyScraper()
    # Scrape 500 Movies, 300 TV Shows, 200 Anime
    scraper.run_scrape(targets={"Movie": 500, "TV Show": 300, "Anime": 200})
