import json

# Load the JSON file
with open('thecourtdirect.WordPress.2026-01-21.full.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Get the items
items = data['rss']['channel']['item']

# Count by post type
post_types = {}
for item in items:
    # Look for wp:post_type
    post_type = item.get('{http://wordpress.org/export/1.2/}post_type', 'unknown')
    post_types[post_type] = post_types.get(post_type, 0) + 1

# Display breakdown
print(f'📊 Total items: {len(items)}')
print(f'\n📋 Breakdown by type:')
for ptype, count in sorted(post_types.items(), key=lambda x: x[1], reverse=True):
    print(f'  • {ptype}: {count}')

# Count actual posts
actual_posts = [item for item in items if item.get('{http://wordpress.org/export/1.2/}post_type') == 'post']
print(f'\n✅ Actual Posts: {len(actual_posts)}')
