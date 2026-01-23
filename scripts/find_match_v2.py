import json
import os
import urllib.parse

def find_working_post():
    json_path = r"d:\thecourtdirect\public\data\blog-posts.json"
    images_dir = r"d:\thecourtdirect\public\images"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        posts = json.load(f)
        
    local_files = []
    for f in os.listdir(images_dir):
        path = os.path.join(images_dir, f)
        if os.path.isfile(path) and os.path.getsize(path) > 100:
            local_files.append(f)
            
    local_files_set = set(local_files)
    print(f"Total valid image files: {len(local_files)}")
    
    print("\n--- CHECKING MATCHES ---")
    matches = 0
    for post in posts:
        remote_url = post.get('image')
        if not remote_url: continue
        
        try:
            filename = remote_url.split('/')[-1]
            filename = urllib.parse.unquote(filename)
        except:
            continue
            
        if filename in local_files_set:
            print(f"MATCH! Post: '{post['title']}' (id: {post['id']}) -> Image: {filename}")
            matches += 1
            if matches >= 3: break
            
    if matches == 0:
        print("No matches.")
        print("Sample locals:", local_files[:5])
        print("Sample expected:", [p.get('image', '').split('/')[-1] for p in posts[:5] if p.get('image')])

if __name__ == "__main__":
    find_working_post()
