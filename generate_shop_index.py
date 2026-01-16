import os
import json
import requests
from bs4 import BeautifulSoup
import time
import concurrent.futures
from urllib.parse import urljoin, urlparse

# Aggressive crawling config
MAX_PAGES_PER_SHOP = 15
MAX_TEXT_PER_SHOP = 50000 
# Keywords to prioritize for product listings
PRIORITY_KEYWORDS = ['shop', 'product', 'category', 'collection', 'store', 'catalog', 'buy', 'item', 'list']

def is_valid_internal_link(base_url, link_url):
	try:
		base_domain = urlparse(base_url).netloc
		link_domain = urlparse(link_url).netloc
		
		# Must be same domain or empty (relative)
		if not link_domain or base_domain == link_domain:
			return True
			
		return False
	except:
		return False

def score_link(url):
	url_lower = url.lower()
	score = 0
	for keyword in PRIORITY_KEYWORDS:
		if keyword in url_lower:
			score += 1

	# Boost pagination to ensure we crawl deep into catalogs
	if 'page=' in url_lower or '/page/' in url_lower or 'p=' in url_lower:
		score += 3
		
	# Penalize likely useless pages
	if any(x in url_lower for x in ['login', 'account', 'cart', 'checkout', 'policy', 'terms', 'contact', 'about', 'blog', 'news', 'faq']):
		 score -= 5
	return score

def scrape_page(url, session):
	try:
		headers = {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
		}
		response = session.get(url, headers=headers, timeout=10)
		if response.status_code == 200:
			soup = BeautifulSoup(response.text, 'html.parser')
			
			# Remove scripts and styles and common non-content specific to navigation
			for script in soup(["script", "style", "nav", "footer", "header", "iframe", "noscript"]):
				script.decompose()
				
			text = soup.get_text(separator=' ', strip=True)
			
			links = []
			for a in soup.find_all('a', href=True):
				href = a['href']
				full_url = urljoin(url, href)
				links.append(full_url)
				
			return text, links
		return "", []
	except Exception as e:
		# print(f"Error scraping {url}: {e}")
		return "", []

def get_shop_data_deep(shop_entry):
	name = shop_entry['name']
	start_url = shop_entry['url']
	category = shop_entry['category']
	
	# Skip Amazon
	if 'amazon' in start_url.lower() or 'indiamart' in start_url.lower() or 'ebay' in start_url.lower():
		 return {
			'title': name,
			'url': start_url,
			'category': category,
			'content': f"{name} - {category}. Large marketplace (Not fully indexed)."
		}
		
	print(f"Deep scraping {name} ({start_url})...")
	
	session = requests.Session()
	visited = set()
	
	# Best-first search: candidates list of URLs to visit
	candidates = [start_url]
	visited_candidates = set([start_url]) # Track what we already added to candidates to avoid duplicates
	
	combined_text = []
	pages_crawled = 0
	
	while candidates and pages_crawled < MAX_PAGES_PER_SHOP:
		# Pick best candidate
		# If start_url is in candidates, prioritize it
		if start_url in candidates:
			current_url = start_url
		else:
			# Sort and pick top
			candidates.sort(key=score_link, reverse=True)
			current_url = candidates[0]
			
		candidates.remove(current_url)
		
		if current_url in visited:
			continue
			
		# print(f"  > Visiting {current_url}...")
		text, links = scrape_page(current_url, session)
		combined_text.append(text)
		visited.add(current_url)
		pages_crawled += 1
		
		# Add new unique links to candidates
		for link in links:
			link = link.split('#')[0]
			if is_valid_internal_link(start_url, link):
				if link not in visited and link not in visited_candidates:
					candidates.append(link)
					visited_candidates.add(link)
					
		time.sleep(0.5) # Polite delay
		
	full_text = " ".join(combined_text)
	
	# Truncate
	if len(full_text) > MAX_TEXT_PER_SHOP:
		full_text = full_text[:MAX_TEXT_PER_SHOP]
		
	print(f"Finished {name}: {pages_crawled} pages, {len(full_text)} chars.")
	
	return {
		'title': name,
		'url': start_url,
		'category': category,
		'content': f"Category: {category}. Content: {full_text}"
	}

def parse_shops_html():
	shops = []
	if not os.path.exists('shops.html'):
		return []
	with open('shops.html', 'r', encoding='utf-8') as f:
		soup = BeautifulSoup(f, 'html.parser')
	for h2 in soup.find_all('h2'):
		category = h2.get_text(strip=True).replace('⬡', '').strip()
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
						shops.append({'name': name, 'url': url, 'category': category})
	return shops

def generate_shop_index():
	shops = parse_shops_html()
	print(f"Found {len(shops)} shops to index.")
	
	search_index = []
	
	# Lower concurrency to avoid network congestion since we are doing more requests per worker
	with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
		future_to_shop = {executor.submit(get_shop_data_deep, shop): shop for shop in shops}
		
		for future in concurrent.futures.as_completed(future_to_shop):
			try:
				data = future.result()
				if data:
					search_index.append(data)
			except Exception as exc:
				print(f"Generated an exception: {exc}")
				
	with open('shop-search-index.json', 'w', encoding='utf-8') as f:
		json.dump(search_index, f, ensure_ascii=False, indent=2)
		
	print(f"Generated shop index with {len(search_index)} items.")

if __name__ == "__main__":
	generate_shop_index()
