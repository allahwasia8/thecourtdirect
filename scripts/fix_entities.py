import json
import os

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace specific entities
        # &#8211; is en-dash (–)
        # &#038; is ampersand (&)
        # &#8217; is right single quote ('), already handled but good to keep safe
        # &#8220; is left double quote (“)
        # &#8221; is right double quote (”)
        
        new_content = content.replace("&#8211;", "–")
        new_content = new_content.replace("&#038;", "&") 
        new_content = new_content.replace("&amp;", "&") # Simplify &amp; to & if it makes sense for titles, but maybe dangerous for XML/HTML. 
        # Actually, let's stick to the requested one primarily and safe ones.
        # The user specifically mentioned &#8211; which renders as a dash.
        
        # Refined replacements
        new_content = new_content.replace("&#8211;", "-") # Replace en-dash with hyphen for URL/Title safety or just keep as dash? Post titles usually fine with dash. Let's use hyphen or en-dash. User said they "see &#8211;", so they want it gone.
        # simpler is better:
        
        replacements = {
            "&#8211;": "-",
            "&#8212;": "--",
            "&#8216;": "'",
            "&#8217;": "'",
            "&#8220;": '"',
            "&#8221;": '"',
            "&#038;": "&",
            "&nbsp;": " "
        }
        
        for entity, char in replacements.items():
            new_content = new_content.replace(entity, char)

        if content != new_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            # print(f"Fixed entities in {filepath}")
            return True
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

def main():
    base_dir = r"d:\thecourtdirect\public\data\posts"
    print(f"Scanning directory: {base_dir}")
    
    count = 0
    if os.path.exists(base_dir):
        for filename in os.listdir(base_dir):
            if filename.endswith(".json"):
                 if fix_file(os.path.join(base_dir, filename)):
                     count += 1
    
    print(f"Fixed entities in {count} files.")

    # Check master file
    master_file = r"d:\thecourtdirect\thecourtdirect_posts.json"
    if os.path.exists(master_file):
        if fix_file(master_file):
            print("Fixed entities in master file.")

if __name__ == "__main__":
    main()
