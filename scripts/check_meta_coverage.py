import json
from pathlib import Path

posts_path = Path("public/data/blog-posts.json")
courts_path = Path("public/data/courts.json")

def check_coverage(path, name):
    if not path.exists():
        print(f"{name}: File not found")
        return
        
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    total = len(data)
    with_desc = sum(1 for item in data if item.get('metaDescription'))
    
    print(f"{name}: {with_desc}/{total} ({with_desc/total*100:.1f}%) have metaDescription")

check_coverage(posts_path, "Blog Posts")
check_coverage(courts_path, "Courts")
