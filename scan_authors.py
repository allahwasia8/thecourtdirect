import json
import os

def scan_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
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
            
            author = item.get('author', '')
            if not author:
                print(f"Missing Author in: {filepath}")

    except Exception as e:
        print(f"Error reading {filepath}: {e}")

def main():
    base_dir = r"d:\thecourtdirect\public\data\posts"
    print(f"Scanning directory for missing authors: {base_dir}")
    
    missing_count = 0
    total_count = 0
    
    if os.path.exists(base_dir):
        for filename in os.listdir(base_dir):
            if filename.endswith(".json"):
                total_count += 1
                filepath = os.path.join(base_dir, filename)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                        if isinstance(data, dict):
                             if not data.get('author'):
                                 print(f"Missing Author in: {filename}")
                                 missing_count += 1
                        elif isinstance(data, list):
                            for i, post in enumerate(data):
                                if isinstance(post, dict) and not post.get('author'):
                                    print(f"Missing Author in: {filename} (item {i})")
                                    missing_count += 1
                except Exception as e:
                    print(f"Error checking {filename}: {e}")

    print(f"Scan complete. {missing_count} files missing author out of {total_count} checked.")

if __name__ == "__main__":
    main()
