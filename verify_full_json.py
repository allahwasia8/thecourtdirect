import json

# Load the JSON file
with open('thecourtdirect.WordPress.2026-01-21.full.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get the items
items = data['rss']['channel']['item']

# Count and display
print(f'✅ Total posts converted: {len(items)}')
print(f'\n📋 First 10 post titles:')
for i, item in enumerate(items[:10], 1):
    print(f'{i}. {item["title"]}')

print(f'\n... and {len(items) - 10} more posts')
