import json
import os

def check_and_fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        modified = False
        
        # Handle list of posts or single post object
        items = []
        is_list = False
        
        if isinstance(data, list):
            items = data
            is_list = True
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
            
            new_title = title
            if "&#8217;" in new_title:
                new_title = new_title.replace("&#8217;", "'")
            if "’" in new_title:
                new_title = new_title.replace("’", "'")
            
            if new_title != title:
                print(f"Fixing title in {filepath}:")
                print(f"  Old: {title}")
                print(f"  New: {new_title}")
                item['title'] = new_title
                modified = True

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                # If it was a list, write 'items' (which is 'data' reference). 
                # If it was a dict, write 'items[0]'
                if is_list:
                    json.dump(items, f, indent=2, ensure_ascii=False)
                else:
                    json.dump(items[0], f, indent=2, ensure_ascii=False)
                print(f"Saved {filepath}")

    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    base_dir = r"d:\thecourtdirect\public\data\posts"
    print(f"Scanning directory: {base_dir}")
    
    if os.path.exists(base_dir):
        for filename in os.listdir(base_dir):
            if filename.endswith(".json"):
                 check_and_fix_file(os.path.join(base_dir, filename))
    else:
        print(f"Directory not found: {base_dir}")
    
    # Check master file
    master_file = r"d:\thecourtdirect\thecourtdirect_posts.json"
    if os.path.exists(master_file):
        print(f"Scanning master file: {master_file}")
        check_and_fix_file(master_file)

if __name__ == "__main__":
    main()
