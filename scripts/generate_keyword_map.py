import json
import re
from pathlib import Path
from collections import defaultdict

# Paths
POSTS_PATH = Path("public/data/blog-posts.json")
COURTS_PATH = Path("public/data/courts.json")
OUTPUT_PATH = Path("public/data/keyword_map.json")

def generate_map():
    keyword_map = {} # keyword -> list of {url, type, weight}
    
    # 1. Process Blog Posts
    print("Processing Blog Posts...", flush=True)
    with open(POSTS_PATH, "r", encoding="utf-8") as f:
        posts = json.load(f)
        
    for post in posts:
        url = f"/blog/{post['id']}"
        title = post['title']
        
        # High priority: Exact title match
        clean_title = title.lower().strip()
        if clean_title not in keyword_map:
            keyword_map[clean_title] = []
        keyword_map[clean_title].append({"url": url, "type": "blog", "weight": 10})
        
        # Medium priority: Extraction topics
        # Remove common prefixes/suffixes
        prefixes = ["how to", "guide to", "understanding", "what is", "benefits of", "tips for"]
        temp_title = clean_title
        for p in prefixes:
            if temp_title.startswith(p):
                temp_title = temp_title[len(p):].strip()
        
        # Remove " in [Year]", " - [SiteName]" etc if present
        temp_title = re.sub(r'\s+in\s+\d{4}', '', temp_title)
        
        if len(temp_title) > 4 and temp_title != clean_title:
             if temp_title not in keyword_map:
                 keyword_map[temp_title] = []
             keyword_map[temp_title].append({"url": url, "type": "blog", "weight": 8})

    # 2. Process Courts
    print("Processing Courts...", flush=True)
    with open(COURTS_PATH, "r", encoding="utf-8") as f:
        courts = json.load(f)
        
    for court in courts:
        url = f"/court/{court['id']}"
        name = court['name']
        city = court['city']
        state = court['state']
        
        # High priority: Exact Name
        clean_name = name.lower().strip()
        if clean_name not in keyword_map:
             keyword_map[clean_name] = []
        keyword_map[clean_name].append({"url": url, "type": "court", "weight": 10})

        # "Court in [City]"
        city_key = f"court in {city}".lower()
        if city_key not in keyword_map:
             keyword_map[city_key] = []
        keyword_map[city_key].append({"url": url, "type": "court", "weight": 7})
        
        # "[City] Court"
        city_court_key = f"{city} court".lower()
        if city_court_key not in keyword_map:
             keyword_map[city_court_key] = []
        keyword_map[city_court_key].append({"url": url, "type": "court", "weight": 7})

    # 3. Add General State and City Links (New Strategy)
    # Collect all unique states and cities
    unique_states = set(c['state'] for c in courts if c.get('state'))
    unique_cities = set(c['city'] for c in courts if c.get('city'))

    for state in unique_states:
        # "Texas Courts", "Courts in Texas" -> /find-court?state=Texas
        if not state: continue
        target_url = f"/find-court?state={state}"
        
        # Variations
        variations = [
            f"{state} courts",
            f"courts in {state}",
            f"{state} law",
            f"legal system in {state}"
        ]
        
        for kw in variations:
            kw = kw.lower()
            if kw not in keyword_map:
                keyword_map[kw] = []
            keyword_map[kw].append({"url": target_url, "type": "search", "weight": 9})

    for city in unique_cities:
        # "Miami Courts" -> /find-court?search=Miami
        if not city: continue
        target_url = f"/find-court?search={city}"
        
        variations = [
            f"{city} courts",
            f"courts in {city}"
        ]
        
        for kw in variations:
            kw = kw.lower()
            # Don't overwrite specific court names if they match
            if kw not in keyword_map:
                keyword_map[kw] = []
            keyword_map[kw].append({"url": target_url, "type": "search", "weight": 6})

    # 3. Clean and Save
    # Sort candidates by weight
    final_map = {}
    for k, v in keyword_map.items():
        # Deduplicate by URL, keep highest weight
        unique_targets = {}
        for item in v:
            if item['url'] not in unique_targets or item['weight'] > unique_targets[item['url']]['weight']:
                unique_targets[item['url']] = item
        
        # Create sorted list (highest weight first)
        final_list = sorted(unique_targets.values(), key=lambda x: x['weight'], reverse=True)
        final_map[k] = final_list[0] # For now, just take the best 1 to avoid complexity
        
    print(f"Generated {len(final_map)} keywords.", flush=True)
    
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(final_map, f, indent=2)

if __name__ == "__main__":
    generate_map()
