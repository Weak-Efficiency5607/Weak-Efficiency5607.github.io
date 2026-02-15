import os
import json
import re
from bs4 import BeautifulSoup
import requests
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint

# Initialize Rich Console
console = Console()

# Ensure we are in the root directory relative to this script
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(script_dir, '..'))

def clean_name(name):
    # Remove citations like [1]
    name = re.sub(r'\[\d+\]', '', name)
    # Remove leading numbers that look like list items (e.g., "1. Substance")
    name = re.sub(r'^\d+[\.\)]\s*', '', name)
    # Remove trailing/leading punctuation and weird symbols
    name = name.strip('.,:;()[]"\'#$%-+&*=_/ ')
    
    # Remove strings that are just numbers or hex-like codes or pure quantities
    if re.match(r'^[0-9a-fA-F\-\s\.]+$', name) and len(name) < 15:
        if not any(c.isalpha() for c in name):
            return None
            
    # Remove strings starting with numbers followed by generic units or space
    units_pattern = r'points?|score|pcs|iu|packet|tube|bag|sachet|unit|item|pair|set|lot|bundle|kit|deal|offer|hot|best|top|new|arrived|latest|trending|popular|recommend|wishlist|compare|quick|fast|free|cheap|legal|pure|high|quality|lab|tested|certified|guarantee|secure|private|discrete|stealth|tracking|delivered|arrived|received|bought|purchased|ordered|returned|refund|canceled|delayed|lost|stolen|broken|damaged|expired|bad|good|review|rating|comment|feedback|user|author|admin|moderator|forum|thread|post|topic|reply|message|email|phone|address|location|country|state|city|zip|code|link|url|http|https|www|µl|ml|mg|g|kg|oz|lb|pcs|tabs?|caps?|softgels?|vials?|amps?|ampoules?|sachets?|bottles?|packs?|units?|sets?|lots?|bundles?|kits?|deals?|offers?|items?|pairs?|sleeves?|sponges?|masks?|pads?|toys?|brushes?|buffers?|points?|hours?|years?|days?|weeks?|months?|minutes?|seconds?|customers?|genes?|patients?|stems?|degrees?|eur|usd|gbp|sheets?|wipes?|pills?|tablets?|products?|orders?|countries?|total|count|pieces?|box|boxes'
    if re.match(rf'^\d+\.?\d*\s*({units_pattern})(\s|$)', name, re.I):
        return None

    # Remove strings that are just repetitive zeros or weird quantities
    if re.match(r'^000+\s*', name):
        return None

    # Remove percentages at start
    if re.match(r'^\d+%(\s|$)', name):
        return None

    # Remove common filler words and section titles
    if name.lower() in ['and', 'of', 'for', 'the', 'with', 'a', 'an', 'h', 'mt', 'to', 'in', 'on', 'at', 'by', 'is', 'it', 'or', 'new', 'all', 'shop', 'introduction', 'conclusion', 'summary', 'abstract', 'results', 'discussion']:
        return None
        
    # Remove very short strings
    if len(name) < 2:
        return None
        
    # Remove things that look like Wikipedia metadata or technical noise
    noise_patterns = [
        'wikipedia:', 'category:', 'file:', 'portal:', 'help:', 'template:', 'special:', 'talk:', 'user:', 
        'identifier:', 'doi:', 'pmid:', 'isbn:', 'page=', 'index.php', 'action=', 'title=',
        'find your size', 'clear scaling', 'uncategorized', 'size guide', 'fit guide', 'add to cart',
        'customer support', 'read more', 'continue reading', 'posted on', 'leave a comment', 
        'find us', 'follow us', 'facebook', 'twitter', 'instagram', 'youtube', 'linkedin',
        'privacy policy', 'terms of service', 'cookie policy', 'shipping policy', 'return policy',
        'archives', 'kategoria:', 'archiwa', 'product categories', 'search for:', 'all rights reserved',
        'click here', 'shop now', 'subscribe', 'newsletter', 'account', 'login', 'register',
        'checkout', 'item(s', 'items in cart', 'wishlist', 'compare', 'quick view', 'details',
        'description', 'additional information', 'reviews', 'related products', 'featured products',
        'sale!', 'out of stock', 'in stock', 'on sale', 'best seller', 'top rated',
        'disclaimer', 'guarantee', 'secure payment', 'fast delivery', 'worldwide shipping',
        'usa customers', 'eu customers', 'uk customers', 'shipping from', 'track order',
        'my account', 'forgot password', 'reset password', 'verify email'
    ]
    if any(x in name.lower() for x in noise_patterns):
        return None

    # Remove purely numerical/symbolical strings
    if not any(c.isalpha() for c in name):
        return None

    # Remove commercial noise
    commercial_terms = [
        'price', 'order', 'shipping', 'sold', 'stock', 'cart', 'checkout', 'login', 'account', 'register', 
        'policy', 'terms', 'privacy', 'contact', 'about', 'blog', 'news', 'faq', 'help', 'search', 'results', 
        'view', 'details', 'menu', 'home', 'shop', 'product', 'items', 'featured', 'sale', 'save', 'off', 
        'discount', 'code', 'coupon', 'promo', 'gift', 'card', 'usd', 'eur', 'gbp', 'cad', 'aud', 'gram', 
        'kg', 'mg', 'oz', 'pounds', 'lbs', 'count', 'capsule', 'tablet', 'pill', 'bottle', 'pack', 'unit', 
        'set', 'lot', 'bundle', 'kit', 'deal', 'offer', 'hot', 'best', 'top', 'new', 'arrived', 'latest', 
        'trending', 'popular', 'recommend', 'wishlist', 'compare', 'quick', 'fast', 'free', 'cheap', 'legal', 
        'pure', 'high', 'quality', 'lab', 'tested', 'certified', 'guarantee', 'secure', 'private', 'discrete', 
        'stealth', 'tracking', 'delivered', 'arrived', 'received', 'bought', 'purchased', 'ordered', 'returned', 
        'refund', 'canceled', 'delayed', 'lost', 'stolen', 'broken', 'damaged', 'expired', 'bad', 'good', 
        'review', 'rating', 'comment', 'feedback', 'user', 'author', 'admin', 'moderator', 'forum', 'thread', 
        'post', 'topic', 'reply', 'message', 'email', 'phone', 'address', 'location', 'country', 'state', 
        'city', 'zip', 'code', 'link', 'url', 'http', 'https', 'www', '/piece', '/gm', '/ml', '/capsule', 
        '/tab', '/vial', 'facebook', 'group', 'join', 'community', 'subscribe', 'follow', 'share', 'tweet'
    ]
    
    # Exact generic garbage words
    garbage_words = {
        'face', 'facebook', 'twitter', 'instagram', 'youtube', 'linkedin', 'pinterest', 'google', 
        'amazon', 'ebay', 'paypal', 'visa', 'mastercard', 'stripe', 'bitpay', 'coinbase',
        'fake', 'fantastic', 'extra', 'extreme', 'super', 'ultra', 'mega', 'pro', 'plus',
        'fact', 'facts', 'questions', 'answers', 'support', 'contact', 'about', 'home',
        'search', 'cart', 'checkout', 'orders', 'refunds', 'privacy', 'terms', 'policy',
        'blog', 'news', 'articles', 'categories', 'tags', 'archives', 'uncategorized',
        'size', 'sizes', 'color', 'colors', 'colour', 'colours', 'type', 'types',
        'brand', 'brands', 'model', 'models', 'version', 'versions', 'update', 'updates',
        'introduction', 'intro', 'conclusion', 'summary', 'abstract', 'results', 'discussion'
    }
    
    if name.lower() in garbage_words:
        return None

    if any(x in name.lower() for x in commercial_terms):
        # Allow some valid substances that might contain these words if they are part of a larger name
        # but block if they ARE the name or just a noise prefix/suffix
        if len(name.split()) > 3: # Longer names are more likely to be legitimate descriptions
             pass
        elif name.lower() in commercial_terms:
            return None

    # Remove strings that are too long
    if len(name) > 40:
        return None

    return name

