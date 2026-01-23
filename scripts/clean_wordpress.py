import json
import os
import re

def clean_wordpress_artifacts(content):
    """Remove WordPress-specific classes and clean up HTML"""
    if not content:
        return content
    
    # Remove wp-block-* classes
    content = re.sub(r'\s*class="wp-block-[\w-]+"', '', content)
    content = re.sub(r'\s*class="[^"]*wp-block-[\w-]+[^"]*"', lambda m: 
                     ' class="' + ' '.join([c for c in m.group(0).split('"')[1].split() if not c.startswith('wp-')]) + '"' 
                     if any(not c.startswith('wp-') for c in m.group(0).split('"')[1].split()) else '', content)
    
    # Remove empty class attributes
    content = re.sub(r'\s*class=""', '', content)
    
    # Update WordPress image URLs to new structure
    # Old: https://thecourtdirect.com/wp-content/uploads/YYYY/MM/image.ext
    # New: /images/image.webp (since we converted to webp)
    content = re.sub(
        r'https://thecourtdirect\.com/wp-content/uploads/\d{4}/\d{2}/([\w-]+)\.(jpg|jpeg|png|webp)',
        r'/images/\1.webp',
        content
    )
    
    return content

def process_file(filepath):
    """Process a single JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        modified = False
        
        # Clean content field
        if 'content' in data and data['content']:
            cleaned_content = clean_wordpress_artifacts(data['content'])
            if cleaned_content != data['content']:
                data['content'] = cleaned_content
                modified = True
        
        # Clean excerpt field
        if 'excerpt' in data and data['excerpt']:
            cleaned_excerpt = clean_wordpress_artifacts(data['excerpt'])
            if cleaned_excerpt != data['excerpt']:
                data['excerpt'] = cleaned_excerpt
                modified = True
        
        # Update image field
        if 'image' in data and data['image']:
            old_image = data['image']
            # Update WordPress CDN URLs
            new_image = re.sub(
                r'https://thecourtdirect\.com/wp-content/uploads/\d{4}/\d{2}/([\w-]+)\.(jpg|jpeg|png|webp)',
                r'/images/\1.webp',
                old_image
            )
            if new_image != old_image:
                data['image'] = new_image
                modified = True
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    
    return False

def main():
    base_dir = r"d:\thecourtdirect\public\data\posts"
    master_file = r"d:\thecourtdirect\thecourtdirect_posts.json"
    
    count = 0
    
    # Process individual post files
    if os.path.exists(base_dir):
        for filename in os.listdir(base_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(base_dir, filename)
                if process_file(filepath):
                    count += 1
    
    print(f"Cleaned WordPress artifacts from {count} post files.")
    
    # Process master file
    if os.path.exists(master_file):
        if process_file(master_file):
            print("Cleaned WordPress artifacts from master file.")

if __name__ == "__main__":
    main()
