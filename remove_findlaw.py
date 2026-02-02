import os
import json

directory = r'd:\thecourtdirect\public\data\posts'
target_url = "https://www.findlaw.com/law.html"

modified_count = 0
total_files = 0

for filename in os.listdir(directory):
    if filename.endswith('.json'):
        filepath = os.path.join(directory, filename)
        total_files += 1
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            references = data.get('references', [])
            new_references = [ref for ref in references if ref.get('url') != target_url]
            
            if len(new_references) != len(references):
                data['references'] = new_references
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                modified_count += 1
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print(f"Total files: {total_files}")
print(f"Modified files: {modified_count}")
