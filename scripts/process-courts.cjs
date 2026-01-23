const fs = require('fs');
const path = require('path');

// 1. Define files and their category types
const masterFile = "D:\\thecourtdirect\\Courts\\all.csv";

const categoryFiles = [
    {
        path: "D:\\thecourtdirect\\Courts\\US Courts of Appeals.csv",
        type: "Appeals Court",
        skipLines: 3,
        mapping: { name: 0 } 
    },
    {
        path: "D:\\thecourtdirect\\Courts\\US district courts.csv",
        type: "District Court",
        skipLines: 1,
        mapping: { name: 0 }
    },
    {
        path: "D:\\thecourtdirect\\Courts\\bankcruptcy.csv",
        type: "Bankruptcy Court",
        skipLines: 1,
        mapping: { name: 0 }
    },
    {
        path: "D:\\thecourtdirect\\Courts\\Federal Defender Organizations.csv",
        type: "Federal Defender Organization",
        skipLines: 1,
        mapping: { name: 0 }
    },
    {
        path: "D:\\thecourtdirect\\Courts\\U.S. Probation and Pretrial Services.csv",
        type: "Probation & Pretrial Services",
        skipLines: 1,
        mapping: { name: 0 }
    }
];

const outputDir = path.join(__dirname, '..', 'public', 'data');
const outputFile = path.join(outputDir, 'courts.json');

// Ensure directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

function parseCSVLine(line) {
    // Improved CSV parser that handles quotes and commas inside quotes
    const matches = [];
    let currentMatch = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            matches.push(currentMatch.trim().replace(/^"|"$/g, '')); // Trim and remove surrounding quotes
            currentMatch = '';
        } else {
            currentMatch += char;
        }
    }
    matches.push(currentMatch.trim().replace(/^"|"$/g, '')); // Push last field
    return matches;
}

// 2. Read Master File and Create Initial Court Objects
console.log(`Reading Master File: ${masterFile}...`);
if (!fs.existsSync(masterFile)) {
    console.error(`❌ Master file not found: ${masterFile}`);
    process.exit(1);
}

const masterContent = fs.readFileSync(masterFile, 'utf8');
const masterLines = masterContent.split('\n').slice(1); // Skip header

// We store a list of all courts to check output count
const allCourts = [];
// We also use a Map -> Name to [CourtObject, CourtObject...] for type assignment
// Because names are not unique.
const courtMap = new Map(); 

let masterCount = 0;

// Helper to ensure unique IDs
const idCounts = new Map();

masterLines.forEach(line => {
    if (!line.trim()) return;
    const columns = parseCSVLine(line);
    
    if (!columns || columns.length < 1) return;

    // Mapping for all.csv:
    // name: 0
    // hq: 2 
    // address: 3
    // maps: 4
    // phone: 5
    
    const name = columns[0];
    const isHeadquarters = (columns[2] || '') === 'Headquarters';
    const rawAddress = columns[3] || '';
    const mapsUrl = columns[4] || '';
    const phone = columns[5] || '';

    let city = '';
    let state = '';
    let zip = '';
    let building = name;
    let address = rawAddress;

    // Look for "City, ST ZIP" pattern
    const addrMatch = rawAddress.match(/([a-zA-Z\s\.]+),\s([A-Z]{2})\s(\d{5}(?:-\d{4})?)$/);
    if (addrMatch) {
        city = addrMatch[1].trim();
        state = addrMatch[2];
        zip = addrMatch[3];
        
        const suffix = `, ${city}, ${state} ${zip}`;
        if (rawAddress.endsWith(suffix)) {
             address = rawAddress.substring(0, rawAddress.length - suffix.length).trim();
        } else if (rawAddress.includes(suffix)) {
             address = rawAddress.replace(suffix, '').trim();
        } else {
             const fullMatch = addrMatch[0];
             address = rawAddress.replace(fullMatch, '').trim();
             if (address.endsWith(',')) address = address.slice(0, -1).trim();
        }
    }

    // Generate Unique ID
    let baseId = slugify(name);
    // If we have city, append it to make it more unique/semantic
    if (city) {
        baseId = `${baseId}-${slugify(city)}`;
    }
    
    if (idCounts.has(baseId)) {
        let count = idCounts.get(baseId);
        count++;
        idCounts.set(baseId, count);
        baseId = `${baseId}-${count}`;
    } else {
        idCounts.set(baseId, 1);
    }

    const courtObj = {
        id: baseId,
        name: name,
        city: city,
        state: state,
        address: address || rawAddress,
        zip: zip,
        phone: phone,
        types: [], 
        building: building || name,
        headquarters: isHeadquarters,
        mapsUrl: mapsUrl,
        website: "", 
        hours: "Monday - Friday: 9:00 AM - 4:00 PM",
        description: `${name}.` 
    };

    allCourts.push(courtObj);

    if (!courtMap.has(name)) {
        courtMap.set(name, []);
    }
    courtMap.get(name).push(courtObj);

    masterCount++;
});

console.log(`✅ Loaded ${masterCount} courts from master list.`);

// 3. Process Category Files to Assign Types
categoryFiles.forEach(fileInfo => {
    console.log(`Processing ${fileInfo.type} file: ${fileInfo.path}...`);
    if (!fs.existsSync(fileInfo.path)) {
        console.error(`❌ File not found: ${fileInfo.path}`);
        return;
    }

    const content = fs.readFileSync(fileInfo.path, 'utf8');
    const lines = content.split('\n').slice(fileInfo.skipLines);

    let matchCount = 0;
    lines.forEach(line => {
        if (!line.trim()) return;
        const columns = parseCSVLine(line);
        if (!columns || columns.length < 1) return;
        
        if (columns.length <= fileInfo.mapping.name) return;

        const name = columns[fileInfo.mapping.name];
        
        if (courtMap.has(name)) {
            // Apply to ALL courts with this name
            const matchingCourts = courtMap.get(name);
            matchingCourts.forEach(court => {
                if (!court.types.includes(fileInfo.type)) {
                    court.types.push(fileInfo.type);
                }
            });
            matchCount++;
        }
    });
    console.log(`✅ Matched ${matchCount} entries in ${fileInfo.type} file.`);
});

// 4. Final Polish and Write Output
allCourts.forEach(court => {
    if (court.types.length === 0) {
        court.types.push("United States Court"); 
    }
});

fs.writeFileSync(outputFile, JSON.stringify(allCourts, null, 2));
console.log(`\n🎉 Successfully processed ${allCourts.length} courts.`);
console.log(`📂 Output saved to ${outputFile}`);
