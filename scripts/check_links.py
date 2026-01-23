import os
import re
import json

def check_file_for_issues(filepath, relative_path):
    """Check a single file for broken links and placeholders"""
    issues = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        
        for line_num, line in enumerate(lines, 1):
            # Check for placeholder URLs
            if re.search(r'(example\.com|placeholder|PLACEHOLDER|TODO|FIXME|xxx|XXX)', line, re.IGNORECASE):
                issues.append({
                    'file': relative_path,
                    'line': line_num,
                    'type': 'placeholder',
                    'content': line.strip()[:100]
                })
            
            # Check for broken internal links
            if re.search(r'(href|to|src)=["\']([^"\']+)["\']', line):
                matches = re.finditer(r'(href|to|src)=["\']([^"\']+)["\']', line)
                for match in matches:
                    url = match.group(2)
                    # Check for obviously broken links
                    if url.startswith('#') or url.startswith('http'):
                        continue  # External or hash links, skip
                    if url.startswith('/') and not url.startswith('//'):
                        # Internal link - basic validation
                        if '..' in url or url.endswith('/undefined'):
                            issues.append({
                                'file': relative_path,
                                'line': line_num,
                                'type': 'suspicious_link',
                                'content': f'{match.group(1)}="{url}"'
                            })
            
            # Check for placeholder text
            placeholder_patterns = [
                r'Lorem ipsum',
                r'Your (company|name|email|text) here',
                r'Replace this',
                r'Add your',
                r'\[Your .+?\]',
                r'Sample text',
                r'\(555\) 123-4567',  # Placeholder phone
            ]
            
            for pattern in placeholder_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    issues.append({
                        'file': relative_path,
                        'line': line_num,
                        'type': 'placeholder_text',
                        'content': line.strip()[:100]
                    })
                    break
                    
    except Exception as e:
        pass
    
    return issues

def scan_directory(base_dir, root_dir):
    """Scan directory for issues"""
    all_issues = []
    
    for root, dirs, files in os.walk(base_dir):
        # Skip node_modules and .git
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', 'build']]
        
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js', '.json', '.html', '.css')):
                filepath = os.path.join(root, file)
                relative_path = os.path.relpath(filepath, root_dir)
                issues = check_file_for_issues(filepath, relative_path)
                all_issues.extend(issues)
    
    return all_issues

def main():
    root_dir = r"d:\thecourtdirect"
    
    print("Scanning for broken links and placeholders...\n")
    
    # Scan src directory
    src_issues = scan_directory(os.path.join(root_dir, 'src'), root_dir)
    
    # Scan public/data (JSON files)
    data_issues = scan_directory(os.path.join(root_dir, 'public', 'data'), root_dir)
    
    all_issues = src_issues + data_issues
    
    if not all_issues:
        print("✓ No broken links or placeholders found!")
        return
    
    # Group by type
    by_type = {}
    for issue in all_issues:
        issue_type = issue['type']
        if issue_type not in by_type:
            by_type[issue_type] = []
        by_type[issue_type].append(issue)
    
    # Print results
    for issue_type, issues in by_type.items():
        print(f"\n{'='*60}")
        print(f"{issue_type.upper().replace('_', ' ')} ({len(issues)} found)")
        print('='*60)
        
        # Limit output to first 20 per type
        for issue in issues[:20]:
            print(f"\nFile: {issue['file']}")
            print(f"Line {issue['line']}: {issue['content']}")
        
        if len(issues) > 20:
            print(f"\n... and {len(issues) - 20} more")
    
    print(f"\n\nTotal issues found: {len(all_issues)}")

if __name__ == "__main__":
    main()
