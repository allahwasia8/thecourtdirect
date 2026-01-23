#!/usr/bin/env python3
"""
AGGRESSIVE download - Download ALL images from WordPress URLs
"""

import os
import json
import requests
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

def download_single_image(item):
    """Download a single image"""
    url, filename, local_path, post_file = item
    
    if os.path.exists(local_path):
        return {'status': 'exists', 'file': filename}
    
    try:
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()
        
        with open(local_path, 'wb') as img_file:
            for chunk in response.iter_content(chunk_size=8192):
                img_file.write(chunk)
        
        return {'status': 'downloaded', 'file': filename, 'post': post_file}
    except Exception as e:
        return {'status': 'error', 'file': filename, 'error': str(e)}

def aggressive_download():
    """Aggressively download all WordPress images"""
    posts_dir = r"d:\thecourtdirect\public\data\posts"
    images_dir = r"d:\thecourtdirect\public\images"
    
    os.makedirs(images_dir, exist_ok=True)
    
    # Collect all WordPress URLs
    download_queue = []
    
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(posts_dir, filename)
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                if 'image' in data and data['image'] and data['image'].startswith('http'):
                    from urllib.parse import urlparse
                    parsed = urlparse(data['image'])
                    img_filename = os.path.basename(parsed.path)
                    local_path = os.path.join(images_dir, img_filename)
                    
                    download_queue.append((data['image'], img_filename, local_path, filename))
                    
            except:
                pass
    
    print(f"Found {len(download_queue)} images to download")
    print("="*60)
    
    downloaded = 0
    exists = 0
    errors = 0
    
    # Download with threading
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(download_single_image, item): item for item in download_queue}
        
        for i, future in enumerate(as_completed(futures), 1):
            result = future.result()
            
            if result['status'] == 'downloaded':
                downloaded += 1
                print(f"[{i}/{len(download_queue)}] ✓ {result['file']}")
            elif result['status'] == 'exists':
                exists += 1
            else:
                errors += 1
                if errors <= 10:
                    print(f"[{i}/{len(download_queue)}] ✗ {result['file']}: {result.get('error', 'Unknown')[:50]}")
            
            if i % 50 == 0:
                print(f"Progress: {i}/{len(download_queue)} | Downloaded: {downloaded}, Exists: {exists}, Errors: {errors}")
    
    print("\n" + "="*60)
    print("FINAL SUMMARY")
    print("="*60)
    print(f"Total URLs: {len(download_queue)}")
    print(f"Downloaded: {downloaded}")
    print(f"Already existed: {exists}")
    print(f"Errors: {errors}")

if __name__ == "__main__":
    aggressive_download()
