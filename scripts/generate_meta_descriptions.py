import os
import json
import requests
import time
from pathlib import Path

# Configuration
GROQ_API_KEYS = [
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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"
]

SERVICE_ACCOUNT_FILE = "service_account.json"
MODEL_GROQ = "llama-3.3-70b-versatile"
MODEL_GEMINI = "gemini-1.5-flash"
POSTS_DATA_PATH = Path("d:/thecourtdirect/public/data/blog-posts.json")
INDIVIDUAL_POSTS_PATH = Path("d:/thecourtdirect/public/data/posts")
COURTS_DATA_PATH = Path("d:/thecourtdirect/public/data/courts.json")

# Dynamic Key Management (Groq)
CURRENT_KEY_INDEX = 0
KEY_COOLDOWNS = {key: 0 for key in GROQ_API_KEYS}
INVALID_KEYS = set()

def get_next_available_key():
    global CURRENT_KEY_INDEX
    now = time.time()
    # Try looping through all keys at least once to find a valid one
    min_cooldown = float('inf')
    has_valid_keys = False
    
    for _ in range(len(GROQ_API_KEYS)):
        key = GROQ_API_KEYS[CURRENT_KEY_INDEX]
        CURRENT_KEY_INDEX = (CURRENT_KEY_INDEX + 1) % len(GROQ_API_KEYS)
        
        if key in INVALID_KEYS:
            continue
        
        has_valid_keys = True
        if KEY_COOLDOWNS[key] <= now:
            return key
        else:
            if KEY_COOLDOWNS[key] < min_cooldown:
                min_cooldown = KEY_COOLDOWNS[key]
            
    # If we are here, all valid keys are on cooldown
    if has_valid_keys and min_cooldown != float('inf'):
        sleep_time = min_cooldown - time.time() + 1
        if sleep_time > 0:
            print(f"  All keys on cooldown. Sleeping {sleep_time:.1f}s...", flush=True)
            time.sleep(sleep_time)
            # Recursive call after sleep to get the key
            return get_next_available_key()
            
    return None

def generate_with_groq(prompt):
    # Try up to 5 times (switching keys) before giving up on Groq
    for attempt in range(5):
        api_key = get_next_available_key()
        if not api_key:
            return None, "All Groq keys rate-limited or invalid"

        payload = {
            "model": MODEL_GROQ,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 100,
            "temperature": 0.7
        }
        
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        
        try:
            response = requests.post("https://api.groq.com/openai/v1/chat/completions", json=payload, headers=headers, timeout=10)
            
            if response.status_code == 200:
                try:
                    return response.json()['choices'][0]['message']['content'].strip(), None
                except Exception as e:
                    return None, f"Parse Error: {e}"
                    
            elif response.status_code == 429:
                # Rate Limit: Cooldown this SPECIFIC key
                retry_after = 60 # Assume 1 min cooldown for simplicity
                KEY_COOLDOWNS[api_key] = time.time() + retry_after
                # print(f"  Key ...{api_key[-4:]} Rate Limited. Switching...", flush=True)
                continue # Try next key loop
                
            elif response.status_code in [400, 401, 403]:
                # Invalid Key: Permanently remove
                # (400 is often "Bad Request" but for Groq keys it can imply key issues too if param is correct)
                print(f"  Key ...{api_key[-4:]} Invalid ({response.status_code}). removing.", flush=True)
                INVALID_KEYS.add(api_key)
                continue # Try next key loop
                
            else:
                return None, f"Groq Error {response.status_code}"
                
        except Exception as e:
            # Network error?
            return None, f"Groq Exception: {e}"
            
    return None, "Groq attempts exhausted"

def get_gemini_token():
    try:
        from google.oauth2 import service_account
        from google.auth.transport.requests import Request
        
        if not os.path.exists(SERVICE_ACCOUNT_FILE):
             return None
             
        creds = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, 
            scopes=['https://www.googleapis.com/auth/cloud-platform']
        )
        creds.refresh(Request())
        return creds.token
    except Exception as e:
        # print(f"Auth Error: {e}")
        return None

def generate_with_gemini(prompt):
    token = get_gemini_token()
    if not token:
        return None, "Gemini Auth Failed (Use Service Account)"
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_GEMINI}:generateContent"
    
    # When using Service Account, we pass Bearer Token in headers, NOT key param
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "x-goog-user-project": "the-court-direct" # Required for some SA calls
    }
    
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code == 200:
            try:
                return response.json()['candidates'][0]['content']['parts'][0]['text'].strip(), None
            except:
                return None, "Gemini parsing error"
        elif response.status_code == 403:
             # This is likely "User location is not supported" or "Quota exceeded" or "API not enabled"
             # We should log it clearly but return None so we fallback/wait
             return None, f"Gemini 403 (Quota/Perms)"
        elif response.status_code == 429:
             return None, "Gemini Rate Limit"
        else:
            return None, f"Gemini Error {response.status_code}"
    except Exception as e:
        return None, f"Gemini Exception: {e}"

