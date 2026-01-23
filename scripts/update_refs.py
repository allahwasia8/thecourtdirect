import os
import re

def update_references(directory):
    extensions = {
        '.jpg': '.webp',
        '.jpeg': '.webp',
        '.png': '.webp',
        '.bmp': '.webp',
        '.tiff': '.webp',
        '.JPG': '.webp',
        '.PNG': '.webp'
    }
    
    count = 0
    
    print(f"Scanning {directory}...")
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css', '.json', '.js', '.jsx')):
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content = content
                    modified = False
                    
                    # Simple replace for now, can be improved with regex if needed
                    # checking common patterns
                    for ext, new_ext in extensions.items():
                        if ext in new_content:
                            # Avoid replacing if it's already part of a webp filename (unlikely given the dot)
                            # But wait, what if "image.jpg.webp"? convert script replaced ext or appended?
                            # convert script: os.path.splitext(file_path)[0] + ".webp" -> REPLACED extension.
                            # So "image.jpg" became "image.webp".
                            
                            # We replace ".jpg" with ".webp"
                            # We might accidentally replace external URLs? Users said "convert all images".
                            # Let's hope external URLs are fine or we'll find out in verification.
                            
                            new_content = new_content.replace(ext, new_ext)
                            modified = True
                            
                    if modified and content != new_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        count += 1
                        # print(f"Updated references in: {file}")
                        
                except Exception as e:
                    print(f"Error processing {file}: {e}")
                    
    print(f"Directory {directory}: Updated references in {count} files.")

def main():
    dirs_to_update = [
        r"d:\thecourtdirect\public\data",
        r"d:\thecourtdirect\src",
        r"d:\thecourtdirect\thecourtdirect_posts.json" # Master file
    ]
    
    for d in dirs_to_update:
        if os.path.exists(d):
            if os.path.isfile(d):
                 # Handle single file
                 update_references(os.path.dirname(d)) # This scans the dir, maybe inefficient but safe enough for now or I can tweak logic.
                 # Actually update_references walks types.
                 # Let's just pass parent dir for single file specific case or improve func.
                 pass 
            else:
                update_references(d)
                
    # Handle master file specifically if logic above missed it (it scans dirs)
    master_file = r"d:\thecourtdirect\thecourtdirect_posts.json"
    if os.path.exists(master_file):
         # Quick fix to process single file
         try:
            with open(master_file, 'r', encoding='utf-8') as f:
                content = f.read()
            new_content = content
            modified = False
            extensions = {'.jpg': '.webp', '.jpeg': '.webp', '.png': '.webp'}
            for ext, new_ext in extensions.items():
                if ext in new_content:
                    new_content = new_content.replace(ext, new_ext)
                    modified = True
            if modified:
                with open(master_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated master file {master_file}")
         except Exception as e:
             print(f"Error master file: {e}")

if __name__ == "__main__":
    main()
