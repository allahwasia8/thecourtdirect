import os
import re

def heal_json(content):
    # This is a bit tricky. We need to find strings and escape literal newlines.
    # A simple way for THIS specific project's structure:
    # Each field is on its own line like: "field": "value"
    # If a line doesn't start with a quote or a closing brace, it's probably a continuation of a literal newline string.
    
    lines = content.splitlines()
    if not lines: return content
    
    healed_lines = []
    in_string = False
    
    for line in lines:
        stripped = line.strip()
        
        # If the line starts with a key/field pattern or is a structural brace
        # e.g. "id": "...", or "history": [
        if re.match(r'^\s*".*":\s*".*', line) or stripped == "{" or stripped == "}" or stripped.startswith('"reviewedBy":') or stripped.startswith('"history":'):
            healed_lines.append(line)
            # Check if this line ALSO ends the string (very simplified)
            # "field": "value",
            if stripped.endswith('",') or stripped.endswith('"') or stripped.endswith('},') or stripped.endswith('],'):
                pass
            else:
                # String continues on next line
                # But wait, our specific corruption seems to be that everything is on one line now OR has literal newlines
                pass
        else:
            # This is likely a continuation of a string with a literal newline
            if healed_lines:
                # Join with the previous line and add \n
                healed_lines[-1] = healed_lines[-1] + "\\n" + line
            else:
                healed_lines.append(line)
                
    return "\n".join(healed_lines)

def robust_heal_directory():
    posts_dir = r"d:\thecourtdirect\public\data\posts"
    healed_count = 0
    
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json'):
            filepath = os.path.join(posts_dir, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Try to see if it's already valid
            try:
                import json
                json.loads(content)
                continue # Skip if valid
            except:
                pass
            
            # Not valid, try to heal
            # Robust way: Find key-value pairs and escape literal newlines in values
            def replace_newlines(match):
                key = match.group(1)
                value = match.group(2)
                # Escape literal newlines but not escaped ones
                fixed_value = value.replace('\n', '\\n').replace('\r', '\\r')
                return f'"{key}": "{fixed_value}"'

            # Find "key": "value" where value might have literal newlines
            # This regex is greedy and looks for "key": " then everything until the next " that is followed by a comma or newline or brace
            healed = re.sub(r'"([^"]+)":\s*"([\s\S]*?)(?="\s*(?:,|\n|\s*\}))', replace_newlines, content)
            
            # Check if healed is valid
            try:
                json.loads(healed)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(healed)
                healed_count += 1
                # print(f"Healed: {filename}")
            except Exception as e:
                # print(f"Failed to heal {filename}: {e}")
                pass
                
    print(f"Successfully healed {healed_count} JSON files!")

if __name__ == "__main__":
    robust_heal_directory()
