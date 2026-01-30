import os
import re
from pathlib import Path

# Reuse the generator logic (importing would be cleaner, but for now copying the key parts to be standalone or we can import if path allows)
# We will import the generator function from generate_meta_descriptions to avoid duplication
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from generate_meta_descriptions import generate_meta_description

PAGES_DIR = Path("d:/thecourtdirect/src/pages")

def scan_and_update_pages():
    print(f"Scanning pages in {PAGES_DIR}...")
    
    for file_path in PAGES_DIR.glob("*.tsx"):
        print(f"Checking {file_path.name}...")
        
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # 1. Check if it has <SEO ... />
        if "<SEO" not in content:
            print(f"  No <SEO> component found. Skipping.")
            continue
            
        # 2. Check if it ALREADY has a description
        # Regex looks for description="..." or description='...'
        if re.search(r'description=["\'](?!(?:\{|\s*$))', content):
             # basic check: if description=" exists and is not empty or variable
             # Actually, let's be more specific. If it has description="...", we skip.
             # If it is missing or empty, we generate.
             pass
             
        # Simple heuristic: If "description=" is present, assume manual override or already done.
        # But we want to fill gaps.
        if 'description="' in content or "description='" in content:
             print(f"  Description prop already present. Skipping.")
             continue

        # 3. Extract content to generate description
        # We'll just take the whole file content, strip imports/code, try to get text
        # Only simple cleanup
        text_content = re.sub(r'import .*?;', '', content, flags=re.DOTALL)
        text_content = re.sub(r'<[^>]+>', ' ', text_content) # remove tags
        text_content = re.sub(r'\s+', ' ', text_content).strip()
        
        page_name = file_path.stem
        if page_name == "Index": page_name = "Home Page - The Court Direct"
        
        print(f"  Generating description for {page_name}...")
        
        description = generate_meta_description(page_name, text_content[:3000], "website page")
        
        if description:
            print(f"  Generated: {description}")
            
            # 4. Inject into <SEO ... />
            # We look for <SEO and append description="..." before the closing /> or >
            # This is a bit regex-heavy and fragile, but sufficient for this task.
            
            # Pattern: <SEO ( attributes ) ( /> | > )
            # We want to insert description="..." inside
            
            replacement = f'<SEO description="{description}" '
            
            new_content = content.replace('<SEO', replacement, 1) # simple replace first occurrence
            
            if new_content != content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print("  Updated file.")
            else:
                print("  Could not inject prop.")

if __name__ == "__main__":
    scan_and_update_pages()
