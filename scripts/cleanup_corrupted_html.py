
import json
import os
from bs4 import BeautifulSoup

def clean_html(html_content):
    if not html_content:
        return html_content
    
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all internal-link tags
    links = soup.find_all('a', class_='internal-link')
    
    for link in links:
        # If this link has another <a> inside it, it's corrupted
        inner_a = link.find('a')
        if inner_a:
            # Unwrap the link but keep the text
            # We'll just take the innermost text to be safe
            link.replace_with(link.get_text())
            
    # Also handle the specific case seen: <a> inside <h1>
    # The user reported seeing tags inside what looks like a title or header
    
    return str(soup)

def process_files():
    posts_dir = "public/data/posts"
    modified_count = 0
    
    if not os.path.exists(posts_dir):
        print(f"Directory {posts_dir} not found")
        return

    for filename in os.listdir(posts_dir):
        if filename.endswith(".json"):
            filepath = os.path.join(posts_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                except:
                    continue
            
            original_content = data.get('content', '')
            if original_content:
                cleaned = clean_html(original_content)
                if cleaned != original_content:
                    data['content'] = cleaned
                    with open(filepath, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    modified_count += 1
                    print(f"Cleaned: {filename}")

    print(f"Finished. Cleaned {modified_count} files.")

if __name__ == "__main__":
    process_files()
