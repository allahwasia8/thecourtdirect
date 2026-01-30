import os
import json
import time
import argparse
import xml.etree.ElementTree as ET
from urllib.error import HTTPError
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("Error: Missing required libraries.")
    print("Please install them using: pip install google-api-python-client google-auth")
    exit(1)

# USER PROVIDED KEY (For reference, usually not enough for Indexing API `publish`)
# Key: AIzaSyC2H-kaztvor6E_raEhsBWe3_K5bllJi4c
# The Indexing API requires a Service Account JSON key, not just a simple API key.
# Instructions:
# 1. Go to Google Cloud Console.
# 2. Create a Service Account.
# 3. Download the JSON key file.
# 4. Save it as 'service_account.json' in the project root.
# 5. Share your site in Search Console with the Service Account email (Owner/Full permissions).

SCOPES = ["https://www.googleapis.com/auth/indexing"]
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "service_account.json")
SITEMAP_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sitemap.xml")

def get_service():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"⚠️ Service account file not found at {SERVICE_ACCOUNT_FILE}")
        # Validating if we can use the API key (unlikely to work for 'publish' but we will try if user insists)
        api_key = "AIzaSyC2H-kaztvor6E_raEhsBWe3_K5bllJi4c" 
        print(f"⚠️ Attempting to use provided API Key: {api_key[:10]}...")
        
        try:
            service = build("indexing", "v3", developerKey=api_key)
            return service
        except Exception as e:
            print(f"❌ Failed to build service with API Key: {e}")
            return None

    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    service = build("indexing", "v3", credentials=creds)
    return service

def get_urls_from_sitemap(sitemap_path):
    if not os.path.exists(sitemap_path):
        print(f"Error: Sitemap not found at {sitemap_path}")
        return []

    urls = []
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
        # Handle namespaces if present (sitemap usually has xmlns)
        ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        
        for url in root.findall('sm:url', ns):
            loc = url.find('sm:loc', ns)
            if loc is not None and loc.text:
                urls.append(loc.text)
    except Exception as e:
        print(f"Error parsing sitemap: {e}")
    
    return urls

    return urls

def get_blog_urls():
    posts_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data", "blog-posts.json")
    if not os.path.exists(posts_path):
        print(f"Error: Blog posts file not found at {posts_path}")
        return []
    
    try:
        with open(posts_path, "r", encoding="utf-8") as f:
            posts = json.load(f)
            # Construct URLs: https://thecourtdirect.com/slug
            # Filter out any that might be malformed
            return [f"https://thecourtdirect.com/{post['id']}" for post in posts if post.get('id')]
    except Exception as e:
        print(f"Error reading blog posts: {e}")
        return []

def batch_submit_urls(service, urls):
    # The Indexing API has a quota (usually 200/day for publishing without special approval).
    print(f"Found {len(urls)} URLs to submit.")
    print("Starting submission...")

    success_count = 0
    fail_count = 0

    for i, url in enumerate(urls):
        try:
            # Create the notification body
            body = {
                "url": url,
                "type": "URL_UPDATED"
            }
            
            request = service.urlNotifications().publish(body=body)
            response = request.execute()
            
            print(f"[{i+1}/{len(urls)}] ✅ Submitted: {url}")
            # print(f"  Response: {response}") # verbose
            success_count += 1
            
            # Simple rate limiting
            time.sleep(0.5) 
            
        except HttpError as e:
            print(f"[{i+1}/{len(urls)}] ❌ FAILED: {url}")
            error_content = e.content.decode('utf-8') if hasattr(e, 'content') else str(e)
            print(f"  Error: {e.resp.status} - {error_content[:200]}")
            fail_count += 1
            
            # If quota exceeded, break
            if e.resp.status == 429:
                print("Quota exceeded (429). Stopping.")
                break
            if e.resp.status == 403: # Permission denied or quota
                print("Permission denied (403). Check Service Account permissions in Search Console.")
                break
                
        except Exception as e:
            print(f"Error: {e}")
            fail_count += 1
            
    print(f"\nSubmission Complete. Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    print("--- Google Indexing API Submitter ---")
    service = get_service()
    
    if service:
        # User requested: "ping blogs first"
        print("\n--- Phase 1: Submitting Blog Posts ---")
        blog_urls = get_blog_urls()
        if blog_urls:
            batch_submit_urls(service, blog_urls)
        else:
            print("No blog posts found.")

