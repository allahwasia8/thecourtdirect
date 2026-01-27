import os
import json
import requests
import time
import base64
import io
import re
from pathlib import Path
from PIL import Image

# Configuration
API_KEY = "tgp_v1_644yoUtdPAzSk8c_jVarHs4i1uUkMMBxgJ8OD7aCLf8"
MODEL = "black-forest-labs/FLUX.1-schnell"
POSTS_DATA_PATH = Path("d:/thecourtdirect/public/data/blog-posts.json")
INDIVIDUAL_POSTS_PATH = Path("d:/thecourtdirect/public/data/posts")
IMAGE_OUTPUT_DIR = Path("d:/thecourtdirect/public/images/blog")

def clean_html(raw_html):
    """Remove HTML tags and clean up whitespace."""
    cleanr = re.compile('<.*?>')
    cleantext = re.sub(cleanr, '', raw_html)
    return " ".join(cleantext.split())

def generate_image(prompt, filename):
    url = "https://api.together.xyz/v1/images/generations"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Truncate prompt if it's extremely long, but keep a healthy amount of detail
    # Together API limit is usually around several thousand characters.
    truncated_prompt = prompt[:3000]
    
    payload = {
        "model": MODEL,
        "prompt": f"A professional legal illustration for a blog post. Context: {truncated_prompt}. High quality, 4k, legal theme, professional courthouse or law office aesthetic, cinematic lighting, clean composition.",
        "width": 1024,
        "height": 768,
        "steps": 4,
        "n": 1,
        "response_format": "b64_json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        image_data = base64.b64decode(data['data'][0]['b64_json'])
        
        # Convert to WebP using Pillow
        image = Image.open(io.BytesIO(image_data))
        image.save(filename, "WEBP", quality=85)
        
        return True
    except Exception as e:
        print(f"Error generating image: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"Response: {e.response.text}")
        return False

def process_posts(limit=2000, force_ids=None):
    if force_ids is None:
        force_ids = []
        
    if not IMAGE_OUTPUT_DIR.exists():
        IMAGE_OUTPUT_DIR.mkdir(parents=True)

    with open(POSTS_DATA_PATH, "r", encoding="utf-8") as f:
        posts = json.load(f)

    updated_count = 0
    for post in posts:
        if updated_count >= limit:
            break
            
        post_id = post['id']
        # If force_ids is provided, only process those if it's not empty, 
        # or if we are doing bulk, just bypass check if it's in force_ids
        
        output_path = IMAGE_OUTPUT_DIR / f"{post_id}.webp"
        
        if output_path.exists() and post_id not in force_ids:
             continue

        # Get full content
        individual_path = INDIVIDUAL_POSTS_PATH / f"{post_id}.json"
        content_for_prompt = post.get('excerpt', post['title'])
        
        if individual_path.exists():
            with open(individual_path, "r", encoding="utf-8") as f:
                post_detail = json.load(f)
                content_for_prompt = post_detail.get('content', post_detail.get('excerpt', post_detail['title']))
        
        clean_prompt = clean_html(content_for_prompt)
        
        print(f"Generating image for: {post['title']}")
        
        if generate_image(clean_prompt, output_path):
            # Update main posts data
            post['image'] = f"/images/blog/{post_id}.webp"
            
            # Update individual post file if it exists
            if individual_path.exists():
                with open(individual_path, "r", encoding="utf-8") as f:
                    post_detail = json.load(f)
                post_detail['image'] = f"/images/blog/{post_id}.webp"
                with open(individual_path, "w", encoding="utf-8") as f:
                    json.dump(post_detail, f, indent=2)
            
            updated_count += 1
            print(f"Successfully generated and updated: {post_id}")
            # Schnell is fast, but let's pace it slightly if doing bulk
            time.sleep(0.5) 
        else:
            print(f"Failed to generate image for: {post_id}")

    # Write back the updated main posts data
    with open(POSTS_DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2)

if __name__ == "__main__":
    # Force regenerate specific IDs as requested
    force_ids = [
        "how-far-back-does-a-criminal-background-check-go",
        "what-is-criminal-trespassing",
        "what-can-you-do-with-a-criminal-justice-degree",
        "who-paid-the-largest-criminal-fine-in-history",
        "what-is-an-rfo-in-family-court"
    ]
    process_posts(limit=2000, force_ids=force_ids)
