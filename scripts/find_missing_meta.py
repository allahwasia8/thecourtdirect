import json
import os
import re
from pathlib import Path

OUTPUT_FILE = Path("missing_meta_report.txt")

def log(msg):
    print(msg)
    with open(OUTPUT_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

if OUTPUT_FILE.exists():
    OUTPUT_FILE.unlink()

def check_courts():
    log("--- Checking Courts ---")
    path = Path("public/data/courts.json")
    if not path.exists():
        log("courts.json not found")
        return

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    missing = []
    for item in data:
        if not item.get('metaDescription'):
            missing.append(item['id'])

    log(f"Total Courts: {len(data)}")
    log(f"Missing Description: {len(missing)}")
    if missing:
        log("IDs missing description:")
        for mid in missing:
            log(f"- {mid}")

def check_pages():
    log("\n--- Checking Static Pages ---")
    pages_dir = Path("src/pages")
    if not pages_dir.exists():
         log("src/pages not found")
         return
    
    for file_path in pages_dir.glob("*.tsx"):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        if "import SEO" not in content:
            log(f"{file_path.name}: WARN - 'import SEO' not found")
            continue

        if 'description="' not in content and "description='" not in content:
             log(f"{file_path.name}: FAIL - 'description' prop not found in text")
        else:
             log(f"{file_path.name}: PASS")

if __name__ == "__main__":
    check_courts()
    check_pages()
