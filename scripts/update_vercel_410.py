import json
import os
from urllib.parse import urlparse

VERCEL_JSON_PATH = 'd:/thecourtdirect/vercel.json'
URLS_FILE_PATH = 'd:/thecourtdirect/data/404_urls.txt'
API_ENDPOINT = '/api/gone'

def load_urls(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        # Strip quotes and whitespace, ignore empty lines
        urls = [line.strip().strip('"') for line in f if line.strip()]
    return urls

def load_vercel_config(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def update_vercel_config(config, urls):
    if 'rewrites' not in config:
        config['rewrites'] = []

    # Get paths from URLs
    paths_to_remove = set()
    for url in urls:
        parsed = urlparse(url)
        path = parsed.path
        if path:
             # Normalize path (ensure leading slash, strip trailing slash optionally if needed, but vercel matches exact usually for SPA or regex)
             # Actually, for vercel rewrites, we can match specific paths.
             # Note: logic should match the exact path requested.
             paths_to_remove.add(path)

    # Create new rewrites for these paths to point to 410 endpoint
    # We want these to take precedence, so we might want to put them at the TOP of the rewrites list 
    # OR before the general catch-all rewrite.
    
    new_rewrites = []
    for path in paths_to_remove:
        # Avoid duplicates if already exists?
        # A simple source match.
        # Note: Some paths might have query parameters in the input list, but we probably only care about the path for the rewrite source unless we use regex.
        # The input list has some URLs with query params.
        
        # We need to handle exact paths.
        new_rewrite = {
            "source": path,
            "destination": API_ENDPOINT
        }
        new_rewrites.append(new_rewrite)

    # Filter out existing catch-all if it exists to place ours before it, or just prepend.
    # Existing config has: {"source": "/(.*)", "destination": "/index.html"}
    # We must place our 410s BEFORE the catch-all.
    
    # Let's keep existing non-catch-all rewrites, add ours, then the catch-all.
    # Identify catch-all: typically source "/(.*)"
    
    other_rewrites = []
    catch_all_rewrite = None
    
    for rewrite in config.get('rewrites', []):
        if rewrite.get('source') == '/(.*)':
            catch_all_rewrite = rewrite
        else:
            other_rewrites.append(rewrite)
            
    # Combine: existing specific -> new 410s -> catch-all
    # Also deduplicate just in case
    
    # We will just append our new rewrites to other_rewrites, then append catch_all
    # But wait, we should check if any of these specific paths already have a rewrite and override/remove it?
    # Assuming we want to force 410, we can just prepend or append to specific list.
    
    final_rewrites = other_rewrites + new_rewrites
    if catch_all_rewrite:
        final_rewrites.append(catch_all_rewrite)
        
    config['rewrites'] = final_rewrites
    return config

def main():
    if not os.path.exists(URLS_FILE_PATH):
        print(f"URL file not found: {URLS_FILE_PATH}")
        return

    if not os.path.exists(VERCEL_JSON_PATH):
        print(f"Vercel config not found: {VERCEL_JSON_PATH}")
        return

    urls = load_urls(URLS_FILE_PATH)
    print(f"Loaded {len(urls)} URLs to process.")

    config = load_vercel_config(VERCEL_JSON_PATH)
    print("Loaded vercel.json.")

    updated_config = update_vercel_config(config, urls)
    
    with open(VERCEL_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(updated_config, f, indent=2)
    
    print(f"Updated vercel.json with {len(urls)} new 410 rules.")

if __name__ == "__main__":
    main()
