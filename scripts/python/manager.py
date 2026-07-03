import os
import sys

# Ensure we are in the root directory relative to this script BEFORE importing
script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(os.path.join(script_dir, '..', '..'))

# Add the scripts directory to sys.path so we can import the other scripts easily
if script_dir not in sys.path:
    sys.path.insert(0, script_dir)

try:
    from rich.console import Console
    from rich.prompt import Prompt
    from rich.panel import Panel
    from rich.table import Table
except ImportError:
    print("Please install 'rich': pip install rich")
    sys.exit(1)

# Import our scripts
import generate_index as gen_idx
import generate_shop_index as gen_shop
import scrape_substances as scrape_sub
import update_wiki_links as update_wiki
import test_uc
import check_shops_availability as check_shops

console = Console()

def main():
    # Interactive Menu
    while True:
        console.print(Panel.fit("[bold blue]Anhedonia Global Manager[/bold blue]\n[cyan]Select a task to run:[/cyan]", border_style="blue"))
        table = Table(show_header=True, header_style="bold magenta", box=None)
        table.add_column("Opt", justify="right", style="cyan", no_wrap=True)
        table.add_column("Task", style="green")
        table.add_column("Description", style="dim")
        
        table.add_row("1", "Update Wiki Search Index", "Reads your local HTML files to update the central search engine for the wiki.")
        table.add_row("2", "Crawl & Index Shops", "Scrapes all vendor websites to create the search database for the 'Where to buy' section.")
        table.add_row("3", "Fetch Substance Names", "Extracts substance names from local files, shops, and Wikipedia to feed the auto-complete search bars.")
        table.add_row("4", "Manage Wikipedia Links", "Finds, adds, or removes Wikipedia preview links for substances mentioned in your wiki.")
        table.add_row("5", "Test Cloudflare Bypass", "Tests if the scraper can successfully bypass a specific shop's Cloudflare protection.")
        table.add_row("6", "Check Shops Availability", "Pings all shops to check if their websites are still online or offline.")
        table.add_row("q", "Quit", "Exit the manager.")
        console.print(table)
        
        choice = Prompt.ask("\nEnter your choice", choices=["1", "2", "3", "4", "5", "6", "q"], default="1")
        
        if choice == "1":
            console.print("\n[bold yellow]--- Running: Update Wiki Search Index ---[/bold yellow]")
            gen_idx.generate_index()
            console.print("[bold yellow]--- Finished ---[/bold yellow]\n")
        elif choice == "2":
            console.print("\n[bold yellow]--- Running: Crawl & Index Shops ---[/bold yellow]")
            gen_shop.generate_shop_index()
            console.print("[bold yellow]--- Finished ---[/bold yellow]\n")
        elif choice == "3":
            console.print("\n[bold yellow]--- Running: Fetch Substance Names ---[/bold yellow]")
            scrape_sub.scrape_substances()
            console.print("[bold yellow]--- Finished ---[/bold yellow]\n")
        elif choice == "4":
            console.print("\n[bold yellow]--- Running: Manage Wikipedia Links ---[/bold yellow]")
            update_wiki.manage_wiki_links()
            console.print("[bold yellow]--- Finished ---[/bold yellow]\n")
        elif choice == "5":
            console.print("\n[bold yellow]--- Running: Test Cloudflare Bypass ---[/bold yellow]")
            test_uc.run_uc_test()
            console.print("[bold yellow]--- Finished ---[/bold yellow]\n")
        elif choice == "6":
            console.print("\n[bold yellow]--- Running: Check Shops Availability ---[/bold yellow]")
            check_shops.run_availability_check()
            console.print("[bold yellow]--- Finished ---[/bold yellow]\n")
        elif choice == "q":
            console.print("[green]Goodbye![/green]")
            break

if __name__ == "__main__":
    main()
