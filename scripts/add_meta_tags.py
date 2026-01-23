#!/usr/bin/env python3
"""
Script to add Helmet and meta tags to all pages that are missing them.
"""

import os
import re

# Define meta tags for each page
META_TAGS = {
    'FindCourt.tsx': {
        'title': 'Find a Court | The Court Direct - Court Directory & Locator',
        'description': 'Search our comprehensive directory to find courts across the United States. Access addresses, phone numbers, and details for federal, state, and local courtrooms.',
        'insert_after_line': 81,  # After <Layout>
        'import_position': 3  # After third import
    },
    'LegalTerminology.tsx': {
        'title': 'Legal Terminology | The Court Direct - Legal Terms Dictionary',
        'description': 'Browse our comprehensive legal terminology dictionary. Understand court terms, legal jargon, and judicial language with clear definitions and explanations.',
        'insert_after_line': None,  # Will find <Layout> tag
        'import_position': 3
    },
    'NotFound.tsx': {
        'title': '404 Page Not Found | The Court Direct',
        'description': 'The page you are looking for could not be found. Return to our homepage or use our court directory to find the information you need.',
        'insert_after_line': None,
        'import_position': 2
    },
    'PrivacyPolicy.tsx': {
        'title': 'Privacy Policy | The Court Direct',
        'description': 'Read our privacy policy to learn how The Court Direct collects, uses, and protects your personal information when you use our court directory and legal resources.',
        'insert_after_line': None,
        'import_position': 1
    },
    'TermsOfService.tsx': {
        'title': 'Terms of Service | The Court Direct',
        'description': 'Review our terms of service outlining the rules and regulations for using The Court Direct website and legal information resources.',
        'insert_after_line': None,
        'import_position': 1
    },
    'Sitemap.tsx': {
        'title': 'Sitemap | The Court Direct - Site Directory',
        'description': 'Browse our sitemap to easily navigate all pages on The Court Direct website, including court directories, legal resources, and information guides.',
        'insert_after_line': None,
        'import_position': 2
    },
    'WriteForUs.tsx': {
        'title': 'Write for Us | The Court Direct - Legal Writing Opportunities',
        'description': 'Join The Court Direct as a legal contributor. Submit legal articles and share your expertise with our audience. Learn about our guest post guidelines and submission process.',
        'insert_after_line': None,
        'import_position': 3
    }
}

def add_meta_tags(filepath, page_name):
    """Add Helmet import and meta tags to a page"""
    config = META_TAGS.get(page_name)
    if not config:
        print(f"No configuration for {page_name}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Check if Helmet already exists
    content = ''.join(lines)
    if 'Helmet' in content:
        print(f"✓ {page_name} already has Helmet")
        return False
    
    # Find import line to add after
    import_line = None
    for i, line in enumerate(lines):
        if 'import' in line and 'from' in line:
            import_line = i
            if import_line >= config['import_position'] - 1:
                break
    
    # Insert Helmet import
    if import_line is not None:
        lines.insert(import_line + 1, 'import { Helmet } from "react-helmet-async";\n')
    
    # Find <Layout> opening tag
    layout_line = None
    for i, line in enumerate(lines):
        if '<Layout>' in line:
            layout_line = i
            break
    
    if layout_line is None:
        print(f"Could not find <Layout> in {page_name}")
        return False
    
    # Insert Helmet tags after <Layout>
    helmet_content = f'''      <Helmet>
        <title>{config['title']}</title>
        <meta name="description" content="{config['description']}" />
      </Helmet>
'''
    lines.insert(layout_line + 1, helmet_content)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print(f"✓ Added meta tags to {page_name}")
    return True

def main():
    pages_dir = r'd:\thecourtdirect\src\pages'
    
    modified = []
    for page_name in META_TAGS.keys():
        filepath = os.path.join(pages_dir, page_name)
        if os.path.exists(filepath):
            if add_meta_tags(filepath, page_name):
                modified.append(page_name)
        else:
            print(f"File not found: {page_name}")
    
    print(f"\n{'='*60}")
    print(f"Modified {len(modified)} pages")
    if modified:
        print("Pages updated:")
        for page in modified:
            print(f"  - {page}")

if __name__ == "__main__":
    main()
