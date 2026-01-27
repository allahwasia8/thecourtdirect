import json
import os
import urllib.parse
import shutil

def normalize_filenames():
    json_path = r"d:\thecourtdirect\public\data\blog-posts.json"
    images_dir = r"d:\thecourtdirect\public\images"
    
    with open(json_path, 'r', encoding='utf-8') as f:
        posts = json.load(f)
        
    # Build a map of lowercase local filename -> actual local filename
    local_files = os.listdir(images_dir)
    local_map = {f.lower(): f for f in local_files}
    
    renamed_count = 0
    matched_count = 0
    
    for post in posts:
        remote_url = post.get('image')
        if not remote_url: continue
        
        try:
            filename = remote_url.split('/')[-1]
            filename = urllib.parse.unquote(filename)
        except:
            continue
            
        lower_name = filename.lower()
        
        if lower_name in local_map:
            current_name = local_map[lower_name]
            
            # If Content Matches (names are equal ignoring case)
            if current_name != filename:
                # Rename it to match the JSON casing exactly
                src = os.path.join(images_dir, current_name)
                dst = os.path.join(images_dir, filename)
                
                # Handle case where file exists but casing is different (Windows is tricky here)
                # Rename to temp then to target
                temp = src + ".tmp"
                os.rename(src, temp)
                os.rename(temp, dst)
                
                # Update map
                local_map[lower_name] = filename
                renamed_count += 1
                # print(f"Renamed {current_name} -> {filename}")
            else:
                matched_count += 1
                
    print(f"Total Matches Checked: {matched_count + renamed_count}")
    print(f"Renamed Files: {renamed_count}")
    print(f"Already Exact: {matched_count}")

if __name__ == "__main__":
    normalize_filenames()
