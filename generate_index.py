import os
import json
from bs4 import BeautifulSoup

def generate_index():
	wiki_dir = 'wiki'
	search_index = []
	
	if not os.path.exists(wiki_dir):
		print(f"Directory {wiki_dir} not found.")
		return

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
	
	with open('search-index.json', 'w', encoding='utf-8') as f:
		json.dump(search_index, f, ensure_ascii=False, indent=2)
	
	print(f"Generated index with {len(search_index)} items.")

if __name__ == "__main__":
	generate_index()
