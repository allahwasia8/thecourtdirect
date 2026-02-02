import os
import json
import time
import argparse
from urllib.error import HTTPError
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    print("Error: Missing required libraries.")
    print("Please install them using: pip install google-api-python-client google-auth")
    exit(1)

SCOPES = ["https://www.googleapis.com/auth/indexing"]
SERVICE_ACCOUNT_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "service_account.json")
PROGRESS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "indexing_progress.json")
EDITED_LINKS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "edited_links.txt")
DAILY_LIMIT = 200

def load_progress():
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {"submitted": []}
    return {"submitted": []}

def save_progress(progress):
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2)

def get_service():
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        print(f"Error: Service account file not found at {SERVICE_ACCOUNT_FILE}")
        return None
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    service = build("indexing", "v3", credentials=creds)
    return service

def get_urls_from_file():
    if not os.path.exists(EDITED_LINKS_FILE):
        print(f"Error: Edited links file not found at {EDITED_LINKS_FILE}")
        return []
    with open(EDITED_LINKS_FILE, 'r', encoding='utf-8') as f:
        return [line.strip() for line in f if line.strip().startswith('http')]

def ping_urls(service, urls):
    progress = load_progress()
    submitted_set = set(progress.get("submitted", []))
    
    # Filter out already submitted
    to_submit = [url for url in urls if url not in submitted_set]
    
    print(f"Total URLs from file: {len(urls)}")
    print(f"Already submitted (total history): {len(submitted_set)}")
    print(f"Remaining to submit in this batch: {len(to_submit)}")
    
    if not to_submit:
        print("All URLs in the file have already been submitted.")
        return

    # Respect daily limit
    batch = to_submit[:DAILY_LIMIT]
    print(f"Submitting batch of {len(batch)} URLs (Daily Limit: {DAILY_LIMIT})...")

    success_count = 0
    fail_count = 0

    for i, url in enumerate(batch):
        try:
            body = {
                "url": url,
                "type": "URL_UPDATED"
            }
            request = service.urlNotifications().publish(body=body)
            request.execute()
            
            print(f"[{i+1}/{len(batch)}] ✅ Submitted: {url}")
            success_count += 1
            
            # Update progress
            if "submitted" not in progress:
                progress["submitted"] = []
            progress["submitted"].append(url)
            save_progress(progress)
            
            # Rate limiting
            time.sleep(0.5)
            
        except HttpError as e:
            print(f"[{i+1}/{len(batch)}] ❌ FAILED: {url}")
            error_content = e.content.decode('utf-8') if hasattr(e, 'content') else str(e)
            print(f"  Error: {e.resp.status} - {error_content[:200]}")
            fail_count += 1
            if e.resp.status in [429, 403] and "quota" in error_content.lower():
                print("Quota exceeded. Stopping.")
                break
        except Exception as e:
            print(f"Error: {e}")
            fail_count += 1
            
    print(f"\nBatch Complete. Success: {success_count}, Failed: {fail_count}")

if __name__ == "__main__":
    print("--- Pinging Edited URLs via Indexing API ---")
    service = get_service()
    if service:
        urls = get_urls_from_file()
        if urls:
            ping_urls(service, urls)
        else:
            print("No URLs found in edited_links.txt")
