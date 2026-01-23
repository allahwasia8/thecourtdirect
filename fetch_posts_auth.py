"""
WordPress REST API Post Fetcher (Authenticated)
Uses standard urllib to avoid dependency issues.
"""
import urllib.request
import urllib.error
import urllib.parse
import json
import base64
import time
import sys

# Configuration
WORDPRESS_URL = "https://thecourtdirect.com"
APP_PASSWORD = "U0oZ 7aG0 CFcZ sbCi IUoq Yvi3"

# List of usernames to try
USERNAMES = [
    "The Administrator", # From XML
    "admin",             # Common default
    "Abdullah",          # From XML
    "tfufc6u8876tf75fhvu;98h-9jg67fyf765v75f" # Provided in prompt
]

OUTPUT_FILE = "wordpress_posts_auth.json"

def get_auth_headers(username, password):
    """Create Basic Auth headers"""
    credentials = f"{username}:{password}"
    encoded = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
    return {
        "Authorization": f"Basic {encoded}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Python/3.9",
        "Accept": "application/json"
    }

def try_fetch_with_username(username):
    """Try to fetch posts with a specific username"""
    print(f"\n🔑 Trying username: '{username}'...")
    
    headers = get_auth_headers(username, APP_PASSWORD)
    
    # Try fetching just one post to verify credentials
    url = f"{WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1"
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=30) as response:
            if response.status == 200:
                print(f"  ✅ Authentication SUCCESS with username: {username}")
                return True
            else:
                print(f"  ❌ Status {response.status}")
                return False
    except urllib.error.HTTPError as e:
        print(f"  ❌ Authentication failed: {e.code} {e.reason}")
        # If 401, auth failed. If 403, might be perm.
        return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False

def fetch_all_posts(username):
    """Fetch all posts using the working username"""
    all_posts = []
    page = 1
    per_page = 100
    headers = get_auth_headers(username, APP_PASSWORD)
    
    print(f"\n🚀 Starting download with username '{username}'...")
    
    while True:
        params = urllib.parse.urlencode({
            'page': page,
            'per_page': per_page,
            'status': 'any', # Fetch drafts too
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
                    time.sleep(0.5)
                else:
                    print(f" Error: {response.status}")
                    break
        except urllib.error.HTTPError as e:
            if e.code == 400: # "check your p parameter" or page out of status
                print(" Reached end of posts.")
                break
            print(f" Failed: {e}")
            break
        except Exception as e:
            print(f" Error: {e}")
            break
            
    return all_posts

def main():
    print("=" * 60)
    print("WordPress REST API Authenticated Fetcher")
    print("=" * 60)
    
    valid_username = None
    
    # 1. Find working username
    for user in USERNAMES:
        if try_fetch_with_username(user):
            valid_username = user
            break
            
    if not valid_username:
        print("\n❌ Could not authenticate with any username.")
        print("Please check the Application Password and Username.")
        sys.exit(1)
        
    # 2. Fetch posts
    posts = fetch_all_posts(valid_username)
    
    # 3. Save
    if posts:
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(posts, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Saved {len(posts)} posts to {OUTPUT_FILE}")
    else:
        print("\n⚠️ Authenticated but found 0 posts.")

if __name__ == "__main__":
    main()
