const fs = require('fs');
const path = require('path');

const COURTS_JSON_PATH = path.join(__dirname, '../public/data/courts.json');

function cleanString(str) {
    if (typeof str !== 'string') return str;
    
    let newStr = str;
    // Replace known entities
    newStr = newStr.replace(/#8211;/g, '-');
    newStr = newStr.replace(/&#8211;/g, '-');
    newStr = newStr.replace(/&ndash;/g, '-');
    newStr = newStr.replace(/&amp;/g, '&');
    newStr = newStr.replace(/&nbsp;/g, ' ');

    // Normalize unicode dashes to hyphen if desired, or keep as is.
    // User specifically mentioned #8211; which is En Dash.
    // If it's literally #8211; in the text
    
    return newStr;
}

function processCourts() {
    console.log('Reading courts.json...');
    const raw = fs.readFileSync(COURTS_JSON_PATH, 'utf8');
    const courts = JSON.parse(raw);
    
    let changedCount = 0;
    
    for (const court of courts) {
        let modified = false;
        
        // Fields to clean
        const fields = ['name', 'description', 'city', 'address', 'building'];
        
        for (const field of fields) {
            if (court[field]) {
                const cleaned = cleanString(court[field]);
                if (cleaned !== court[field]) {
                    console.log(`Cleaning ${field} for ${court.id}:`);
                    console.log(`  Was: "${court[field]}"`);
                    console.log(`  Now: "${cleaned}"`);
                    court[field] = cleaned;
                    modified = true;
                }
            }
        }
        
        if (modified) changedCount++;
    }
    
    if (changedCount > 0) {
        console.log(`\nFixed ${changedCount} records.`);
        fs.writeFileSync(COURTS_JSON_PATH, JSON.stringify(courts, null, 2));
    } else {
        console.log('\nNo records needed cleaning.');
        
        // Debug check to see if we missed anything (case insensitive search for 8211)
        if (raw.includes('8211')) {
            console.warn('WARNING: "8211" found in raw file but not cleaned?');
        }
    }
}

processCourts();
