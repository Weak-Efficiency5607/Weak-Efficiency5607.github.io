import os
import json
import requests
import cloudscraper
from bs4 import BeautifulSoup
import time
import concurrent.futures
from urllib.parse import urljoin, urlparse
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn, TimeElapsedColumn
from rich.panel import Panel
from rich.table import Table
from rich.prompt import Prompt, Confirm
from rich import print as rprint

CONFIG_FILE = 'shop_scraper_config.json'

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            pass
    return {'cookies': {}}

def save_config(config):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=4)

# Initialize Rich Console
console = Console()

# Aggressive crawling config
MAX_PAGES_PER_SHOP = 50
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
        # Use session's User-Agent if set, otherwise default
        ua = session.headers.get('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        headers = {
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Referer': url,
            'Cache-Control': 'max-age=0',
        }
        response = session.get(url, headers=headers, timeout=15)
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
        # console.log(f"Error scraping {url}: {e}")
        return "", []

def get_shop_data_deep(shop_entry):
    name = shop_entry['name']
    start_url = shop_entry['url']
    category = shop_entry['category']
    
    # Skip problematic sites or those that block scrapers (e.g. Akamai/Amazon/Bot-detection)
    # These sites often require residential proxies or complex human interaction.
    # We provide a rich static description so they are still searchable in the index.
    problematic_keywords = ['amazon', 'indiamart', 'ebay', 'echemi', 'alldaychemist', 'inhousepharmacy', 'kiwidrug']
    if any(x in start_url.lower() for x in problematic_keywords):
         # provide a better static description based on the shop name and category
         desc = f"Category: {category}. Content: {name} - {category} specialty shop and online source. "
         
         url_lower = start_url.lower()
         if 'alldaychemist' in url_lower or 'inhousepharmacy' in url_lower or 'kiwidrug' in url_lower:
             desc += f"{name} is a trusted online pharmacy offering a vast selection of generic and brand-name medications, including treatments for asthma, skin care, eye care, hair loss, and various health conditions. "
         elif 'amazon' in url_lower:
             desc += "Major global marketplace featuring a comprehensive range of health products, supplements, and wellness items from various brands. "
         elif 'indiamart' in url_lower or 'echemi' in url_lower:
             desc += "Large B2B marketplace and wholesale source for chemicals, pharmaceuticals, and research compounds. "
             
         desc += "(Automated deep-indexing limited for this professional site, results based on curated metadata)."
         
         return {
            'data': {
                'title': name,
                'url': start_url,
                'category': category,
                'content': desc
            },
            'stats': {
                'name': name,
                'url': start_url,
                'pages': 0,
                'chars': len(desc)
            }
        }
        
    # console.log(f"[blue]Deep scraping {name} ({start_url})...[/blue]")
    
    # Use cloudscraper to bypass Cloudflare
    session = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'windows', 'mobile': False})
    
    # Apply custom cookies/UA from config
    config = load_config()
    shop_domain = urlparse(start_url).netloc
    
    cookies_to_apply = {}
    if 'cookies' in config:
        if shop_domain in config['cookies']:
            cookies_to_apply = config['cookies'][shop_domain]
        elif 'global' in config['cookies']:
            cookies_to_apply = config['cookies']['global']

    for name, value in cookies_to_apply.items():
        if name.lower() == 'user-agent':
            session.headers.update({'User-Agent': value})
        else:
            # We set cookies with the domain to ensure they are sent
            session.cookies.set(name, value, domain=shop_domain)

    visited = set()
    
    # Best-first search: candidates list of URLs to visit
    candidates = [start_url]
    visited_candidates = set([start_url]) # Track what we already added to candidates to avoid duplicates
    
    combined_text = []
    current_text_length = 0
    pages_crawled = 0
    
    while candidates and pages_crawled < MAX_PAGES_PER_SHOP:
        # Check if we have enough text
        if current_text_length > MAX_TEXT_PER_SHOP:
            break

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
            
        text, links = scrape_page(current_url, session)
        combined_text.append(text)
        current_text_length += len(text)
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
        
    # console.log(f"[green]Finished {name}: {pages_crawled} pages, {len(full_text)} chars.[/green]")
    
    return {
        'data': {
            'title': name,
            'url': start_url,
            'category': category,
            'content': f"Category: {category}. Content: {full_text}"
        },
        'stats': {
            'name': name,
            'url': start_url,
            'pages': pages_crawled,
            'chars': len(full_text)
        }
    }

