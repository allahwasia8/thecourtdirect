#!/usr/bin/env python3
"""
Retry downloading failed images and report on WordPress URLs that still exist
"""

import os
import json
import requests
import time

def retry_failed_downloads():
    """Find and retry downloading images that failed"""
    posts_dir = r"d:\thecourtdirect\public\data\posts"
    images_dir = r"d:\thecourtdirect\public\images"
    
    wordpress_urls = []
    local_missing = []
    
    # Check all posts
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(posts_dir, filename)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if 'image' in data and data['image']:
                    img_url = data['image']
                    
                    # Still has WordPress URL
                    if img_url.startswith('http'):
                        wordpress_urls.append({
                            'file': filename,
                            'url': img_url
                        })
                    # Local reference but file doesn't exist
                    elif img_url.startswith('/images/'):
                        img_filename = os.path.basename(img_url)
                        local_path = os.path.join(images_dir, img_filename)
                        
                        if not os.path.exists(local_path):
                            local_missing.append({
                                'file': filename,
                                'path': img_url,
                                'local_file': img_filename
                            })
                            
            except Exception as e:
                pass
    
    print("="*60)
    print("IMAGE STATUS REPORT")
    print("="*60)
    print(f"Posts still with WordPress URLs: {len(wordpress_urls)}")
    print(f"Posts with local refs but missing files: {len(local_missing)}")
    
    # Try downloading WordPress URLs
    if wordpress_urls:
        print(f"\n{'='*60}")
        print(f"DOWNLOADING {len(wordpress_urls)} IMAGES FROM WORDPRESS")
        print('='*60)
        
        downloaded = 0
        failed = []
        
        for i, item in enumerate(wordpress_urls, 1):
            url = item['url']
            filename = item['file']
            
            # Extract image filename
            from urllib.parse import urlparse
            parsed = urlparse(url)
            img_filename = os.path.basename(parsed.path)
            local_path = os.path.join(images_dir, img_filename)
            
            # Skip if already exists
            if os.path.exists(local_path):
                print(f"[{i}/{len(wordpress_urls)}] ✓ Already exists: {img_filename}")
                continue
            
            # Download
            try:
                print(f"[{i}/{len(wordpress_urls)}] Downloading: {img_filename}")
                response = requests.get(url, timeout=30, stream=True)
                response.raise_for_status()
                
                with open(local_path, 'wb') as img_file:
                    for chunk in response.iter_content(chunk_size=8192):
                        img_file.write(chunk)
                
                downloaded += 1
                
                # Update JSON
                post_path = os.path.join(posts_dir, filename)
                with open(post_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                data['image'] = f"/images/{img_filename}"
                
                with open(post_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                time.sleep(0.3)  # Be nice to server
                
            except Exception as e:
                failed.append({
                    'file': filename,
                    'url': url,
                    'error': str(e)
                })
                print(f"  ✗ Error: {str(e)[:60]}")
        
        print(f"\n{'='*60}")
        print("RETRY SUMMARY")
        print('='*60)
        print(f"Successfully downloaded: {downloaded}")
        print(f"Failed: {len(failed)}")
        
        if failed:
            print(f"\nFailed downloads (sample):")
            for item in failed[:10]:
                print(f"  {item['file']}: {item['error'][:50]}")

if __name__ == "__main__":
    retry_failed_downloads()
