import json
from pathlib import Path

posts_path = Path("public/data/blog-posts.json")
individual_dir = Path("public/data/posts")

def check_sync():
    if not posts_path.exists():
        print("Main list not found")
        return
        
    with open(posts_path, "r", encoding="utf-8") as f:
        posts = json.load(f)
        
    missing_count = 0
    total = len(posts)
    
    for post in posts[:20]: # Check first 20
        post_id = post['id']
        file_path = individual_dir / f"{post_id}.json"
        
        has_list_desc = bool(post.get('metaDescription'))
        
        has_file_desc = False
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                has_file_desc = bool(data.get('metaDescription'))
        
        print(f"Post {post_id[:20]}...: List={has_list_desc}, File={has_file_desc}")
        if has_list_desc and not has_file_desc:
            missing_count += 1

    print(f"\nPotential issues found in first 20: {missing_count}")

check_sync()