def parse_shops_html():
    shops = []
    if not os.path.exists('shops.html'):
        console.print("[red]Error: shops.html not found![/red]")
        return []
        
    with console.status("[bold green]Parsing shops.html..."):
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

def parse_range_input(input_str):
    """Parses input like '1,3,5-7' into a list of 0-based indices."""
    indices = set()
    for part in input_str.replace(' ', '').split(','):
        if not part: continue
        if '-' in part:
            try:
                start, end = map(int, part.split('-'))
                for i in range(min(start, end), max(start, end) + 1):
                    indices.add(i - 1)
            except ValueError:
                pass
        else:
            try:
                indices.add(int(part) - 1)
            except ValueError:
                pass
    return sorted(list(indices))

def display_menu(shops, indexed_urls=None):
    if indexed_urls is None:
        indexed_urls = set()

    console.print(Panel.fit("[bold cyan]Shop Index Generator[/bold cyan]\n[yellow]Select which shops you want to scrape.[/yellow]"))
    
    # Group by category
    categories = sorted(list(set(s['category'] for s in shops)))
    
    table = Table(title="Available Operations", show_header=False, box=None)
    table.add_row("[1] Scrape ALL shops")
    table.add_row("[2] Select by Category")
    table.add_row("[3] Select specific Shops")
    table.add_row("[4] Manage Cloudflare Cookies")
    table.add_row("[q] Quit")
    
    console.print(table)
    
    choice = Prompt.ask("Enter your choice", choices=["1", "2", "3", "4", "q"], default="1")
    
    if choice == "1":
        return shops
    elif choice == "2":
        # Category selection
        cat_table = Table(title="Categories", show_header=True)
        cat_table.add_column("ID", style="cyan", width=4)
        cat_table.add_column("Category Name", style="magenta")
        cat_table.add_column("Shop Count", style="green")
        
        for i, cat in enumerate(categories):
            count = len([s for s in shops if s['category'] == cat])
            cat_table.add_row(str(i+1), cat, str(count))
            
        console.print(cat_table)
        
        selected = Prompt.ask("Enter category IDs (comma separated or range, e.g. 1,3 or 1-5)")
        try:
            indices = parse_range_input(selected)
            selected_cats = [categories[i] for i in indices if 0 <= i < len(categories)]
            return [s for s in shops if s['category'] in selected_cats]
        except Exception as e:
            console.print(f"[red]Invalid selection: {e}[/red]")
            return []
            
    elif choice == "3":
        # Shop selection (searchable or list all? List all might be too long)
        # Let's list groups of shops? or just ask for a search term?
        # Listing all might be huge. Let's do a simple interactive flow.
        
        console.print(f"[bold]Total Shops: {len(shops)}[/bold]")
        search_term = Prompt.ask("Enter a search term to filter shops (or leave empty to list all)")
        
        filtered_shops = shops
        if search_term:
            filtered_shops = [s for s in shops if search_term.lower() in s['name'].lower()]
        
        # Sort so not-indexed are at the end (Indexed=Yes first, Indexed=No last)
        filtered_shops.sort(key=lambda s: s['url'] in indexed_urls, reverse=True)
            
        shop_table = Table(title="Shops", show_header=True)
        shop_table.add_column("ID", style="cyan", width=4)
        shop_table.add_column("Name", style="magenta")
        shop_table.add_column("Category", style="green")
        shop_table.add_column("Indexed", style="yellow")
        
        for i, shop in enumerate(filtered_shops):
            is_indexed = "[bold green]Yes[/bold green]" if shop['url'] in indexed_urls else "[dim]No[/dim]"
            shop_table.add_row(str(i+1), shop['name'], shop['category'], is_indexed)
            
        console.print(shop_table)
        
        selected = Prompt.ask("Enter shop IDs to scrape (comma separated or range, e.g. 1,5 or 1-10)")
        try:
            indices = parse_range_input(selected)
            return [filtered_shops[i] for i in indices if 0 <= i < len(filtered_shops)]
        except Exception as e:
             console.print(f"[red]Invalid selection: {e}[/red]")
             return []
             
    elif choice == "4":
        console.print("\n[bold cyan]Manage Site Credentials (Cookies/User-Agent)[/bold cyan]")
        console.print("To bypass Cloudflare/Akamai protection:")
        console.print("1. Open the site in your OWN browser (on this machine).")
        console.print("2. Open DevTools (F12) -> Network tab.")
        console.print("3. Refresh the page and find the first HTML request.")
        console.print("4. Copy the [bold]Cookie[/bold] header and the [bold]User-Agent[/bold].")
        console.print("5. Paste them here to let the script 'impersonate' your browser.")
        
        domain = Prompt.ask("Enter domain (e.g., www.trrcshop.com) or 'global'", default="global")
        raw_cookies = Prompt.ask("Enter raw Cookie string (e.g., cf_clearance=...; other=...)")
        user_agent = Prompt.ask("Enter the exact User-Agent used")
        
        if 'cookies' not in config: config['cookies'] = {}
        if domain not in config['cookies']: config['cookies'][domain] = {}
        
        if raw_cookies:
            if '=' in raw_cookies:
                for part in raw_cookies.split(';'):
                    if '=' in part:
                        try:
                            k, v = part.strip().split('=', 1)
                            config['cookies'][domain][k] = v
                        except: pass
            else:
                config['cookies'][domain]['cf_clearance'] = raw_cookies.strip()
        
        if user_agent: 
            config['cookies'][domain]['User-Agent'] = user_agent.strip()
        
        save_config(config)
        console.print(f"[green]Configuration saved for {domain}![/green]")
        return display_menu(shops, indexed_urls) 
        
    elif choice == "q":
        return []
        
    return shops

