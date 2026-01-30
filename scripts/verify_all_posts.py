import json
import os
from pathlib import Path

individual_dir = Path("public/data/posts")

def verify_all():
    if not individual_dir.exists():
        print("Posts directory not found")
        return
        
    all_files = list(individual_dir.glob("*.json"))
    total = len(all_files)
    missing = []
    
    for file_path in all_files:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if not data.get('metaDescription'):
                    missing.append(file_path.name)
        except:
            pass
            
    print(f"Total files checked: {total}")
    print(f"Files missing metaDescription: {len(missing)}")
    if missing:
        print(f"First 10 missing: {missing[:10]}")

verify_all()
