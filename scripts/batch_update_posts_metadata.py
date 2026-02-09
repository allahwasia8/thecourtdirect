import json
import time
import random
import requests
import urllib.parse
from bs4 import BeautifulSoup
import os
import sys
import glob

# Configuration
POSTS_DIR = 'public/data/posts/'
LOG_FILE = 'scripts/batch_posts_update_log.txt'
DELAY_MIN = 10  # Reduced delay for posts since there are fewer, but still polite
DELAY_MAX = 20

def log(message):
    print(message)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {message}\n")

def ddg_search(query):
    """
    Scrapes DuckDuckGo HTML results.
    """
    base_url = "https://html.duckduckgo.com/html/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Referer": "https://duckduckgo.com/"
    }
    payload = urllib.parse.urlencode({'q': query, 'kl': 'us-en'})
    
    try:
        response = requests.post(base_url, data=payload, headers=headers, timeout=15)
        response.raise_for_status()
    except Exception as e:
        log(f"Error searching for '{query}': {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    search_results = []
    
    for result in soup.select('.result__body'):
        title_tag = result.select_one('.result__title a')
        snippet_tag = result.select_one('.result__snippet')
        
        if title_tag:
            title = title_tag.text.strip()
            link = title_tag['href']
            # Decode DDG redirection
            if '/l/?kh=' in link or 'uddg=' in link:
                match = urllib.parse.parse_qs(urllib.parse.urlparse(link).query)
                if 'uddg' in match:
                    link = match['uddg'][0]

            snippet = snippet_tag.text.strip() if snippet_tag else ""
            
            search_results.append({
                'title': title,
                'link': link,
                'snippet': snippet
            })
            
    return search_results[:5]

def generate_metadata(post, results):
    """
    Generates Meta Title and Description based on post title and SERP insights.
    If results are empty, falls back to internal content optimization.
    """
    curr_title = post.get('title', '')
    curr_excerpt = post.get('excerpt', '')
    
    # Standard Title Optimization
    if "|" not in curr_title and "The Court Direct" not in curr_title:
        new_title = f"{curr_title.title()} | The Court Direct"
    else:
        new_title = curr_title

    if results:
        # SERP-based Description
        best_desc = curr_excerpt
        for res in results:
            if len(res['snippet']) > 100:
                best_desc = res['snippet']
                break
        
        # Clean up snippet
        if "..." in best_desc:
            best_desc = best_desc.split("...")[0] + "."
    else:
        # Fallback: Optimize existing excerpt
        best_desc = curr_excerpt.replace("&#8230;", "...").replace("\n", " ").strip()
        if "Understanding" not in best_desc and "Learn" not in best_desc:
            best_desc = f"Learn about {curr_title}. {best_desc}"

    # Limit length for meta description
    if len(best_desc) > 160:
        best_desc = best_desc[:157] + "..."
        
    return new_title, best_desc

def main():
    post_files = glob.glob(os.path.join(POSTS_DIR, '*.json'))
    log(f"Found {len(post_files)} post files.")
    
    limit_arg = next((arg for arg in sys.argv if arg.startswith('--limit=')), None)
    limit = int(limit_arg.split('=')[1]) if limit_arg else len(post_files)
    
    for i, file_path in enumerate(post_files[:limit]):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                post = json.load(f)
        except Exception as e:
            log(f"Error reading {file_path}: {e}")
            continue

        title = post.get('title', '')
        log(f"[{i+1}/{limit}] Processing: {title} ({os.path.basename(file_path)})")
        
        results = ddg_search(title)
        log(f"  -> Found {len(results)} results")
        new_title, new_desc = generate_metadata(post, results)
        
        post['metaTitle'] = new_title
        post['metaDescription'] = new_desc
        
        # Save updated post file
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(post, f, indent=2)
            log(f"  -> Updated meta for {os.path.basename(file_path)}")
        except Exception as e:
            log(f"Error saving {file_path}: {e}")

        # Polite delay
        if i < limit - 1:
            sleep_time = random.randint(DELAY_MIN, DELAY_MAX)
            log(f"  -> Sleeping {sleep_time}s...")
            time.sleep(sleep_time)

    log("Batch posts update completed.")

if __name__ == "__main__":
    main()
