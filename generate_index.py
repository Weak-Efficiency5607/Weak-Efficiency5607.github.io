import os
import json
import re
from bs4 import BeautifulSoup

def generate_index():
    wiki_dir = 'wiki'
    md_dir = os.path.join(wiki_dir, 'markdown')
    search_index = []
    
    if not os.path.exists(wiki_dir):
        print(f"Directory {wiki_dir} not found.")
        return

    # Index HTML files
    for filename in os.listdir(wiki_dir):
        if filename.endswith('.html'):
            filepath = os.path.join(wiki_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')
                
                # Extract title
                title_tag = soup.find('title')
                title = title_tag.get_text() if title_tag else filename
                
                # Extract main content
                content_section = soup.find('section', class_='card')
                if content_section:
                    # Get all text and clean it up
                    text_content = content_section.get_text(separator=' ', strip=True)
                else:
                    text_content = soup.get_text(separator=' ', strip=True)
                
                search_index.append({
                    'title': title,
                    'url': f'wiki/{filename}',
                    'content': text_content
                })

    # Index Markdown files
    if os.path.exists(md_dir):
        for filename in os.listdir(md_dir):
            if filename.endswith('.md'):
                filepath = os.path.join(md_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                    # Extract title from first header or filename
                    title_match = re.search(r'^#+\s+(.*)', content, re.MULTILINE)
                    if title_match:
                        title = title_match.group(1).strip()
                    else:
                        title = filename.replace('.md', '').replace('_', ' ').title()
                    
                    # Clean markdown for search content
                    # Remove markdown headers, bold, links, etc.
                    clean_content = re.sub(r'#+\s+', '', content)
                    clean_content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', clean_content)
                    clean_content = re.sub(r'[*_]{1,3}', '', clean_content)
                    clean_content = ' '.join(clean_content.split()) # Normalize whitespace
                    
                    # The URL will point to actions.html with a query param
                    item_id = filename.replace('.md', '')
                    search_index.append({
                        'title': title,
                        'url': f'actions.html?md={item_id}',
                        'content': clean_content
                    })

    with open('search-index.json', 'w', encoding='utf-8') as f:
        json.dump(search_index, f, ensure_ascii=False, indent=2)
    
    print(f"Generated index with {len(search_index)} items.")

if __name__ == "__main__":
    generate_index()
