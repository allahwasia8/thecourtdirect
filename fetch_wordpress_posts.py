"""
WordPress REST API Post Fetcher
This script fetches all posts from a WordPress site using the REST API
"""
import requests
import json
import time

# Configuration
WORDPRESS_URL = "https://thecourtdirect.com"  # Change this to your WordPress URL
OUTPUT_FILE = "wordpress_posts_via_api.json"

def fetch_all_posts(base_url):
    """Fetch all posts from WordPress REST API"""
    all_posts = []
    page = 1
    per_page = 100  # Fetch 100 posts at a time
    
    print(f"Fetching posts from: {base_url}")
    
    while True:
        url = f"{base_url}/wp-json/wp/v2/posts"
        params = {
            'page': page,
            'per_page': per_page,
            '_embed': True  # Include author, featured image, etc.
        }
        
        try:
            print(f"Fetching page {page}...")
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                posts = response.json()
                
                if not posts:  # No more posts
                    break
                
                all_posts.extend(posts)
                print(f"  ✓ Fetched {len(posts)} posts (Total: {len(all_posts)})")
                
                page += 1
                time.sleep(0.5)  # Be nice to the server
                
            elif response.status_code == 400 and page > 1:
                # We've reached the end
                print("Reached the end of posts")
                break
            else:
                print(f"Error: HTTP {response.status_code}")
                print(response.text[:200])
                break
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            break
    
    return all_posts

def main():
    print("=" * 60)
    print("WordPress REST API Post Fetcher")
    print("=" * 60)
    
    # Fetch posts
    posts = fetch_all_posts(WORDPRESS_URL)
    
    if posts:
        # Save to JSON
        print(f"\nSaving {len(posts)} posts to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Success! Exported {len(posts)} posts")
        print(f"📄 File: {OUTPUT_FILE}")
        print(f"📏 Size: {len(json.dumps(posts)) / 1024 / 1024:.2f} MB")
        
        # Show sample
        print(f"\n📋 First 5 posts:")
        for i, post in enumerate(posts[:5], 1):
            print(f"  {i}. {post['title']['rendered']}")
    else:
        print("\n❌ No posts fetched. Please check your WordPress URL.")

if __name__ == "__main__":
    main()
