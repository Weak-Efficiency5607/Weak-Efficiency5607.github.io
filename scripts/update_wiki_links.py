import urllib.request
import urllib.parse
import json
import re
import time
import os
import sys
import msvcrt

try:
    from rich.console import Console
    from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
    from rich.panel import Panel
    from rich.table import Table
    from rich.prompt import Prompt
except ImportError:
    print("Please install the 'rich' library first: pip install rich")
    sys.exit(1)

console = Console()

current_dir = os.path.dirname(os.path.abspath(__file__))
actions_filepath = os.path.join(current_dir, '..', 'js', 'actions.js')
search_filepath = os.path.join(current_dir, '..', 'search-index.json')

if not os.path.exists(actions_filepath):
    console.print(f"[bold red]Error:[/bold red] Could not find actions.js at {actions_filepath}")
    sys.exit(1)
if not os.path.exists(search_filepath):
    console.print(f"[bold red]Error:[/bold red] Could not find search-index.json at {search_filepath}")
    sys.exit(1)

validated_filepath = os.path.join(current_dir, 'validated_links.json')

def load_data():
    with open(actions_filepath, 'r', encoding='utf-8') as f:
        actions_content = f.read()

    with open(search_filepath, 'r', encoding='utf-8') as f:
        try:
            search_index = json.load(f)
        except json.JSONDecodeError as e:
            console.print(f"[bold red]Error decoding JSON from search-index.json:[/bold red] {e}")
            sys.exit(1)

    match = re.search(r'const wikiData = (\{.*?\});', actions_content, re.DOTALL)
    if not match:
        console.print("[bold red]Error:[/bold red] Could not find wikiData in actions.js")
        sys.exit(1)

    try:
        wiki_data = json.loads(match.group(1))
    except json.JSONDecodeError as e:
        console.print(f"[bold red]Error decoding JSON from actions.js:[/bold red] {e}")
        sys.exit(1)
        
    validated_links = {}
    if os.path.exists(validated_filepath):
        with open(validated_filepath, 'r', encoding='utf-8') as f:
            try:
                validated_links = json.load(f)
            except json.JSONDecodeError:
                pass

    return actions_content, match, wiki_data, search_index, validated_links

def save_data(actions_content, match, wiki_data, search_index):
    new_wiki_data_str = json.dumps(wiki_data, indent=4)
    new_actions_content = actions_content[:match.start(1)] + new_wiki_data_str + actions_content[match.end(1):]

    with open(actions_filepath, 'w', encoding='utf-8') as f:
        f.write(new_actions_content)

    with open(search_filepath, 'w', encoding='utf-8') as f:
        json.dump(search_index, f, indent=4, ensure_ascii=False)
    console.print("\n[green]Successfully saved changes to files.[/green]\n")

def get_wikipedia_link(title):
    search_term = title
    if " / " in title:
        search_term = title.split(" / ")[0]
    search_term = re.sub(r'\(.*?\)', '', search_term).strip()
    search_term = re.sub(r'\s+\d+$', '', search_term).strip()
    
    url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={urllib.parse.quote(search_term)}&limit=1&namespace=0&format=json"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'AnhedoniaResourceHubBot/1.0 (pakoskiv@gmail.com)'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            if len(data) >= 4 and len(data[3]) > 0:
                return data[3][0]
    except Exception:
        return None
    return None

