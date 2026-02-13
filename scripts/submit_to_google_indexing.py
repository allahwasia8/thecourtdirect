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
PROGRESS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "indexing_progress.json")
DAILY_LIMIT = 200

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r') as f:
                return json.load(f)
        except:
            return {"submitted": []}
    return {"submitted": []}

def save_progress(progress):
    with open(PROGRESS_FILE, 'w') as f:
        json.dump(progress, f, indent=2)

def get_service():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"⚠️ Service account file not found at {SERVICE_ACCOUNT_FILE}")
        # Validating if we can use the API key (unlikely to work for 'publish' but we will try if user insists)
        api_key = os.environ.get("GOOGLE_API_KEY", "YOUR_GOOGLE_API_KEY")
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

def get_court_urls():
    courts_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data", "courts.json")
    if not os.path.exists(courts_path):
        print(f"Error: Courts file not found at {courts_path}")
        return []
    
    try:
        with open(courts_path, "r", encoding="utf-8") as f:
            courts = json.load(f)
            # Construct URLs: https://thecourtdirect.com/court/id
            return [f"https://thecourtdirect.com/court/{court['id']}" for court in courts if court.get('id')]
    except Exception as e:
        print(f"Error reading courts: {e}")
        return []

def get_directory_urls():
    # Base directory URL
    urls = ["https://thecourtdirect.com/directory"]
    
    # State abbrevs
    states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", 
              "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
              "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", 
              "VA", "WA", "WV", "WI", "WY"]
    
    for state in states:
        urls.append(f"https://thecourtdirect.com/courts/{state}")
        
    return urls

def batch_submit_urls(service, urls):
    progress = load_progress()
    submitted_set = set(progress["submitted"])
    
    # Filter out already submitted
    to_submit = [url for url in urls if url not in submitted_set]
    
    print(f"Total URLs: {len(urls)}")
    print(f"Already submitted: {len(submitted_set)}")
    print(f"Remaining to submit: {len(to_submit)}")
    
    if not to_submit:
        print("All URLs have already been submitted.")
        return

    # User mentioned 200 are already done, we should respect daily quota
    # We will submit up to DAILY_LIMIT from the remaining list
    batch = to_submit[:DAILY_LIMIT]
    
    print(f"Submitting batch of {len(batch)} URLs (Daily Limit: {DAILY_LIMIT})...")
    print("Starting submission...")

    success_count = 0
    fail_count = 0

    for i, url in enumerate(batch):
        try:
            # Create the notification body
            body = {
                "url": url,
                "type": "URL_UPDATED"
            }
            
            request = service.urlNotifications().publish(body=body)
            request.execute()
            
            print(f"[{i+1}/{len(batch)}] ✅ Submitted: {url}")
            success_count += 1
            
            # Update progress immediately (so if it crashes we save state)
            progress["submitted"].append(url)
            save_progress(progress)
            
            # Simple rate limiting
            time.sleep(0.5) 
            
        except HttpError as e:
            print(f"[{i+1}/{len(batch)}] ❌ FAILED: {url}")
            error_content = e.content.decode('utf-8') if hasattr(e, 'content') else str(e)
            print(f"  Error: {e.resp.status} - {error_content[:200]}")
            fail_count += 1
            
            # If quota exceeded, break
            if e.resp.status == 429:
                print("Quota exceeded (429). Stopping.")
                break
            if e.resp.status == 403: # Permission denied or quota
                print("Permission denied (403). Check Service Account permissions in Search Console.")
                # Don't break on 403 for individual URLs unless it's widespread, but typically 403 on publish means quota or perm.
                # If it's quota related, we stop.
                if "quota" in error_content.lower():
                     break
                
        except Exception as e:
            print(f"Error: {e}")
            fail_count += 1
            
    print(f"\nBatch Complete. Success: {success_count}, Failed: {fail_count}")
    print(f"Progress saved to {PROGRESS_FILE}")

if __name__ == "__main__":
    print("--- Google Indexing API Submitter ---")
    service = get_service()
    
    if service:
        all_urls = []
        
        # Directory URLs (High Priority)
        print(f"\n--- Phase 1: Generating Directory URLs ---")
        dir_urls = get_directory_urls()
        print(f"Generated {len(dir_urls)} Directory URLs")
        all_urls.extend(dir_urls)

        print("\n--- Phase 2: Gathering Blog URLs ---")
        blog_urls = get_blog_urls()
        print(f"Found {len(blog_urls)} Blog URLs")
        all_urls.extend(blog_urls)
        
        print("\n--- Phase 3: Gathering Court URLs ---")
        court_urls = get_court_urls()
        print(f"Found {len(court_urls)} Court URLs")
        all_urls.extend(court_urls)
        
        if all_urls:
            print(f"\nTotal URLs to submit: {len(all_urls)}")
            batch_submit_urls(service, all_urls)
        else:
            print("No URLs found to submit.")

