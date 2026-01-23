import json
import os
import urllib.parse

def find_working_post():
    json_path = r"d:\thecourtdirect\public\data\blog-posts.json"
    images_dir = r"d:\thecourtdirect\public\images"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        posts = json.load(f)
        
    local_files = set(os.listdir(images_dir))
    
    print(f"Total local images: {len(local_files)}")
    
    for post in posts:
        remote_url = post.get('image')
        if not remote_url: continue
        
        # Logic from imageUtils.ts
        try:
            filename = remote_url.split('/')[-1]
            filename = urllib.parse.unquote(filename)
        except:
            continue
            
        if filename in local_files:
            print(f"MATCH FOUND!")
            print(f"Post Title: {post['title']}")
            print(f"Slug: {post['id']}")
            print(f"Image: {filename}")
            return

    print("No matches found yet.")

if __name__ == "__main__":
    find_working_post()