def fetch_missing_links(actions_content, match, wiki_data, search_index):
    updated_count = 0
    not_found_count = 0
    already_found_count = 0

    total_items = sum(len(items) for items in wiki_data.values()) + len(search_index)
    console.print(Panel.fit("[bold blue]Starting Wikipedia Link Fetcher[/bold blue]", subtitle="Anhedonia Resource Hub"))

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TaskProgressColumn(),
        console=console
    ) as progress:
        
        task = progress.add_task("[cyan]Processing substances...", total=total_items)
        
        for category, items in wiki_data.items():
            for item in items:
                title = item.get('title', 'Unknown')
                if 'wiki' in item and str(item['wiki']).startswith('http'):
                    already_found_count += 1
                    progress.advance(task)
                    continue
                    
                progress.update(task, description=f"[cyan]Searching (Static): {title}...")
                link = get_wikipedia_link(title)
                if link:
                    item['wiki'] = link
                    updated_count += 1
                    progress.console.print(f"[green]OK Found:[/green] {title} -> [link={link}]{link}[/link]")
                else:
                    if 'wiki' in item:
                        del item['wiki']
                    not_found_count += 1
                    progress.console.print(f"[yellow]X Not found:[/yellow] {title}")
                    
                time.sleep(0.5)
                progress.advance(task)
                
        for item in search_index:
            title = item.get('title', 'Unknown')
            if 'wiki' in item and str(item['wiki']).startswith('http'):
                already_found_count += 1
                progress.advance(task)
                continue
                
            progress.update(task, description=f"[cyan]Searching (Dynamic): {title}...")
            link = get_wikipedia_link(title)
            if link:
                item['wiki'] = link
                updated_count += 1
                progress.console.print(f"[green]OK Found:[/green] {title} -> [link={link}]{link}[/link]")
            else:
                if 'wiki' in item:
                    del item['wiki']
                not_found_count += 1
                progress.console.print(f"[yellow]X Not found:[/yellow] {title}")
                
            time.sleep(0.5)
            progress.advance(task)

    save_data(actions_content, match, wiki_data, search_index)
    
    console.print(f"• [cyan]Newly added:[/cyan] {updated_count}")
    console.print(f"• [green]Already existing:[/green] {already_found_count}")
    console.print(f"• [yellow]Not found/Removed:[/yellow] {not_found_count}\n")


def get_input_with_arrows(prompt_text):
    console.print(prompt_text, end="")
    user_input = ""
    while True:
        if msvcrt.kbhit():
            ch = msvcrt.getch()
            if ch in (b'\xe0', b'\x00'):
                arrow = msvcrt.getch()
                if arrow == b'K': # Left arrow
                    print()
                    return 'p'
                elif arrow == b'M': # Right arrow
                    print()
                    return 'n'
            elif ch == b'\r': # Enter
                print()
                return user_input if user_input else 'n'
            elif ch == b'\x08': # Backspace
                if len(user_input) > 0:
                    user_input = user_input[:-1]
                    sys.stdout.write('\b \b')
                    sys.stdout.flush()
            else:
                try:
                    char = ch.decode('utf-8')
                    if char.isprintable():
                        user_input += char
                        sys.stdout.write(char)
                        sys.stdout.flush()
                except UnicodeDecodeError:
                    pass
        time.sleep(0.01)

