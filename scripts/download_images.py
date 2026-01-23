#!/usr/bin/env python3
"""
Download all blog post images from WordPress URLs and update JSON references
"""

import os
import json
import requests
from urllib.parse import urlparse
import time

def download_images():
    """Download images from WordPress URLs"""
    posts_dir = r"d:\thecourtdirect\public\data\posts"
    images_dir = r"d:\thecourtdirect\public\images"
    
    os.makedirs(images_dir, exist_ok=True)
    
    downloaded = 0
    skipped = 0
    errors = []
    updated_posts = []
    
    # Get all posts
    post_files = [f for f in os.listdir(posts_dir) if f.endswith('.json')]
    total = len(post_files)
    
    print(f"Processing {total} blog posts...")
    print("="*60)
    
    for i, filename in enumerate(post_files, 1):
        filepath = os.path.join(posts_dir, filename)
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            modified = False
            
            # Check main image
            if 'image' in data and data['image']:
                old_url = data['image']
                
                # Skip if already local or reviewer image
                if old_url.startswith('/images/reviewers/'):
                    skipped += 1
                    continue
                
                # Download if WordPress URL
                if old_url.startswith('http'):
                    # Extract filename
                    parsed = urlparse(old_url)
                    img_filename = os.path.basename(parsed.path)
                    local_path = os.path.join(images_dir, img_filename)
                    
                    # Download if doesn't exist
                    if not os.path.exists(local_path):
                        try:
                            print(f"[{i}/{total}] Downloading: {img_filename}")
                            response = requests.get(old_url, timeout=30, stream=True)
                            response.raise_for_status()
                            
                            with open(local_path, 'wb') as img_file:
                                for chunk in response.iter_content(chunk_size=8192):
                                    img_file.write(chunk)
                            
                            downloaded += 1
                            time.sleep(0.5)  # Be nice to server
                            
                        except Exception as e:
                            errors.append(f"{filename}: {str(e)}")
                            print(f"  ✗ Error: {str(e)[:50]}")
                            continue
                    else:
                        skipped += 1
                    
                    # Update JSON to local path
                    data['image'] = f"/images/{img_filename}"
                    modified = True
                
                # Update local path format if needed
                elif old_url.startswith('/images/'):
                    # Already correct format
                    pass
            
            # Save if modified
            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                updated_posts.append(filename)
                
        except Exception as e:
            errors.append(f"{filename}: {str(e)}")
            print(f"[{i}/{total}] ✗ Error processing {filename}")
    
    print("\n" + "="*60)
    print("DOWNLOAD SUMMARY")
    print("="*60)
    print(f"Total posts processed: {total}")
    print(f"Images downloaded: {downloaded}")
    print(f"Skipped (existing/local): {skipped}")
    print(f"JSON files updated: {len(updated_posts)}")
    print(f"Errors: {len(errors)}")
    
    if errors and len(errors) <= 10:
        print(f"\nErrors encountered:")
        for err in errors[:10]:
            print(f"  - {err}")

if __name__ == "__main__":
    # Install requests if needed
    try:
        import requests
    except ImportError:
        print("Installing requests library...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'requests'])
        import requests
    
    download_images()
