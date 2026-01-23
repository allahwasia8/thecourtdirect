import os

def state_machine_heal(content):
    result = []
    in_string = False
    escaped = False
    
    for char in content:
        if char == '"' and not escaped:
            in_string = not in_string
            result.append(char)
        elif char == '\\' and not escaped:
            escaped = True
            result.append(char)
        elif in_string:
            if char == '\n':
                result.append('\\n')
            elif char == '\r':
                result.append('\\r')
            else:
                result.append(char)
            escaped = False
        else:
            result.append(char)
            escaped = False
    
    return "".join(result)

def heal_directory():
    posts_dir = r"d:\thecourtdirect\public\data\posts"
    healed_count = 0
    total_count = 0
    
    for filename in os.listdir(posts_dir):
        if filename.endswith('.json'):
            total_count += 1
            filepath = os.path.join(posts_dir, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            healed = state_machine_heal(content)
            
            try:
                import json
                json.loads(healed)
                
                # If valid JSON now and different from original
                if healed != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(healed)
                    healed_count += 1
            except:
                # Still not valid, but we tried
                pass
                
    print(f"Total JSON files: {total_count}")
    print(f"Healed: {healed_count}")

if __name__ == "__main__":
    heal_directory()