def generate_meta_description(title, content, item_type="blog post"):
    truncated_content = content[:2000]
    prompt = f"""
    Generate a compelling, SEO-friendly meta description (maximum 150-160 characters) for a {item_type}.
    Title: {title}
    Content: {truncated_content}
    Output ONLY the description.
    """
    
    # Strategy: Ping Pong / Fast Failover
    # 1. Try Groq
    desc, error_groq = generate_with_groq(prompt)
    if desc:
        if len(desc) > 160: desc = desc[:157] + "..."
        return desc
    
    # 2. Key Failed? Try Gemini INSTANTLY
    # print(f"  Groq failed ({error_groq}), trying Gemini instantly...", flush=True)
    desc, error_gemini = generate_with_gemini(prompt)
    if desc:
        if len(desc) > 160: desc = desc[:157] + "..."
        return desc

    # 3. If both failed, we must wait to avoid skipping
    print(f"  All providers failed (Groq: {error_groq}, Gemini: {error_gemini}). Waiting 5s...", flush=True)
    time.sleep(5)
    
    # 4. Final Retry with Groq
    desc, error_groq = generate_with_groq(prompt)
    if desc:
        if len(desc) > 160: desc = desc[:157] + "..."
        return desc
        
    return None


def process_posts(limit=2000):
    print(f"Accessing posts from: {POSTS_DATA_PATH}", flush=True)
    with open(POSTS_DATA_PATH, "r", encoding="utf-8") as f:
        posts = json.load(f)

    updated_count = 0
    total_processed = 0
    
    # Pre-scan individual files to sync any missing descriptions in main list
    print("Syncing individual post files to main list...", flush=True)
    synced = 0
    for post in posts:
        if 'metaDescription' in post and post['metaDescription']:
            continue
            
        post_id = post['id']
        individual_path = INDIVIDUAL_POSTS_PATH / f"{post_id}.json"
        
        if individual_path.exists():
            try:
                with open(individual_path, "r", encoding="utf-8") as f:
                    detail = json.load(f)
                    if 'metaDescription' in detail and detail['metaDescription']:
                        post['metaDescription'] = detail['metaDescription']
                        post['metaTitle'] = detail.get('metaTitle', post['title'])
                        synced += 1
            except:
                pass
                
    if synced > 0:
        print(f"Synced {synced} posts from individual files. Saving...", flush=True)
        with open(POSTS_DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(posts, f, indent=2)

    # Now generate for remaining
    for post in posts:
        if total_processed >= limit:
            break
            
        post_id = post['id']
        if 'metaDescription' in post and post['metaDescription']:
            continue

        print(f"Processing Post: {post['title']}", flush=True)
        
        individual_path = INDIVIDUAL_POSTS_PATH / f"{post_id}.json"
        content_for_prompt = post.get('excerpt', post['title'])
        post_detail = None
        
        if individual_path.exists():
            with open(individual_path, "r", encoding="utf-8") as f:
                post_detail = json.load(f)
                content_for_prompt = post_detail.get('content', post_detail.get('excerpt', post_detail['title']))
        
        clean_content = clean_html(content_for_prompt)
        description = generate_meta_description(post['title'], clean_content, "blog post")
        
        if description:
            post['metaDescription'] = description
            if 'metaTitle' not in post or not post['metaTitle']:
                post['metaTitle'] = post['title']

            if post_detail:
                post_detail['metaDescription'] = description
                if 'metaTitle' not in post_detail or not post_detail['metaTitle']:
                     post_detail['metaTitle'] = post['title']
            
                if individual_path.exists():
                    with open(individual_path, "w", encoding="utf-8") as f:
                        json.dump(post_detail, f, indent=2)
            
            updated_count += 1
            total_processed += 1
            print(f"  Description: {description}", flush=True)
            
            # Periodic Save
            if updated_count % 20 == 0:
                print(f"  Saving progress ({updated_count} updates)...", flush=True)
                with open(POSTS_DATA_PATH, "w", encoding="utf-8") as f:
                    json.dump(posts, f, indent=2)
            

    if updated_count > 0:
        print(f"Saving final {updated_count} posts updates...", flush=True)
        with open(POSTS_DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(posts, f, indent=2)

def process_courts(limit=5000):
    print(f"Accessing courts from: {COURTS_DATA_PATH}", flush=True)
    with open(COURTS_DATA_PATH, "r", encoding="utf-8") as f:
        courts = json.load(f)

    updated_count = 0
    total_processed = 0
    
    for court in courts:
        if total_processed >= limit:
            break
            
        if 'metaDescription' in court and court['metaDescription']:
            continue

        print(f"Processing Court: {court['name']}", flush=True)
        
        details = f"Address: {court['address']}, {court['city']}, {court['state']} {court['zip']}. "
        if court.get('phone'):
            details += f"Phone: {court['phone']}. "
        if court.get('types'):
             details += f"Type: {', '.join(court['types'])}. "
        
        description = generate_meta_description(court['name'], details, "courthouse information page")
        
        if description:
            court['metaDescription'] = description
            updated_count += 1
            total_processed += 1
            print(f"  Description: {description}", flush=True)
            
            # Periodic Save
            if updated_count % 20 == 0:
                print(f"  Saving courts progress ({updated_count} updates)...", flush=True)
                with open(COURTS_DATA_PATH, "w", encoding="utf-8") as f:
                    json.dump(courts, f, indent=2)

    if updated_count > 0:
        print(f"Saving final {updated_count} courts updates...", flush=True)
        with open(COURTS_DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(courts, f, indent=2)

if __name__ == "__main__":
    try:
        process_posts(limit=2000)
        process_courts(limit=5000)
    except KeyboardInterrupt:
        print("\nStopped by user.", flush=True)
