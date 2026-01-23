"""
WordPress REST API Post Fetcher (Final)
Fetches all published posts.
"""
import urllib.request
import urllib.parse
import json
import base64
import time
import sys

WORDPRESS_URL = "https://thecourtdirect.com"
APP_PASSWORD = "U0oZ 7aG0 CFcZ sbCi IUoq Yvi3"
USERNAME = "thecourtdirect@gmail.com"
OUTPUT_FILE = "thecourtdirect_posts.json"

def get_auth_headers():
    credentials = f"{USERNAME}:{APP_PASSWORD}"
    encoded = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
    return {
        "Authorization": f"Basic {encoded}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Python/3.9",
        "Accept": "application/json"
    }

def fetch_all_posts():
    all_posts = []
    page = 1
    per_page = 100
    headers = get_auth_headers()
    
    print(f"🚀 Starting download of ALL posts...")
    
    while True:
        params = urllib.parse.urlencode({
            'page': page,
            'per_page': per_page,
            'status': 'publish', 
            '_embed': 'true' 
        })
        url = f"{WORDPRESS_URL}/wp-json/wp/v2/posts?{params}"
        
        try:
            print(f"Fetching page {page}...", end="", flush=True)
            req = urllib.request.Request(url, headers=headers)
            
            with urllib.request.urlopen(req, timeout=60) as response:
                if response.status == 200:
                    data = response.read()
                    posts = json.loads(data)
                    
                    if not posts:
                        print(" Done! (No more posts)")
                        break
                    
                    all_posts.extend(posts)
                    print(f" Got {len(posts)} posts. (Total: {len(all_posts)})")
                    
                    page += 1
                    time.sleep(1) # Be nice
                else:
                    print(f" Error: {response.status}")
                    break
        except urllib.error.HTTPError as e:
            if e.code == 400:
                print(" Reached end of posts.")
                break
            print(f" Failed: {e}")
            break
        except Exception as e:
            print(f" Error: {e}")
            break
            
    return all_posts

def main():
    posts = fetch_all_posts()
    if posts:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Saved {len(posts)} posts to {OUTPUT_FILE}")
        
        # Verify count
        print(f"Expected: 1046. Got: {len(posts)}")
    else:
        print("\n❌ No posts fetched.")

if __name__ == "__main__":
    main()
