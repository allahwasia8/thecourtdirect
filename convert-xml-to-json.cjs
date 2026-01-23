const fs = require('fs');
const xml2js = require('xml2js');

// Read the XML file
const xmlFilePath = 'thecourtdirect.WordPress.2026-01-21.xml';
const jsonFilePath = 'thecourtdirect.WordPress.2026-01-21.json';

console.log('Reading XML file...');

try {
  const xmlData = fs.readFileSync(xmlFilePath, 'utf8');
  console.log(`File size: ${(xmlData.length / 1024 / 1024).toFixed(2)} MB`);

  // Parse XML to JavaScript object
  console.log('Parsing XML to JSON...');
  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true,
    normalize: true,
    normalizeTags: true,
    trim: true
  });

  parser.parseString(xmlData, (err, result) => {
    if (err) {
      console.error('Error parsing XML:', err.message);
      console.error('Full error:', err);
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
    console.log(`📄 Output: ${jsonFilePath}`);
    console.log(`📊 Total posts/pages: ${itemCount}`);
    console.log(`📏 JSON file size: ${(jsonData.length / 1024 / 1024).toFixed(2)} MB`);
  });
} catch (error) {
  console.error('Error:', error.message);
  console.error('Full error:', error);
  process.exit(1);
}
