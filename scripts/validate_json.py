import json
import os

def validate_json_files():
    posts_dir = r"d:\thecourtdirect\public\data\posts"
    corrupted_files = []
    
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(posts_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    json.load(f)
            except json.JSONDecodeError as e:
                print(f"Corrupted file: {filename}")
                print(f"  Error: {e}")
                corrupted_files.append((filename, str(e)))
    
    if not corrupted_files:
        print("All JSON files are valid!")
    else:
        print(f"\nFound {len(corrupted_files)} corrupted files.")
        with open(r"d:\thecourtdirect\corrupted_json_report.json", 'w') as f:
            json.dump(corrupted_files, f, indent=2)

if __name__ == "__main__":
    validate_json_files()
