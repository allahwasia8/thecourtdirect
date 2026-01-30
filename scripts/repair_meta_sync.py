import json
from pathlib import Path

posts_path = Path("public/data/blog-posts.json")
individual_dir = Path("public/data/posts")

def repair():
    if not posts_path.exists():
        print("Main list not found")
        return
        
    with open(posts_path, "r", encoding="utf-8") as f:
        posts = json.load(f)
        
    repaired_count = 0
    missing_in_list = 0
    
    for post in posts:
        post_id = post['id']
        file_path = individual_dir / f"{post_id}.json"
        
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            # Check if file is missing desc but list has it
            if not data.get('metaDescription') and post.get('metaDescription'):
                data['metaDescription'] = post['metaDescription']
                data['metaTitle'] = post.get('metaTitle', post['title'])
                
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2)
                repaired_count += 1
            
            if not post.get('metaDescription'):
                missing_in_list += 1

    print(f"Repaired files: {repaired_count}")
    print(f"Items still missing in list: {missing_in_list}")

repair()
