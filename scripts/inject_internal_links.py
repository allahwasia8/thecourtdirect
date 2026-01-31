
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
        keyword_patterns[kw] = re.compile(r'\b(' + safe_keyword + r')\b', re.IGNORECASE)

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

        content_lower = content.lower()
        post_relevant_keywords = [kw for kw in sorted_keywords if kw.lower() in content_lower]
        
        if not post_relevant_keywords:
            continue

        original_content = content
        current_injected_count = 0
        
        word_count = len(content.split())
        MAX_LINKS_PER_POST = max(12, int(word_count / 50))
        MAX_LINKS_PER_POST = min(MAX_LINKS_PER_POST, 25)
        
        existing_links = set()  
        
        # Pre-scan for existing links
        existing_matches = re.finditer(r'href=["\']([^"\']+)["\']', content)
        for m in existing_matches:
            existing_links.add(m.group(1))

        # Split content into tags and text fragments
        # We split by tags, keeping the tags in the result
        parts = re.split(r'(<[^>]+>)', content)
        
        new_parts = []
        inside_anchor = 0 # Counter for nesting (though we shouldn't have any now)
        
        for part in parts:
            if not part:
                continue
                
            if part.startswith('<'):
                if re.match(r'<a\b', part, re.IGNORECASE):
                    inside_anchor += 1
                elif re.match(r'</a\b', part, re.IGNORECASE):
                    inside_anchor = max(0, inside_anchor - 1)
                new_parts.append(part)
                continue
            
            # This is a text node
            if inside_anchor > 0 or current_injected_count >= MAX_LINKS_PER_POST:
                new_parts.append(part)
                continue
            
            # Process TEXT node using a segment-based approach to prevent re-processing
            segments = [part] # List of strings (raw text) or dicts (already linked)
            
            for keyword in post_relevant_keywords:
                if current_injected_count >= MAX_LINKS_PER_POST:
                    break
                    
                target = keyword_map[keyword]
                target_url = target['url']
                
                if target_url in f"/blog/{post_id}" or target_url in f"/court/{post_id}":
                    continue
                if target_url in existing_links:
                    continue

                new_segments = []
                keyword_applied_to_fragment = False
                
                for seg in segments:
                    if not isinstance(seg, str) or keyword_applied_to_fragment:
                        new_segments.append(seg)
                        continue
                    
                    pattern = keyword_patterns[keyword]
                    match = pattern.search(seg)
                    
                    if match:
                        start, end = match.span()
                        # Before match
                        if start > 0:
                            new_segments.append(seg[:start])
                        
                        # The LINK itself (as a dict to signal "already linked")
                        link_text = match.group(1)
                        new_segments.append({
                            'html': f'<a href="{target_url}" class="internal-link" title="{link_text}">{link_text}</a>'
                        })
                        
                        # After match
                        if end < len(seg):
                            new_segments.append(seg[end:])
                        
                        current_injected_count += 1
                        existing_links.add(target_url)
                        keyword_applied_to_fragment = True # Max 1 injection per keyword per fragment
                    else:
                        new_segments.append(seg)
                
                segments = new_segments

            # Combine segments back into final HTML for this part
            fragment_html = ""
            for seg in segments:
                if isinstance(seg, str):
                    fragment_html += seg
                else:
                    fragment_html += seg['html']
            
            new_parts.append(fragment_html)
            
        new_content = "".join(new_parts)
        
        if new_content != original_content:
            modified_files += 1
            total_injected += current_injected_count
            if not dry_run:
                data['content'] = new_content
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nProcessing Complete. Modified {modified_files} files. Total Links Injected: {total_injected}", flush=True)

if __name__ == "__main__":
    inject_links(dry_run=False)
