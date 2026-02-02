import os
import json
import re
import argparse

directory = r'd:\thecourtdirect\public\data\posts'

def extract_info(content, label):
    # Pattern to find the text after a specific info box title
    # Example: <h2 class="kt-blocks-info-box-title"><strong>Address</strong></h2><p class="kt-blocks-info-box-text">...</p>
    pattern = re.compile(rf'<h2 class="kt-blocks-info-box-title">.*?{label}.*?</h2>.*?<p class="kt-blocks-info-box-text">(.*?)</p>', re.DOTALL)
    match = pattern.search(content)
    if match:
        text = match.group(1).replace('<strong>', '').replace('</strong>', '').replace('&nbsp;', ' ').strip()
        # Remove any HTML tags left in the text
        text = re.sub(r'<[^>]+>', '', text)
        return text
    return None

def clean_content(content):
    # 0. Extract Info
    address = extract_info(content, "Address")
    phone = extract_info(content, "Dial")
    
    # 1. Remove Top Sections
    # Pattern: Everything between the first </h1> and the first standard paragraph or section head
    top_pattern = re.compile(r'(</h1>).*?(\n\n<p(?![^>]*class=))', re.DOTALL)
    new_content = top_pattern.sub(r'\1\2', content, count=1)
    
    # Insert Simple Info after H1 if found
    info_html = ""
    if address:
        info_html += f"\n\n<p><strong>Address:</strong> {address}</p>"
    if phone:
        info_html += f"\n<p><strong>Phone:</strong> {phone}</p>"
    
    if info_html:
        new_content = new_content.replace('</h1>', '</h1>' + info_html)

    # 2. Remove "Connect with a Attorney" Block
    if "Connect with a Attorney" in new_content or "Connect with an Attorney" in new_content:
         form_search = re.search(r'<h2 class="has-text-align-center" style="font-size:26px">Connect with a? Attorney</h2>', new_content)
         if form_search:
             form_pos = form_search.start()
             layout_start = new_content.rfind('<div class="kb-row-layout-wrap', 0, form_pos)
             if layout_start != -1:
                 layout_end = new_content.find('</div></div></div></div>\n\n</div></div>', form_pos)
                 if layout_end != -1:
                     new_content = new_content[:layout_start] + new_content[layout_end + len('</div></div></div></div>\n\n</div></div>'):]

    # 3. Remove Footer Sections
    footer_match = re.search(r'<style>[^<]*#3182CE', new_content)
    if footer_match:
        new_content = new_content[:footer_match.start()]
    
    # 4. Clean up remaining knitting site links and specific text
    new_content = re.sub(r'<p>see also <a href="https://HandKnitty\.com".*?</a></p>', '', new_content)
    new_content = re.sub(r'<p>see also.*?</p>\s*$', '', new_content, flags=re.IGNORECASE | re.DOTALL)
    
    # 5. Clean up excessive whitespace
    new_content = re.sub(r'\n{3,}', '\n\n', new_content)
    
    return new_content.strip()

def process_file(filepath, dry_run=False):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        original_content = data.get('content', '')
        if not original_content:
            return False
            
        cleaned = clean_content(original_content)
        
        if cleaned != original_content:
            if not dry_run:
                data['content'] = cleaned
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--verify", help="Verify a specific file and show diff")
    args = parser.parse_args()

    if args.verify:
        filepath = os.path.join(directory, args.verify)
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        original = data['content']
        cleaned = clean_content(original)
        print(f"--- CLEANED CONTENT START ---\n{cleaned[:800]}...\n--- CLEANED CONTENT END ---")
        print(f"Original length: {len(original)}, Cleaned length: {len(cleaned)}")
    else:
        modified_files = []
        total_files = 0
        for filename in sorted(os.listdir(directory)):
            if filename.endswith('.json'):
                total_files += 1
                if process_file(os.path.join(directory, filename), dry_run=args.dry_run):
                    modified_files.append(filename)
        
        print(f"Total files: {total_files}")
        print(f"Modified files: {len(modified_files)}")
        
        # Save the list of edited files
        with open('edited_links.txt', 'w', encoding='utf-8') as f:
            for m in modified_files:
                f.write(f"https://thecourtdirect.com/{m.replace('.json', '')}/\n")
        
        print(f"Links to edited files saved to edited_links.txt")
