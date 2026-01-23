import os
import json
import re

def aggressive_repair(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # The corruption is that inside "content": "..." or "excerpt": "..."
    # there are unescaped " characters.
    # We know the content starts with "content": " and ends just before "authorRole": or "history": or "reviewedBy":
    
    def fix_field(field_name, next_boundary, text):
        # Find the start of the field
        start_pattern = f'"{field_name}": "'
        start_idx = text.find(start_pattern)
        if start_idx == -1: return text
        
        val_start = start_idx + len(start_pattern)
        
        # Find the end of the field by looking for the next boundary
        end_idx = text.find(next_boundary, val_start)
        if end_idx == -1: return text
        
        # The string ends at the " before the next boundary
        # Usually it looks like: ...content...",\n  "next_field": ...
        # So we look backwards from end_idx for the last ",
        last_quote_idx = text.rfind('"', val_start, end_idx)
        if last_quote_idx == -1: return text
        
        inner = text[val_start:last_quote_idx]
        # Escape all " in inner
        fixed_inner = inner.replace('\\"', '"').replace('"', '\\"')
        # Escape newlines
        fixed_inner = fixed_inner.replace('\n', '\\n').replace('\r', '\\r')
        
        return text[:val_start] + fixed_inner + text[last_quote_idx:]

    # Fix excerpt (usually followed by "author":)
    content = fix_field("excerpt", '"author":', content)
    # Fix content (usually followed by "authorRole":)
    content = fix_field("content", '"authorRole":', content)
    
    # Final check
    try:
        json.loads(content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except:
        return False

def fix_last_three():
    files = [
        r"d:\thecourtdirect\public\data\posts\circleville-municipal-court-detailed.json",
        r"d:\thecourtdirect\public\data\posts\parma-municipal-court.json",
        r"d:\thecourtdirect\public\data\posts\what-is-the-supreme-court.json"
    ]
    
    for f in files:
        if os.path.exists(f):
            if aggressive_repair(f):
                print(f"Fixed: {os.path.basename(f)}")
            else:
                print(f"Failed to fix: {os.path.basename(f)}")

if __name__ == "__main__":
    fix_last_three()
