import os
import json
import re

directory = r'd:\thecourtdirect\public\data\posts'
results = []

# Patterns to look for
start_patterns = [
    r'<div class="is-layout-flex">',
    r'<style>',
    r'<div class="kt-info-box'
]

# We want to find the repetitive blocks at the beginning and end of 'content'
for filename in os.listdir(directory):
    if filename.endswith('.json'):
        filepath = os.path.join(directory, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
                content = data.get('content', '')
                
                # Check for "Connect with a Attorney"
                has_attorney_form = "Connect with a Attorney" in content or "Connect with an Attorney" in content
                
                # Check for "Counties in/is"
                has_counties_block = "Counties is" in content or "Counties in" in content
                
                # Check for "HandKnitty"
                has_knitting = "HandKnitty.com" in content
                
                if has_attorney_form or has_counties_block or has_knitting:
                    results.append({
                        'file': filename,
                        'attorney': has_attorney_form,
                        'counties': has_counties_block,
                        'knitting': has_knitting,
                        'length': len(content)
                    })
        except Exception as e:
            print(f"Error reading {filename}: {e}")

print(f"Total files searched: {len([f for f in os.listdir(directory) if f.endswith('.json')])}")
print(f"Files with matches: {len(results)}")

# Detailed look at the first match to find the end of the top widget section
if results:
    example_file = results[0]['file']
    filepath = os.path.join(directory, example_file)
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        content = data.get('content', '')
        # Find first occurrence of a regular paragraph that seems to be actual content
        # Usually it starts with <p> and doesn't contain style or complex classes
        match = re.search(r'\n\n<p>(?![^<]*class=)', content)
        if match:
             print(f"\nExample file: {example_file}")
             print(f"Top section ends around index {match.start()}")
             # print(content[:match.start() + 50])
        
        # Look for the footer section
        # The counties block usually has a blue border #3182CE
        if "#3182CE" in content:
            match_footer = re.search(r'<style>[^<]*#3182CE[^<]*</style>', content)
            if match_footer:
                print(f"Footer section starts around index {match_footer.start()}")

# Find common patterns in the top sections
top_sections = []
for r in results[:20]:
    filepath = os.path.join(directory, r['file'])
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        content = data.get('content', '')
        # Simplistic split
        match = re.search(r'\n\n<p>(?![^<]*class=)', content)
        if match:
            top_sections.append(content[:match.start()])

print(f"\nUnique top section lengths: {set(len(s) for s in top_sections)}")
