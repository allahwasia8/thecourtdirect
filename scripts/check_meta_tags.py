import os
import re

def check_meta_tags(filepath):
    """Check a page file for meta tags"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    page_name = os.path.basename(filepath)
    
    # Check for Helmet usage
    has_helmet = '<Helmet>' in content or 'import { Helmet }' in content
    
    # Extract title if present
    title_match = re.search(r'<title>(.*?)</title>', content)
    title = title_match.group(1) if title_match else None
    
    # Extract meta description if present
    desc_match = re.search(r'<meta\s+name="description"\s+content="(.*?)"', content)
    description = desc_match.group(1) if desc_match else None
    
    return {
        'file': page_name,
        'has_helmet': has_helmet,
        'title': title,
        'description': description
    }

def main():
    pages_dir = r'd:\thecourtdirect\src\pages'
    
    results = []
    
    for filename in os.listdir(pages_dir):
        if filename.endswith('.tsx'):
            filepath = os.path.join(pages_dir, filename)
            result = check_meta_tags(filepath)
            results.append(result)
    
    # Sort by filename
    results.sort(key=lambda x: x['file'])
    
    print("=" * 80)
    print("META TAGS AUDIT")
    print("=" * 80)
    
    missing_meta = []
    has_meta = []
    
    for result in results:
        if result['title'] or result['description']:
            has_meta.append(result)
        else:
            missing_meta.append(result)
    
    if has_meta:
        print("\n✓ Pages WITH Meta Tags:")
        print("-" * 80)
        for r in has_meta:
            print(f"\n{r['file']}:")
            if r['title']:
                print(f"  Title: {r['title'][:70]}...")
            if r['description']:
                print(f"  Desc:  {r['description'][:70]}...")
    
    if missing_meta:
        print("\n\n⚠ Pages WITHOUT Meta Tags:")
        print("-" * 80)
        for r in missing_meta:
            print(f"  - {r['file']}")
    
    print(f"\n\nSummary:")
    print(f"  Pages with meta tags: {len(has_meta)}")
    print(f"  Pages missing meta tags: {len(missing_meta)}")
    print(f"  Total pages: {len(results)}")

if __name__ == "__main__":
    main()
