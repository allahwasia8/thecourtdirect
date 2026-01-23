import os
import re

def verify_links(base_dir):
    broken_links = []
    
    print(f"Verifying links in {base_dir}...")
    
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.css', '.json', '.js', '.jsx')):
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Regex to find paths ending in extension
                    # Matches keys in JSON or string literals in Code
                    # Simple pattern: look for paths /.../....(webp|jpg|png|svg)
                    matches = re.findall(r'[\"\']([^\/\n]+?\/[^\n\"\']+\.(?:webp|jpg|jpeg|png|svg))[\"\']', content)
                    
                    for match in matches:
                        # Construct absolute path to check
                        # Assumes paths starting with / are from public/
                        # Assumes relative paths are... relative? mostly we deal with /images/
                        
                        target_path = None
                        if match.startswith('/'):
                            target_path = os.path.join(r"d:\thecourtdirect\public", match.lstrip('/'))
                        elif match.startswith('@/'): # alias 
                             target_path = os.path.join(r"d:\thecourtdirect\src", match.replace('@/',''))
                        else:
                             # Try relative to file or public? 
                             # Assuming public for safety if not found relative
                             # For now, stick to absolute / paths widely used
                             pass

                        if target_path:
                            # If checking for webp, verify it exists
                            if not os.path.exists(target_path):
                                 # Maybe it's in src/assets and handled by build
                                 if match.startswith('/src/assets'):
                                     target_path = os.path.join(r"d:\thecourtdirect", match.lstrip('/'))
                                 
                                 if not os.path.exists(target_path):
                                     broken_links.append(f"File: {file} -> Link: {match}")
                                     
                except Exception as e:
                    pass # ignore read errors
    
    return broken_links

def main():
    broken = []
    broken.extend(verify_links(r"d:\thecourtdirect\src"))
    broken.extend(verify_links(r"d:\thecourtdirect\public\data"))
    
    if broken:
        print("Found Broken Links:")
        for b in broken:
            print(b)
    else:
        print("No broken links found!")

if __name__ == "__main__":
    main()
