import json
import os
import urllib.parse

def find_working_post():
    json_path = r"d:\thecourtdirect\public\data\blog-posts.json"
    images_dir = r"d:\thecourtdirect\public\images"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        posts = json.load(f)
        
    local_files = [f for f in os.listdir(images_dir) if os.path.getsize(os.path.join(images_dir, f)) > 1024]
    local_files_set = set(local_files)
    
    print(f"Total non-empty local images: {len(local_files)}")
    
    for post in posts:
        remote_url = post.get('image')
        if not remote_url: continue
        
        try:
            filename = remote_url.split('/')[-1]
            filename = urllib.parse.unquote(filename)
        except:
            continue
            
        if filename in local_files_set:
            print(f"MATCH FOUND!")
            print(f"Post Title: {post['title']}")
            print(f"Slug: {post['id']}")
            print(f"Image: {filename}")
            # return # Keep going to show a few
            
    print("Done scanning.")
    
    print("\n--- SAMPLE LOCAL FILES ---")
    for f in list(local_files)[:10]:
        print(f)
        
    print("\n--- SAMPLE EXPECTED FILES ---")
    count = 0
    for post in posts:
        remote_url = post.get('image')
        if remote_url:
            print(remote_url.split('/')[-1])
            count += 1
            if count >= 10: break

if __name__ == "__main__":
    find_working_post()
