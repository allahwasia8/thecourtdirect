import json

# Load the JSON file
with open('thecourtdirect.WordPress.2026-01-21.full.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get the items
items = data['rss']['channel']['item']

# Check a sample item
print('Sample item keys:')
sample = items[0]
for key in sorted(sample.keys()):
    if 'post' in key.lower():
        print(f'  {key}: {sample[key][:100] if isinstance(sample[key], str) else sample[key]}')

print('\n\nFull sample item (first one):')
print(json.dumps(sample, indent=2, ensure_ascii=False)[:2000])
