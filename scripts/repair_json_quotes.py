import os
import re
import json

def fix_unescaped_quotes(content):
    # This script targets the specific pattern in this project
    # "content": "HTML_CONTENT",
    # We want to escape any " inside HTML_CONTENT that aren't already escaped.
    
    # regex match for the content field
    # It starts with "content": "
    # It ends with ", (comma and newline) or " }
    
    def quote_replacer(match):
        prefix = match.group(1) # "content": " or "excerpt": "
        inner_content = match.group(2)
        suffix = match.group(3) # ", or " }
        
        # Escape any " that isn't already escaped with \
        # But wait, we need to be careful about already escaped things like \"
        # We'll first unescape all \" to " then escape all " to \"
        
        # Step 1: Replace \" with " (temporary)
        temp = inner_content.replace('\\"', '"')
        # Step 2: Escape all " to \"
        fixed = temp.replace('"', '\\"')
        # Step 3: Handle literal newlines that might be present
        fixed = fixed.replace('\n', '\\n').replace('\r', '\\r')
        
        return f'{prefix}{fixed}{suffix}'

    # Target "content" and "excerpt"
    pattern = r'("(?:content|excerpt)":\s*")([\s\S]*?)("\s*(?:,|\n|\s*\}))'
    return re.sub(pattern, quote_replacer, content)

def repair_all():
    posts_dir = r"d:\thecourtdirect\public\data\posts"
    repaired = 0
    errors = 0
    
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(posts_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Apply fix
                fixed_content = fix_unescaped_quotes(content)
                
                # Check if it's now valid JSON
                try:
                    json.loads(fixed_content)
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(fixed_content)
                    repaired += 1
                except json.JSONDecodeError as e:
                    # If still failing, maybe it's nested or has other issues
                    # print(f"Still failing {filename}: {e}")
                    errors += 1
            except Exception as e:
                # print(f"Error reading {filename}: {e}")
                errors += 1
                
    print(f"Repaired: {repaired}")
    print(f"Remaining errors: {errors}")

if __name__ == "__main__":
    repair_all()
