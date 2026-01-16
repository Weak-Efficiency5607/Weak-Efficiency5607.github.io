import os
import json
import requests
from bs4 import BeautifulSoup
import time
import concurrent.futures

def get_shop_data(shop_entry):
    name = shop_entry['name']
    url = shop_entry['url']
    category = shop_entry['category']
    
    # Skip Amazon as requested (too many substances/products)
    if 'amazon' in url.lower():
        return {
            'title': name,
            'url': url,
            'category': category,
            'content': f"{name} - {category}. Large marketplace."
        }
    
    print(f"Scraping {name} ({url})...")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove scripts and styles
            for script in soup(["script", "style", "nav", "footer"]):
                script.decompose()
            
            # Get text
            text = soup.get_text(separator=' ', strip=True)
            
            # Limit text length to avoid massive index files
            # extract up to 10000 characters
            text_content = text[:10000]
            
            # Combine category and scraped content
            combined_content = f"Category: {category}. Content: {text_content}"
            
            return {
                'title': name,
                'url': url,
                'category': category,
                'content': combined_content
            }
        else:
            print(f"Failed to fetch {url}: Status {response.status_code}")
            return {
                'title': name,
                'url': url,
                'category': category,
                'content': f"{name} - {category}. Could not fetch website content."
            }
            
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {
            'title': name,
            'url': url,
            'category': category,
            'content': f"{name} - {category}. Error accessing website."
        }

def parse_shops_html():
    shops = []
    
    if not os.path.exists('shops.html'):
        print("shops.html not found.")
        return []
        
    with open('shops.html', 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
        
    # Find all categories (h2 followed by shop-grid)
    # The structure is <h2>...</h2> <div class="shop-grid">...</div>
    
    # We can iterate over h2s
    for h2 in soup.find_all('h2'):
        category = h2.get_text(strip=True).replace('⬡', '').strip()
        
        # The next sibling should be the grid
        next_sibling = h2.find_next_sibling()
        while next_sibling and next_sibling.name != 'div' and 'shop-grid' not in next_sibling.get('class', []):
            next_sibling = next_sibling.find_next_sibling()
            
        if next_sibling and 'shop-grid' in next_sibling.get('class', []):
            shop_grid = next_sibling
            for link in shop_grid.find_all('a', class_='shop-card'):
                name_div = link.find('div', class_='shop-name')
                if name_div:
                    name = name_div.get_text(strip=True)
                    url = link.get('href')
                    if name and url:
                        shops.append({
                            'name': name,
                            'url': url,
                            'category': category
                        })
                        
    return shops

def generate_shop_index():
    shops = parse_shops_html()
    print(f"Found {len(shops)} shops.")
    
    search_index = []
    
    # Use ThreadPoolExecutor to scrape concurrently (faster)
    # But be proper citizens and limit concurrency
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_to_shop = {executor.submit(get_shop_data, shop): shop for shop in shops}
        
        for future in concurrent.futures.as_completed(future_to_shop):
            try:
                data = future.result()
                if data:
                    search_index.append(data)
            except Exception as exc:
                print(f"Generated an exception: {exc}")
                
    # Save index
    with open('shop-search-index.json', 'w', encoding='utf-8') as f:
        json.dump(search_index, f, ensure_ascii=False, indent=2)
        
    print(f"Generated shop index with {len(search_index)} items.")

if __name__ == "__main__":
    generate_shop_index()
