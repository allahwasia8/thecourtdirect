import json
import os

COURTS_FILE = 'public/data/courts.json'
COURTS_UPDATED_FILE = 'public/data/courts_updated.json'
BLOG_POSTS_FILE = 'public/data/blog-posts.json'
SITE_NAME = 'The Court Direct'

def fix_courts():
    print(f"Loading {COURTS_FILE}...")
    if not os.path.exists(COURTS_FILE):
        print("Error: courts.json not found")
        return

    with open(COURTS_FILE, 'r', encoding='utf-8') as f:
        courts = json.load(f)

    # Optional: Merge from courts_updated.json if it exists
    if os.path.exists(COURTS_UPDATED_FILE):
        print(f"Merging from {COURTS_UPDATED_FILE}...")
        with open(COURTS_UPDATED_FILE, 'r', encoding='utf-8') as f:
            updated_courts = json.load(f)
        
        # Create a map for easy merge
        updated_map = {c['id']: c for c in updated_courts}
        for court in courts:
            if court['id'] in updated_map:
                upd = updated_map[court['id']]
                if upd.get('metaTitle'): court['metaTitle'] = upd['metaTitle']
                if upd.get('metaDescription'): court['metaDescription'] = upd['metaDescription']
                if upd.get('website') and not court.get('website'):
                    court['website'] = upd['website']

    fixed_count = 0
    for court in courts:
        modified = False
        
        # Ensure metaTitle
        if not court.get('metaTitle') or court['metaTitle'].strip() == "":
            court['metaTitle'] = f"{court['name']} | Address, Phone & Info | {SITE_NAME}"
            modified = True
        
        # Ensure metaDescription
        if not court.get('metaDescription') or court['metaDescription'].strip() == "":
            city_state = f" in {court.get('city', '')}, {court.get('state', '')}".replace(" , ", " ")
            court['metaDescription'] = f"Find contact information, address, and judicial details for {court['name']}{city_state}. Access directions and court resources online."
            modified = True
            
        if modified:
            fixed_count += 1

    print(f"Fixed {fixed_count} court records.")
    
    with open(COURTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(courts, f, indent=2)
    print("Saved courts.json")

def fix_blog_posts():
    print(f"Loading {BLOG_POSTS_FILE}...")
    if not os.path.exists(BLOG_POSTS_FILE):
        print("Error: blog-posts.json not found")
        return

    with open(BLOG_POSTS_FILE, 'r', encoding='utf-8') as f:
        posts = json.load(f)

    fixed_count = 0
    for post in posts:
        modified = False
        
        if not post.get('metaTitle') or post['metaTitle'].strip() == "":
            post['metaTitle'] = f"{post['title']} | {SITE_NAME}"
            modified = True
            
        if not post.get('metaDescription') or post['metaDescription'].strip() == "":
            # Use excerpt if available, else generic
            desc = post.get('excerpt', post.get('title', ''))
            if len(desc) > 160:
                desc = desc[:157] + "..."
            post['metaDescription'] = desc
            modified = True
            
        if modified:
            fixed_count += 1
            
    print(f"Fixed {fixed_count} blog post records.")
    
    with open(BLOG_POSTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2)
    print("Saved blog-posts.json")

if __name__ == "__main__":
    fix_courts()
    fix_blog_posts()
    print("Done!")
