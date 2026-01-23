import json
import os

def scan_file(filepath, outfile):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        titles_found = []
        
        # Handle list of posts or single post object
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            items = [data]
        else:
            return

        for item in items:
            if not isinstance(item, dict):
                continue
            
            title = item.get('title', '')
            if not title:
                continue

            if "&#8217;" in title or "’" in title:
                titles_found.append(title)

        if titles_found:
            outfile.write(f"File: {filepath}\n")
            for t in titles_found:
                outfile.write(f"  Title: {t}\n")

    except Exception as e:
        outfile.write(f"Error reading {filepath}: {e}\n")

def main():
    base_dir = r"d:\thecourtdirect\public\data\posts"
    master_file = r"d:\thecourtdirect\thecourtdirect_posts.json"
    output_file = r"d:\thecourtdirect\scan_results.txt"
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write(f"Scanning directory: {base_dir}\n")
        
        if os.path.exists(base_dir):
            for filename in os.listdir(base_dir):
                if filename.endswith(".json"):
                     scan_file(os.path.join(base_dir, filename), outfile)
        
        outfile.write(f"Scanning master file: {master_file}\n")
        if os.path.exists(master_file):
            scan_file(master_file, outfile)

if __name__ == "__main__":
    main()
