import urllib.request
import urllib.parse
import base64
import json
import sys

WORDPRESS_URL = "https://thecourtdirect.com"
APP_PASSWORD = "U0oZ 7aG0 CFcZ sbCi IUoq Yvi3"
USERNAME = "thecourtdirect@gmail.com"

def get_auth_headers(username, password):
    credentials = f"{username}:{password}"
    encoded = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
    return {
        "Authorization": f"Basic {encoded}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Python/3.9",
        "Accept": "application/json"
    }

headers = get_auth_headers(USERNAME, APP_PASSWORD)

# Try simpler request
print("Attempting fetch with status='publish'...")
url = f"{WORDPRESS_URL}/wp-json/wp/v2/posts?page=1&per_page=5&status=publish" # No embed, just 5 posts

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        data = response.read()
        try:
            posts = json.loads(data)
            print(f"Got {len(posts)} posts.")
            if len(posts) > 0:
                print(f"Title of first post: {posts[0]['title']['rendered']}")
        except:
            print(f"Failed to parse JSON: {data[:200]}")
except Exception as e:
    print(f"Error: {e}")
    try:
        # If HTTPError, print read
        if hasattr(e, 'read'):
            print(f"Response body: {e.read().decode('utf-8')[:500]}")
    except:
        pass