def get_local_substances(progress, task):
    substances = set()
    
    # 1. From Wiki directory
    wiki_dir = 'wiki'
    if os.path.exists(wiki_dir):
        files = [f for f in os.listdir(wiki_dir) if f.endswith('.html')]
        progress.update(task, total=len(files), description="Scanning Wiki files...")
        for filename in files:
            name = filename.replace('.html', '')
            for prefix in ['alone-', 'multiple-', 'product-']:
                if name.startswith(prefix):
                    name = name[len(prefix):]
            
            substances.add(name.replace('-', ' ').title())
            substances.add(name.replace('-', '-').upper())
            
            try:
                with open(os.path.join(wiki_dir, filename), 'r', encoding='utf-8') as f:
                    soup = BeautifulSoup(f, 'html.parser')
                    title = soup.title.get_text() if soup.title else ""
                    if title:
                        clean_t = title.split(' - ')[0].split('|')[0].strip()
                        substances.add(clean_t)
            except:
                pass
            progress.advance(task)
    
    # 2. From search-index.json
    if os.path.exists('search-index.json'):
        try:
            with open('search-index.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item in data:
                    if 'title' in item:
                        substances.add(item['title'])
        except:
            pass

    # 3. From glossary.html
    if os.path.exists('glossary.html'):
        try:
            with open('glossary.html', 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')
                pre = soup.find('pre')
                if pre:
                    lines = pre.get_text().split('\n')
                    for line in lines:
                        line = line.strip()
                        if line and 2 < len(line) < 40 and not line.startswith('=='):
                            substances.add(line)
        except:
            pass

    return substances

def extract_from_shop_index():
    substances = set()
    if os.path.exists('shop-search-index.json'):
        try:
            with open('shop-search-index.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                for item in data:
                    content = item.get('content', '')
                    if ':' in content:
                        parts = content.split(':', 1)[1]
                        for s in re.split(r'[,|]', parts):
                            s = s.strip()
                            if 2 < len(s) < 30:
                                substances.add(s)
                    
                    title = item.get('title', '')
                    if title and 2 < len(title) < 30:
                        substances.add(title)
        except:
            pass
    return substances

def scrape_wikipedia_list(url, progress, task):
    substances = set()
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            content = soup.find(id="mw-content-text")
            if content:
                links = content.find_all('a', href=re.compile(r'^/wiki/'))
                for a in links:
                    text = a.get_text().strip()
                    if 2 < len(text) < 30:
                        substances.add(text)
    except:
        pass
    progress.advance(task)
    return substances

def main():
    console.print(Panel.fit("[bold blue]Substance Scraper[/bold blue]\n[cyan]Collecting substances for search autocomplete[/cyan]", border_style="blue"))
    
    stats = {}
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console
    ) as progress:
        
        # Local Extraction
        local_task = progress.add_task("Initialising scan...", total=None)
        all_substances = get_local_substances(progress, local_task)
        stats['Local Wiki'] = len(all_substances)
        
        # Shop Index
        progress.update(local_task, description="Extracting from Shop Index...")
        shop_substances = extract_from_shop_index()
        all_substances.update(shop_substances)
        stats['Shop Index'] = len(shop_substances)
        progress.advance(local_task)
        
        # Web Scraping
        wiki_urls = [
            "https://en.wikipedia.org/wiki/List_of_dietary_supplements",
            "https://en.wikipedia.org/wiki/Nootropic",
            "https://en.wikipedia.org/wiki/Category:Nootropics",
            "https://en.wikipedia.org/wiki/Category:Psychoactive_drugs"
        ]
        scrape_task = progress.add_task("Scraping Wikipedia lists...", total=len(wiki_urls))
        for url in wiki_urls:
            page_substances = scrape_wikipedia_list(url, progress, scrape_task)
            all_substances.update(page_substances)
        
        # Processing
        clean_task = progress.add_task("Cleaning and deduplicating...", total=len(all_substances))
        cleaned = set()
        for s in all_substances:
            c = clean_name(s)
            if c:
                cleaned.add(c)
            progress.advance(clean_task)
            
        final_list = []
        seen_normalized = set()
        
        # Sort to prefer "better" versions
        sorted_cleaned = sorted(list(cleaned), key=lambda x: (x.isupper(), len(x)))
        
        for s in sorted_cleaned:
            norm = re.sub(r'[^a-z0-9]', '', s.lower())
            if norm and norm not in seen_normalized:
                alpha_count = sum(1 for c in s if c.isalpha())
                if alpha_count < len(s) * 0.4:
                    continue
                if len(re.sub(r'[a-zA-Z0-9\s\-\(\)]', '', s)) > 2:
                    continue
                final_list.append(s)
                seen_normalized.add(norm)
        
        final_list.sort()
        
    # Write output
    with open('substances.json', 'w', encoding='utf-8') as f:
        json.dump(final_list, f, ensure_ascii=False, indent=2)
    
    # Final Report
    report_table = Table(title="Extraction Summary", show_header=True, header_style="bold magenta")
    report_table.add_column("Source Group", style="cyan")
    report_table.add_column("Count", justify="right", style="green")
    
    for source, count in stats.items():
        report_table.add_row(source, str(count))
    
    report_table.add_row("[bold]Total Unique Substances[/bold]", f"[bold yellow]{len(final_list)}[/bold yellow]")
    
    console.print(report_table)
    console.print(Panel(f"[bold green]Success![/bold green] Saved [bold yellow]{len(final_list)}[/bold yellow] substances to [blue]substances.json[/blue]", border_style="green"))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[red]Process interrupted by user.[/red]")
