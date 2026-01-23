import json
import os
import random
from datetime import datetime, timedelta

# Reviewer Data
REVIEWERS = [
    {
        "name": "Aleen M.",
        "title": "Legal Consultant",
        "image": "/images/reviewers/Aleen M.jpg"
    },
    {
        "name": "John M.",
        "title": "Senior Attorney",
        "image": "/images/reviewers/John M..jpg"
    },
    {
        "name": "Michelle W.",
        "title": "Family Law Specialist",
        "image": "/images/reviewers/Michelle-W.jpg"
    }
]

def parse_date(date_str):
    formats = ["%B %d, %Y", "%Y-%m-%d"] # Handle "May 28, 2023" and "2023-05-28"
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            pass
    return None

def update_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        modified = False
        items = []
        is_list = False
        
        if isinstance(data, list):
            items = data
            is_list = True
        elif isinstance(data, dict):
            items = [data]
        else:
            return

        for item in items:
            if not isinstance(item, dict):
                continue
            
            # Skip if already has history (idempotency check)
            if 'history' in item and 'reviewedBy' in item:
                continue
                
            modified = True
            
            # specific logic for reviewedBy
            reviewer = random.choice(REVIEWERS)
            item['reviewedBy'] = reviewer
            
            # specific logic for history
            post_date_str = item.get('date', '')
            post_date = parse_date(post_date_str)
            
            history = []
            
            if post_date:
                # Event 1: Published
                history.append({
                    "action": "Published",
                    "date": post_date.strftime("%B %d, %Y"),
                    "details": "Initial publication"
                })
                
                # Event 2: Reviewed (e.g., 2 days later)
                review_date = post_date + timedelta(days=2)
                history.append({
                    "action": "Reviewed",
                    "date": review_date.strftime("%B %d, %Y"),
                    "details": f"Medically Reviewed by {reviewer['name']}"
                })
                
                # Event 3: Updated (maybe recent?)
                # For demo purposes, let's just keep it simple or maybe add a "Current Version"
                history.append({
                    "action": "Current Version",
                    "date": datetime.now().strftime("%B %d, %Y"),
                    "details": "Latest update"
                })
            else:
                 # Fallback if no date found
                 history.append({
                    "action": "Published",
                    "date": "Unknown",
                    "details": "Initial publication"
                })

            # Sort history reverse chronological? Or chronological?
            # Design shows "Current Version" at top, so reverse chronological.
            history.sort(key=lambda x: datetime.strptime(x['date'], "%B %d, %Y") if x['date'] != "Unknown" else datetime.min, reverse=True)
            
            item['history'] = history

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                if is_list:
                    json.dump(items, f, indent=2, ensure_ascii=False)
                else:
                    json.dump(items[0], f, indent=2, ensure_ascii=False)
            # print(f"Updated {filepath}")

    except Exception as e:
        print(f"Error processing {filepath}: {e}")

def main():
    base_dir = r"d:\thecourtdirect\public\data\posts"
    print(f"Scanning directory: {base_dir}")
    
    count = 0
    if os.path.exists(base_dir):
        for filename in os.listdir(base_dir):
            if filename.endswith(".json"):
                 update_file(os.path.join(base_dir, filename))
                 count += 1
    
    print(f"Processed {count} files in directory.")

    # Check master file
    master_file = r"d:\thecourtdirect\thecourtdirect_posts.json"
    if os.path.exists(master_file):
        print(f"Scanning master file: {master_file}")
        update_file(master_file)
        print("Processed master file.")

if __name__ == "__main__":
    main()
