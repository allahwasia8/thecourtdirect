import json
import os
import urllib.parse

def audit_images():
    json_path = r"d:\thecourtdirect\public\data\blog-posts.json"
    images_dir = r"d:\thecourtdirect\public\images"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        posts = json.load(f)
        
    local_files = [f for f in os.listdir(images_dir) if os.path.isfile(os.path.join(images_dir, f))]
    local_map = {f.lower(): f for f in local_files}
    
    total_posts = len(posts)
    posts_with_image = 0
    matches = 0
    mismatches = 0
    
    missing_list = []
    
    for post in posts:
        remote_url = post.get('image')
        if not remote_url: continue
        posts_with_image += 1
        
        try:
            filename = remote_url.split('/')[-1]
            filename = urllib.parse.unquote(filename)
        except:
            continue
            
        if filename.lower() in local_map:
            matches += 1
        else:
            missing_list.append(filename)
    
    print(f"Total Posts: {total_posts}")
    print(f"Posts with Image URL: {posts_with_image}")
    print(f"Local Images Found: {len(local_files)}")
    print(f"Direct Matches (Name+Content): {matches}")
    print(f"Missing Images: {len(missing_list)}")
    
    if len(missing_list) > 0:
        print("\nSample Missing Files:")
        for m in missing_list[:10]:
            print(f" - {m}")

if __name__ == "__main__":
    audit_images()
