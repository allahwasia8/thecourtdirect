#!/usr/bin/env python3
"""
Analyze image references in blog posts and provide solution
"""

import os
import json
from urllib.parse import urlparse

def analyze_images():
    posts_dir = r"d:\thecourtdirect\public\data\posts"
    
    local_refs = []
    external_urls = []
    missing = []
    
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(posts_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                if 'image' in data and data['image']:
                    img = data['image']
                    
                    if img.startswith('http'):
                        external_urls.append((filename, img))
                    elif img.startswith('/'):
                        local_refs.append((filename, img))
                    
            except Exception as e:
                pass
    
    print("="*60)
    print("IMAGE ANALYSIS REPORT")
    print("="*60)
    print(f"\nTotal posts analyzed: {len(os.listdir(posts_dir))}")
    print(f"External URLs (http/https): {len(external_urls)}")
    print(f"Local references (/images/): {len(local_refs)}")
    
    if external_urls:
        print(f"\nSample external URLs:")
        for filename, url in external_urls[:5]:
            print(f"  {filename}: {url}")
    
    if local_refs:
        print(f"\nSample local references:")
        for filename, img in local_refs[:5]:
            print(f"  {filename}: {img}")
            # Check if file exists
            img_path = os.path.join(r"d:\thecourtdirect\public", img.lstrip('/'))
            exists = os.path.exists(img_path)
            print(f"    Exists: {exists}")

if __name__ == "__main__":
    analyze_images()
