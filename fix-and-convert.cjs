const fs = require('fs');
const xml2js = require('xml2js');

const xmlFilePath = 'thecourtdirect.WordPress.2026-01-21.xml';
const jsonFilePath = 'thecourtdirect.WordPress.2026-01-21.json';
const fixedXmlPath = 'thecourtdirect.WordPress.2026-01-21.fixed.xml';

console.log('Reading XML file...');
let xmlData = fs.readFileSync(xmlFilePath, 'utf8');

console.log(`Original file size: ${(xmlData.length / 1024 / 1024).toFixed(2)} MB`);

// Try to fix incomplete XML by adding closing tags
console.log('Attempting to fix incomplete XML...');

// Find where it cuts off and determine what tags need to be closed
const lines = xmlData.split('\n');
console.log(`Total lines: ${lines.length}`);

// Check what tags are unclosed
const openTags = [];
let fixedXml = xmlData.trim();

// Add missing closing tags based on the WordPress export structure
if (!fixedXml.includes('</wp:postmeta>') && fixedXml.includes('<wp:postmeta>')) {
  console.log('Adding missing </wp:postmeta>');
  fixedXml += '\n\t\t</wp:postmeta>';
}

if (!fixedXml.includes('</wp:meta_value>') && fixedXml.includes('<wp:meta_value>')) {
  console.log('Adding missing </wp:meta_value>');
 fixedXml += '\n\t\t</wp:meta_value>';
}

if (!fixedXml.includes('</item>', fixedXml.lastIndexOf('<item'))) {
  console.log('Adding missing </item>');
  fixedXml += '\n\t</item>';
}

if (!fixedXml.includes('</channel>')) {
  console.log('Adding missing </channel>');
  fixedXml += '\n</channel>';
}

if (!fixedXml.includes('</rss>')) {
  console.log('Adding missing </rss>');
  fixedXml += '\n</rss>';
}

// Save fixed XML
console.log(`Writing fixed XML to: ${fixedXmlPath}`);
fs.writeFileSync(fixedXmlPath, fixedXml, 'utf8');

// Parse fixed XML to JSON
console.log('Parsing fixed XML to JSON...');
const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
  normalize: true,
  normalizeTags: true,
  trim: true
});

parser.parseString(fixedXml, (err, result) => {
  if (err) {
    console.error('Error parsing XML:', err.message);
    console.error('\nThe XML file may still have structural issues.');
    console.error('You may need to re-export from WordPress to get a complete file.');
    process.exit(1);
  }

  // Write JSON to file
  console.log('Writing JSON file...');
  const jsonData = JSON.stringify(result, null, 2);
  fs.writeFileSync(jsonFilePath, jsonData, 'utf8');

  // Get statistics
  const items = result.rss?.channel?.item;
  const itemCount = Array.isArray(items) ? items.length : (items ? 1 : 0);
  
  console.log('\n✅ Conversion complete!');
  console.log(`📄 Input: ${xmlFilePath}`);
  console.log(`📄 Fixed XML: ${fixedXmlPath}`);
  console.log(`📄 Output: ${jsonFilePath}`);
  console.log(`📊 Total posts/pages: ${itemCount}`);
  console.log(`📏 JSON file size: ${(jsonData.length / 1024 / 1024).toFixed(2)} MB`);
  console.log('\n⚠️  Note: The original XML was incomplete. The last post may have missing data.');
});
