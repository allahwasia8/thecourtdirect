import json
import time
import random
import requests
import urllib.parse
from bs4 import BeautifulSoup
import os
import sys

# Configuration
COURTS_FILE = 'public/data/courts.json'
OUTPUT_FILE = 'public/data/courts_updated.json' # Save to new file first for safety
LOG_FILE = 'scripts/batch_update_log.txt'
BATCH_SIZE = 5  # Save every 5 records
DELAY_MIN = 30  # Minimum delay in seconds (to be exceedingly polite)
DELAY_MAX = 60  # Maximum delay

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
            # decode DDG redirection
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
            
    return search_results[:5] # Top 5 is enough

def generate_metadata(court, results):
    """
    Generates Meta Title and Description based on court info and SERP top result.
    """
    
    # Default fallback
    base_title = f"{court['name']} - {court['city']}, {court['state']}"
    base_desc = f"Find contact information, address, and details for {court['name']} in {court['city']}, {court['state']}."
    
    if not results:
        return base_title, base_desc

    top_result = results[0]
    
    # Strategy: 
    # Title: Use {Court Name} - {Official/Common Name from SERP} if appropriate, else keep standard format.
    # Actually, a standard, clean title is often better for directory sites.
    # Let's stick to a robust standard: "{Court Name} | Address & Phone | The Court Direct"
    # But user asked to "Add accordingly" from SERP. 
    # Let's use SERP to find the "Official" description if possible.
    
    new_title = f"{court['name']} - {court.get('types', ['Court'])[0]} | Address & Phone"
    
    # Try to find a .gov snippet for description
    best_desc = base_desc
    for res in results:
        if '.gov' in res['link'] or '.org' in res['link']:
            # Use snippet if it looks like a description
            if len(res['snippet']) > 50:
                best_desc = res['snippet']
                break
    
    # Clean up snippet
    if "..." in best_desc:
        best_desc = best_desc.split("...")[0] + "."
        
    return new_title, best_desc

def main():
    if not os.path.exists(COURTS_FILE):
        log(f"File not found: {COURTS_FILE}")
        return

    try:
        with open(COURTS_FILE, 'r', encoding='utf-8') as f:
            courts = json.load(f)
    except Exception as e:
        log(f"Error reading JSON: {e}")
        return

    log(f"Loaded {len(courts)} courts.")
    
    # Limit for testing/batching
    limit_arg = next((arg for arg in sys.argv if arg.startswith('--limit=')), None)
    limit = int(limit_arg.split('=')[1]) if limit_arg else len(courts)
    
    updated_count = 0
    
    for i, court in enumerate(courts[:limit]):
        # Skip if already has custom metadata (optional check, currently overwriting as requested)
        # if court.get('metaTitle') and court.get('metaDescription'):
        #     continue

        query = f"{court['name']} {court['city']} {court['state']} official site"
        log(f"[{i+1}/{limit}] Searching: {query}")
        
        results = ddg_search(query)
        
        new_title, new_desc = generate_metadata(court, results)
        
        court['metaTitle'] = new_title
        court['metaDescription'] = new_desc
        
        # Also update website if missing and a .gov link is found
        if not court.get('website') and results:
            for res in results:
                if '.gov' in res['link']:
                    court['website'] = res['link']
                    log(f"  -> Found website: {res['link']}")
                    break

        updated_count += 1
        
        # Save periodically
        if updated_count % BATCH_SIZE == 0:
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(courts, f, indent=2)
            log(f"  -> Saved progress to {OUTPUT_FILE}")

        # Sleep to avoid rate limits
        sleep_time = random.randint(DELAY_MIN, DELAY_MAX)
        log(f"  -> Sleeping {sleep_time}s...")
        time.sleep(sleep_time)

    # Final save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(courts, f, indent=2)
    log("Batch update completed.")

if __name__ == "__main__":
    main()
