import xml.etree.ElementTree as ET
import json
import sys

xml_file = 'thecourtdirect.WordPress.2026-01-21.xml'
json_file = 'thecourtdirect.WordPress.2026-01-21.json'

print('Reading XML file...')
try:
    with open(xml_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f'File size: {len(content) / 1024 / 1024:.2f} MB')
    print('Fixing incomplete XML...')
    
    # Add missing closing tags
    if '</rss>' not in content:
        # Close any open tags
        if '<wp:meta_value>' in content and content.count('<wp:meta_value>') > content.count('</wp:meta_value>'):
            print('Adding </wp:meta_value>')
            content += '</wp:meta_value>\n'
        
        if '<wp:postmeta>' in content and content.count('<wp:postmeta>') > content.count('</wp:postmeta>'):
            print('Adding </wp:postmeta>')
            content += '\t\t</wp:postmeta>\n'
        
        if '<item>' in content and content.count('<item>') > content.count('</item>'):
            print('Adding </item>')
            content += '\t</item>\n'
        
        print('Adding </channel> and </rss>')
        content += '</channel>\n</rss>'
    
    # Save fixed XML
    fixed_xml = 'thecourtdirect.WordPress.2026-01-21.fixed.xml'
    with open(fixed_xml, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Saved fixed XML to: {fixed_xml}')
    
    # Parse XML
    print('Parsing XML...')
    root = ET.fromstring(content)
    
    # Convert to dict
    def elem_to_dict(elem):
        d = {elem.tag: {} if elem.attrib else None}
        children = list(elem)
        if children:
            dd = {}
            for dc in map(elem_to_dict, children):
                for k, v in dc.items():
                    if k in dd:
                        if not isinstance(dd[k], list):
                            dd[k] = [dd[k]]
                        dd[k].append(v)
                    else:
                        dd[k] = v
            d = {elem.tag: dd}
        if elem.attrib:
            d[elem.tag].update(('@' + k, v) for k, v in elem.attrib.items())
        if elem.text:
            text = elem.text.strip()
            if children or elem.attrib:
                if text:
                    d[elem.tag]['#text'] = text
            else:
                d[elem.tag] = text
        return d
    
    result = elem_to_dict(root)
    
    # Write JSON
    print('Writing JSON file...')
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    # Stats
    with open(json_file, 'r') as f:
        json_content = f.read()
    
    # Count items
    items = root.findall('.//{http://wordpress.org/export/1.2/}post_type')
    
    print('\n✅ Conversion complete!')
    print(f'📄 Input: {xml_file}')
    print(f'📄 Fixed XML: {fixed_xml}')
    print(f'📄 Output: {json_file}')
    print(f'📏 JSON file size: {len(json_content) / 1024 / 1024:.2f} MB')
    print('\n⚠️  Note: The original XML was incomplete. The last post may have missing data.')
    
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)
