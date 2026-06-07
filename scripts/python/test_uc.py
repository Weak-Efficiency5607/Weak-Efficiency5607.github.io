import os
import sys
import time
from rich.console import Console

console = Console()

# Add UndetectedChromeDriver local path (relative to the repo root)
script_dir = os.path.dirname(os.path.abspath(__file__))
uc_path = os.path.abspath(os.path.join(script_dir, '..', '..', '..', 'UndetectedChromeDriver'))

if os.path.exists(uc_path) and uc_path not in sys.path:
    sys.path.insert(0, uc_path)

try:
    import undetected_chromedriver as uc
except ImportError:
    console.print("[red]Could not import undetected_chromedriver. Ensure the path is correct.[/red]")
    sys.exit(1)

def run_uc_test(target_url=None):
    from rich.prompt import Prompt
    if not target_url:
        target_url = Prompt.ask("Enter the URL of the shop to test", default="https://www.trrcshop.com")
        
    if not target_url.startswith("http"):
        target_url = "https://" + target_url

    console.print(f"[cyan]Initializing UndetectedChromeDriver to test {target_url}...[/cyan]")
    
    # We use headless=False by default for testing to see if it pops up and solves it
    options = uc.ChromeOptions()
    options.add_argument("--headless=new")
    
    try:
        driver = uc.Chrome(options=options, version_main=148)
        console.print("[green]Browser launched successfully.[/green]")
        
        console.print(f"[cyan]Navigating to {target_url} and waiting for Cloudflare challenge (15 seconds)...[/cyan]")
        driver.get(target_url)
        time.sleep(15)
        
        cookies = driver.get_cookies()
        user_agent = driver.execute_script("return navigator.userAgent;")
        
        console.print(f"[green]Successfully grabbed {len(cookies)} cookies.[/green]")
        console.print(f"[dim]User-Agent: {user_agent}[/dim]")
        
        # Check if we have cf_clearance
        has_clearance = any(c['name'] == 'cf_clearance' for c in cookies)
        if has_clearance:
            console.print("[bold green]SUCCESS: Found 'cf_clearance' cookie. Bypassed successfully![/bold green]")
        else:
            console.print("[bold yellow]WARNING: No 'cf_clearance' cookie found. Site might not be protected right now, or bypass failed.[/bold yellow]")
            
        driver.quit()
        
    except Exception as e:
        import traceback
        console.print(f"[bold red]Error during test:[/bold red]")
        console.print(traceback.format_exc())
