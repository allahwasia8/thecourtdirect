#!/usr/bin/env python3
"""
Copy all blog post images to /public/images/ directory
"""

import os
import json
import shutil
from pathlib import Path

def extract_image_paths(project_root):
    """Extract all unique image paths from blog posts"""
    posts_dir = os.path.join(project_root, "public", "data", "posts")
    image_paths = set()
    
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(posts_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Get main image
                if 'image' in data and data['image']:
                    image_paths.add(data['image'])
                    
            except Exception as e:
                print(f"Error reading {filename}: {e}")
    
    return image_paths

def find_and_copy_images():
    """Find images and copy them to /public/images/"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Get all image paths from JSON
    image_paths = extract_image_paths(project_root)
    print(f"Found {len(image_paths)} unique image references")
    
    # Directories to search for images
    search_dirs = [
        os.path.join(project_root, "public"),
        os.path.join(project_root, "src", "assets"),
        project_root,
    ]
    
    # Target directory
    target_dir = os.path.join(project_root, "public", "images")
    os.makedirs(target_dir, exist_ok=True)
    
    found = 0
    not_found = []
    copied = 0
    
    for img_path in image_paths:
        # Skip if already in reviewers subdirectory
        if '/reviewers/' in img_path or '\\reviewers\\' in img_path:
            continue
            
        # Extract just the filename
        img_filename = os.path.basename(img_path)
        
        # Check if already exists in target
        target_path = os.path.join(target_dir, img_filename)
        if os.path.exists(target_path):
            found += 1
            continue
        
        # Search for the file
        file_found = False
        for search_dir in search_dirs:
            for root, dirs, files in os.walk(search_dir):
                # Skip node_modules and .git
                dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist']]
                
                if img_filename in files:
                    source_path = os.path.join(root, img_filename)
                    try:
                        shutil.copy2(source_path, target_path)
                        print(f"✓ Copied: {img_filename}")
                        copied += 1
                        file_found = True
                        break
                    except Exception as e:
                        print(f"✗ Error copying {img_filename}: {e}")
            
            if file_found:
                break
        
        if not file_found:
            not_found.append(img_filename)
            found += 1  # Count as processed
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Total images referenced: {len(image_paths)}")
    print(f"  Already existed: {found - copied}")
    print(f"  Newly copied: {copied}")
    print(f"  Not found: {len(not_found)}")
    
    if not_found and len(not_found) <= 20:
        print(f"\nNot found files:")
        for img in not_found[:20]:
            print(f"  - {img}")

if __name__ == "__main__":
    find_and_copy_images()
