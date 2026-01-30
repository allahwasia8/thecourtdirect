import json
import os
from pathlib import Path

posts_path = Path("public/data/blog-posts.json")
individual_dir = Path("public/data/posts")

def find_ghosts():
    if not posts_path.exists(): return
    with open(posts_path, "r", encoding="utf-8") as f:
        posts = json.load(f)
    
    known_slugs = {p['id'] for p in posts}
    all_files = list(individual_dir.glob("*.json"))
    
    ghosts = []
    for file_path in all_files:
        slug = file_path.stem
        if slug not in known_slugs:
            ghosts.append(slug)
            
    print(f"Total files in folder: {len(all_files)}")
    print(f"Known slugs in list: {len(known_slugs)}")
    print(f"Ghost posts found: {len(ghosts)}")
    
    if ghosts:
        print(f"First 5 ghosts: {ghosts[:5]}")
        
        # Optionally add them to the list
        for slug in ghosts:
            try:
                with open(individual_dir / f"{slug}.json", "r", encoding="utf-8") as f:
                    data = json.load(f)
                    posts.append({
                        "id": slug,
                        "title": data.get('title', slug),
                        "excerpt": data.get('excerpt', ''),
                        "author": data.get('author', 'A Mark'),
                        "date": data.get('date', 'January 23, 2026'),
                        "category": data.get('category', 'Legal Information'),
                        "categories": data.get('categories', ['Legal Information']),
                        "image": data.get('image', '')
                    })
            except:
                pass
        
        with open(posts_path, "w", encoding="utf-8") as f:
            json.dump(posts, f, indent=2)
        print("Updated blog-posts.json with ghosts.")

find_ghosts()
