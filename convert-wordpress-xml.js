const fs = require("fs");
const xml2js = require("xml2js");

// Read the XML file
const xmlFilePath =
  "D:\\thecourtdirect\\thecourtdirect.WordPress.2026-01-21.xml";
const jsonFilePath =
  "D:\\thecourtdirect\\thecourtdirect.WordPress.2026-01-21.json";

console.log("Reading XML file...");
const xmlData = fs.readFileSync(xmlFilePath, "utf8");

// Parse XML to JavaScript object
console.log("Parsing XML to JSON...");
const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
  normalize: true,
  normalizeTags: true,
  trim: true,
});

parser.parseString(xmlData, (err, result) => {
  if (err) {
    console.error("Error parsing XML:", err);
    process.exit(1);
  }

  // Write JSON to file
  console.log("Writing JSON file...");
  const jsonData = JSON.stringify(result, null, 2);
  fs.writeFileSync(jsonFilePath, jsonData, "utf8");

  // Get statistics
  const items = result.rss?.channel?.item;
  const itemCount = Array.isArray(items) ? items.length : items ? 1 : 0;

  console.log("\n✅ Conversion complete!");
  console.log(`📄 Input: ${xmlFilePath}`);
  console.log(`📄 Output: ${jsonFilePath}`);
  console.log(`📊 Total posts/pages: ${itemCount}`);
  console.log(`📏 JSON file size: ${(jsonData.length / 1024).toFixed(2)} KB`);
});
