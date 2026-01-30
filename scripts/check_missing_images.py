import json
from pathlib import Path

posts_path = Path('d:/thecourtdirect/public/data/blog-posts.json')
images_dir = Path('d:/thecourtdirect/public/images/blog')

with open(posts_path, 'r', encoding='utf-8') as f:
    posts = json.load(f)

missing = []
for post in posts:
    image_path = images_dir / f"{post['id']}.webp"
    if not image_path.exists():
        missing.append(post['id'])

print(f"Total Posts: {len(posts)}")
print(f"Missing Images: {len(missing)}")
if missing:
    print("First 5 missing IDs:")
    for mid in missing[:5]:
        print(f" - {mid}")
