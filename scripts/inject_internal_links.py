
import json
import re
from pathlib import Path

# Paths
POSTS_PATH = Path("public/data/blog-posts.json")
INDIVIDUAL_POSTS_PATH = Path("public/data/posts")
KEYWORD_MAP_PATH = Path("public/data/keyword_map.json")

def inject_links(dry_run=True):
    print("Loading keyword map...", flush=True)
    with open(KEYWORD_MAP_PATH, "r", encoding="utf-8") as f:
        keyword_map = json.load(f)
        
    # Sort keywords by length (descending) to match longest phrases first
    sorted_keywords = sorted(keyword_map.keys(), key=len, reverse=True)
    
    # Filter out very short keywords (optional, e.g., < 4 chars) to avoid noise
    sorted_keywords = [k for k in sorted_keywords if len(k) > 4]

    print(f"Loaded {len(sorted_keywords)} valid keywords.", flush=True)

    print("Pre-compiling regex patterns...", flush=True)
    keyword_patterns = {}
    for kw in sorted_keywords:
        safe_keyword = re.escape(kw)
        # Store compiled regex with word boundaries
        keyword_patterns[kw] = re.compile(r'\b' + safe_keyword + r'\b', re.IGNORECASE)

    print("Accessing posts...", flush=True)
    with open(POSTS_PATH, "r", encoding="utf-8") as f:
        posts = json.load(f)

    total_injected = 0
    modified_files = 0

    posts_processed = 0
    for post in posts:
        posts_processed += 1
        if posts_processed % 50 == 0:
            print(f"Processed {posts_processed}/{len(posts)} posts...", flush=True)

        post_id = post['id']
        file_path = INDIVIDUAL_POSTS_PATH / f"{post_id}.json"
        
        if not file_path.exists():
            continue
            
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        content = data.get('content', '')
        if not content:
            continue

        # Optimization: Filter keywords relevant to this post first
        content_lower = content.lower()
        post_relevant_keywords = [kw for kw in sorted_keywords if kw.lower() in content_lower]
        
        if not post_relevant_keywords:
            continue

        original_content = content
        current_injected_count = 0
        
        # Calculate dynamic max links: Base 12, or 1 per 50 words approx
        word_count = len(content.split())
        MAX_LINKS_PER_POST = max(12, int(word_count / 50))
        MAX_LINKS_PER_POST = min(MAX_LINKS_PER_POST, 25)
        
        existing_links = set()  # Track URLs we've already linked to in this post
        
        # Pre-scan for existing links in content to avoid duplicates and understand current state
        existing_matches = re.finditer(r'href=["\']([^"\']+)["\']', content)
        for m in existing_matches:
            existing_links.add(m.group(1))

        # Split content into tags and text
        parts = re.split(r'(<[^>]+>)', content)
        
        new_parts = []
        inside_anchor = False
        
        for part in parts:
            if not part:
                continue
                
            if part.startswith('<'):
                # Check if we are entering or leaving an anchor
                if part.lower().startswith('<a '):
                    inside_anchor = True
                elif part.lower() == '</a>':
                    inside_anchor = False
                    
                new_parts.append(part)
                continue
            
            # This is a text node.
            text_fragment = part
            
            # If we are already inside an anchor tag (or hit limits), just append and skip
            if inside_anchor or current_injected_count >= MAX_LINKS_PER_POST:
                new_parts.append(text_fragment)
                continue
            
            # Process text fragment for internal links
            for keyword in post_relevant_keywords:
                if current_injected_count >= MAX_LINKS_PER_POST:
                    break
                    
                target = keyword_map[keyword]
                target_url = target['url']
                
                # 1. Don't link to self
                if target_url in f"/blog/{post_id}" or target_url in f"/court/{post_id}":
                    continue
                    
                # 2. Don't link if already linked in this post (prevents loops)
                if target_url in existing_links:
                    continue

                if keyword.lower() not in text_fragment.lower():
                    continue

                pattern = keyword_patterns[keyword]
                
                if pattern.search(text_fragment):
                    def replacement(match):
                        # Preserve original casing
                        return f'<a href="{target_url}" class="internal-link" title="{match.group(0)}">{match.group(0)}</a>'
                    
                    # Apply substitution (ONE instance)
                    new_text, count = pattern.subn(replacement, text_fragment, count=1)
                    
                    if count > 0:
                        text_fragment = new_text
                        current_injected_count += 1
                        existing_links.add(target_url)

            new_parts.append(text_fragment)
            
        new_content = "".join(new_parts)
        
        if new_content != original_content:
            modified_files += 1
            total_injected += current_injected_count
            if dry_run:
                # print(f"[DRY RUN] {post['title']}: Injected {current_injected_count} links.", flush=True)
                pass
            else:
                data['content'] = new_content
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nProcessing Complete. Modified {modified_files} files. Total Links Injected: {total_injected}", flush=True)

if __name__ == "__main__":
    # Standard run: dry_run=False
    inject_links(dry_run=False)