def generate_shop_index():
    shops = parse_shops_html()
    if not shops:
        console.print("[red]No shops found to index.[/red]")
        return

    # Load existing index
    index_map = {}
    if os.path.exists('shop-search-index.json'):
         with open('shop-search-index.json', 'r', encoding='utf-8') as f:
             try:
                old_index = json.load(f)
                index_map = {item['url']: item for item in old_index}
             except:
                index_map = {}

    indexed_urls = set(index_map.keys())
    console.print(f"[green]Found {len(shops)} shops in total. {len(indexed_urls)} already indexed.[/green]")
    
    selected_shops = display_menu(shops, indexed_urls)
    
    if not selected_shops:
        console.print("[yellow]No shops selected. Exiting.[/yellow]")
        return
        
    console.print(f"\n[bold green]Starting scrape for {len(selected_shops)} shops...[/bold green]")
        
    # We will update `index_map` with new results
    scanned_stats = []
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        TimeElapsedColumn(),
        console=console
    ) as progress:
        
        overall_task = progress.add_task("[cyan]Overall Progress", total=len(selected_shops))
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_shop = {executor.submit(get_shop_data_deep, shop): shop for shop in selected_shops}
            
            for future in concurrent.futures.as_completed(future_to_shop):
                shop = future_to_shop[future]
                try:
                    result = future.result()
                    if result:
                        current_content = result['data']['content']
                        
                        # Check if content is empty (just the category/content prefix)
                        is_empty_scrape = current_content.strip().endswith("Content:") or current_content.strip().endswith("Content: ")
                        
                        # Only add/update if it's not an empty scrape
                        if not is_empty_scrape:
                            index_map[result['data']['url']] = result['data']
                        
                        scanned_stats.append(result['stats'])
                except Exception as exc:
                    console.print(f"[red]Generated an exception for {shop['name']}: {exc}[/red]")
                
                progress.advance(overall_task)
                
    # Convert map back to list
    final_index = list(index_map.values())
    
    json_output = json.dumps(final_index, ensure_ascii=False, indent=2)
    with open('shop-search-index.json', 'w', encoding='utf-8') as f:
        f.write(json_output)
        
    # Print Report
    console.print("\n[bold cyan]Scan Report:[/bold cyan]")
    report_table = Table(show_header=True, header_style="bold magenta")
    report_table.add_column("Shop Name", style="yellow")
    report_table.add_column("URL", style="blue")
    report_table.add_column("Pages Scanned", justify="right", style="green")
    report_table.add_column("Chars Scanned", justify="right", style="cyan")

    total_chars_added = 0
    for stat in scanned_stats:
        report_table.add_row(stat['name'], stat['url'], str(stat['pages']), f"{stat['chars']:,}")
        total_chars_added += stat.get('chars', 0)
        
    console.print(report_table)
    console.print(Panel(f"[bold green]Successfully generated shop index![/bold green]\nTotal Chars Added: [bold cyan]{total_chars_added:,}[/bold cyan]\nTotal JSON Size: {len(json_output):,} characters", border_style="green"))

if __name__ == "__main__":
    try:
        generate_shop_index()
    except KeyboardInterrupt:
        console.print("\n[red]Process interrupted by user.[/red]")
