import os
import requests
import concurrent.futures
import subprocess
import tempfile
import time
import shutil
import threading
from urllib.parse import urlparse
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.table import Table

try:
    import socks
    HAS_PYSOCKS = True
except ImportError:
    HAS_PYSOCKS = False

import generate_shop_index as gen_shop

console = Console()

tor_lock = threading.Lock()
tor_semaphore = threading.Semaphore(5)
tor_process = None
tor_data_dir = None
tor_failed = False
tor_bootstrapped = threading.Event()

def check_shop(shop, use_tor=False):
    url = shop['url']
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        
        proxies = None
        if use_tor:
            proxies = {
                'http': 'socks5h://127.0.0.1:9050',
                'https': 'socks5h://127.0.0.1:9050'
            }
            
        response = requests.get(url, headers=headers, timeout=20 if use_tor else 15, stream=True, proxies=proxies)
        status = response.status_code
        response.close()
        
        if status < 400 or status in [403, 503, 401]:
            return shop, "Online", f"[green]Online[/green] (HTTP {status})"
        elif status == 404:
            return shop, "Offline", f"[red]Offline[/red] (HTTP 404 Not Found)"
        else:
            return shop, "Unknown", f"[yellow]Unknown[/yellow] (HTTP {status})"
            
    except requests.exceptions.ConnectionError:
        return shop, "Offline", "[red]Offline[/red] (Connection Error/DNS)"
    except requests.exceptions.Timeout:
        return shop, "Offline", "[red]Offline[/red] (Timeout)"
    except Exception as e:
        if use_tor and "Missing dependencies" in str(e):
            return shop, "Error", "[red]Error[/red] (pysocks not installed)"
        return shop, "Error", f"[red]Error[/red] ({type(e).__name__})"

def get_or_start_tor(progress):
    global tor_process, tor_data_dir, tor_failed
    
    if tor_bootstrapped.is_set():
        return True
    if tor_failed:
        return False
        
    with tor_lock:
        if tor_bootstrapped.is_set():
            return True
        if tor_failed:
            return False
            
        # We are the first to start Tor
        task_tor = progress.add_task("[yellow]Bootstrapping Tor fallback...", total=100)
        
        tor_exe = r"C:\Tor\Tor\tor.exe"
        if not os.path.exists(tor_exe):
            console.print(f"[red]Could not find Tor executable at {tor_exe}[/red]")
            tor_failed = True
            progress.remove_task(task_tor)
            return False

        tor_data_dir = tempfile.mkdtemp(prefix="tor_data_")
        args = [
            tor_exe,
            "--SocksPort", "9050",
            "--DataDirectory", tor_data_dir,
            "--ExcludeExitNodes", "{fr},{ru}",
            "--StrictNodes", "1"
        ]
        
        tor_process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        
        start_time = time.time()
        while True:
            if tor_process.poll() is not None:
                console.print(f"[red]Tor process exited prematurely with code {tor_process.returncode}[/red]")
                tor_failed = True
                break
                
            line = tor_process.stdout.readline()
            if not line and tor_process.poll() is not None:
                break
                
            if line and "Bootstrapped" in line and "%" in line:
                try:
                    pct = int(line.split("Bootstrapped ")[1].split("%")[0])
                    progress.update(task_tor, completed=pct)
                    if pct == 100:
                        tor_bootstrapped.set()
                        progress.update(task_tor, description="[green]Tor fully bootstrapped![/green]")
                        time.sleep(1) # Let the user see the 100% completion briefly
                        progress.remove_task(task_tor)
                        break
                except Exception:
                    pass
            
            if time.time() - start_time > 60:
                console.print("[red]Timeout waiting for Tor to bootstrap.[/red]")
                tor_process.terminate()
                tor_failed = True
                break
        
        if tor_failed:
            progress.remove_task(task_tor)
            return False
            
        return True

def process_shop(shop, progress):
    shop_data, status, status_text = check_shop(shop, use_tor=False)
    
    if status != "Online":
        if not HAS_PYSOCKS:
            return shop_data, status, status_text
            
        # Try Tor fallback immediately
        if get_or_start_tor(progress):
            with tor_semaphore:
                shop_data_tor, status_tor, status_text_tor = check_shop(shop, use_tor=True)
            
            if status_tor == "Online":
                return shop_data_tor, status_tor, f"[green]Online[/green] (via Tor)"
            else:
                return shop_data_tor, status_tor, status_text_tor
        else:
            return shop_data, status, status_text
            
    return shop_data, status, status_text

def run_availability_check():
    global tor_process, tor_data_dir, tor_failed
    tor_failed = False
    tor_bootstrapped.clear()
    tor_process = None
    tor_data_dir = None
    
    shops = gen_shop.parse_shops_html()
    if not shops:
        console.print("[red]No shops found to check.[/red]")
        return

    console.print(f"[cyan]Checking availability of {len(shops)} shops...[/cyan]")
    if not HAS_PYSOCKS:
        console.print("[yellow]Warning: 'pysocks' is missing. Tor fallback will be disabled.[/yellow]")

    final_results = []
    
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TaskProgressColumn(),
            console=console
        ) as progress:
            
            task_main = progress.add_task("[cyan]Checking shops...", total=len(shops))
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=30) as executor:
                future_to_shop = {executor.submit(process_shop, shop, progress): shop for shop in shops}
                
                for future in concurrent.futures.as_completed(future_to_shop):
                    shop = future_to_shop[future]
                    try:
                        result = future.result()
                        final_results.append(result)
                    except Exception as exc:
                        console.print(f"[red]Exception for {shop['name']}: {exc}[/red]")
                        final_results.append((shop, "Error", f"[red]Error[/red] ({exc})"))
                    
                    progress.advance(task_main)
                    
    finally:
        if tor_process:
            console.print("\n[yellow]Shutting down Tor process...[/yellow]")
            tor_process.terminate()
            tor_process.wait(timeout=5)
            
        if tor_data_dir and os.path.exists(tor_data_dir):
            try:
                shutil.rmtree(tor_data_dir, ignore_errors=True)
            except:
                pass

    console.print("\n[bold cyan]Scan Complete. Final Results:[/bold cyan]")
    
    offline_shops = [r for r in final_results if r[1] != "Online"]
    offline_shops.sort(key=lambda x: (x[0]['category'], x[0]['name']))
    
    if offline_shops:
        table = Table(title="Potentially Offline or Problematic Shops", show_header=True, header_style="bold magenta")
        table.add_column("Shop Name", style="cyan")
        table.add_column("Category", style="yellow")
        table.add_column("URL", style="blue")
        table.add_column("Final Status", style="bold")
        
        for shop, status, status_text in offline_shops:
            table.add_row(shop['name'], shop['category'], shop['url'], status_text)
            
        console.print(table)
        console.print(f"[bold red]{len(offline_shops)} shops appear to be permanently offline.[/bold red]")
    else:
        console.print("[bold green]All shops were reachable (some maybe via Tor)![/bold green]")

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(os.path.join(script_dir, '..', '..'))
    run_availability_check()