def review_links(actions_content, match, wiki_data, search_index, validated_links):
    items_with_links = []
    
    # Collect items
    for category, items in wiki_data.items():
        for item in items:
            if 'wiki' in item and str(item['wiki']).startswith('http'):
                items_with_links.append(("Static", item))
                
    for item in search_index:
        if 'wiki' in item and str(item['wiki']).startswith('http'):
            items_with_links.append(("Dynamic", item))

    if not items_with_links:
        console.print("[yellow]No links found to review![/yellow]\n")
        return
        
    page_size = 20
    current_page = 0
    
    while True:
        total_pages = max(1, (len(items_with_links) + page_size - 1) // page_size)
        start_idx = current_page * page_size
        end_idx = min(start_idx + page_size, len(items_with_links))
        
        table = Table(title=f"Reviewing Links (Page {current_page + 1} of {total_pages})")
        table.add_column("ID", style="cyan", justify="right")
        table.add_column("Type", style="magenta")
        table.add_column("Title", style="green")
        table.add_column("Wikipedia URL", style="blue")
        table.add_column("Validated", style="bold green", justify="center")
        
        for i in range(start_idx, end_idx):
            src, item = items_with_links[i]
            title = item.get('title', 'Unknown')
            is_valid = "✔" if validated_links.get(title) else ""
            table.add_row(str(i + 1), src, title, item['wiki'], is_valid)
            
        console.print(table)
        
        user_input = get_input_with_arrows(
            "Enter [cyan]ID(s)[/cyan] to remove (e.g. 1-3), [green]'v'+ID(s)[/green] to validate (e.g. v4-6), [yellow]Arrows[/yellow] for pages, or [red]'q'[/red] to menu: "
        ).strip().lower()
        
        if user_input == 'q':
            break
        elif user_input == 'n':
            if current_page < total_pages - 1:
                current_page += 1
            else:
                console.print("[yellow]Already on the last page.[/yellow]")
        elif user_input == 'p':
            if current_page > 0:
                current_page -= 1
            else:
                console.print("[yellow]Already on the first page.[/yellow]")
        else:
            try:
                tokens = [x.strip() for x in user_input.split(',')]
                ids_to_remove = []
                ids_to_validate = []
                
                for t in tokens:
                    if not t: continue
                    
                    is_validate = t.startswith('v')
                    content = t[1:] if is_validate else t
                    
                    if '-' in content:
                        parts = content.split('-')
                        if len(parts) == 2 and parts[0].strip().isdigit() and parts[1].strip().isdigit():
                            start_id = int(parts[0].strip())
                            end_id = int(parts[1].strip())
                            if start_id > end_id:
                                start_id, end_id = end_id, start_id
                                
                            for i in range(start_id, end_id + 1):
                                if is_validate:
                                    ids_to_validate.append(i)
                                else:
                                    ids_to_remove.append(i)
                    else:
                        if content.strip().isdigit():
                            val = int(content.strip())
                            if is_validate:
                                ids_to_validate.append(val)
                            else:
                                ids_to_remove.append(val)
                
                if not ids_to_remove and not ids_to_validate:
                    console.print("[bold red]No valid IDs provided.[/bold red]")
                    continue
                    
                removed_count = 0
                validated_count = 0
                
                for idx in ids_to_remove:
                    real_idx = idx - 1
                    if 0 <= real_idx < len(items_with_links):
                        src, item = items_with_links[real_idx]
                        if 'wiki' in item:
                            del item['wiki']
                            removed_count += 1
                            console.print(f"[red]Removed link from:[/red] {item.get('title', 'Unknown')}")
                            
                for idx in ids_to_validate:
                    real_idx = idx - 1
                    if 0 <= real_idx < len(items_with_links):
                        src, item = items_with_links[real_idx]
                        title = item.get('title', 'Unknown')
                        validated_links[title] = True
                        validated_count += 1
                        console.print(f"[green]Validated link for:[/green] {title}")
                
                if removed_count > 0:
                    save_data(actions_content, match, wiki_data, search_index)
                    # Re-collect items_with_links to reflect changes
                    items_with_links = [ (s, it) for (s, it) in items_with_links if 'wiki' in it ]
                    
                if validated_count > 0:
                    with open(validated_filepath, 'w', encoding='utf-8') as f:
                        json.dump(validated_links, f, indent=4, ensure_ascii=False)
                        
                if removed_count > 0 or validated_count > 0:
                    total_pages = max(1, (len(items_with_links) + page_size - 1) // page_size)
                    if current_page >= total_pages:
                        current_page = max(0, total_pages - 1)
            except ValueError:
                console.print("[bold red]Invalid input.[/bold red]")


def main_menu():
    actions_content, match, wiki_data, search_index, validated_links = load_data()
    
    while True:
        console.print(Panel.fit("[bold blue]Anhedonia Wikipedia Link Manager[/bold blue]", subtitle="Interactive CLI"))
        console.print("1. Fetch missing Wikipedia links automatically")
        console.print("2. Review existing links (and remove/validate ones)")
        console.print("3. Exit")
        
        choice = Prompt.ask("\nSelect an option", choices=["1", "2", "3"])
        
        if choice == "1":
            fetch_missing_links(actions_content, match, wiki_data, search_index)
            # reload data after fetching
            actions_content, match, wiki_data, search_index, validated_links = load_data()
        elif choice == "2":
            review_links(actions_content, match, wiki_data, search_index, validated_links)
        elif choice == "3":
            console.print("[green]Goodbye![/green]")
            break

if __name__ == "__main__":
    main_menu()
