const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const COURTS_JSON_PATH = path.join(__dirname, '../public/data/courts.json');

const URLS_FILE_PATH = path.join(__dirname, '../scripts/court_urls.txt');

// Helper to normalize string for comparison
function normalize(str) {
    return str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
}

async function scrapeUrl(url) {
    try {
        // console.log(`Fetching ${url}...`); // Reduce noise
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        const html = await response.text();
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        // Extract Name (Usually H1)
        const nameParams = doc.querySelector('h1')?.textContent?.trim();
        if (!nameParams) {
          // console.warn(`No H1 found for ${url}`);
          return null;
        }
        
        // The name usually is "Court Name - Location"
        const name = nameParams;

        // Extract "Useful Links" section if possible or just main content
        let website = '';
        const links = Array.from(doc.querySelectorAll('a'));
        
        // Strategy: Look for link text "Visit Court Website" or similar
        const websiteLink = links.find(a => a.textContent.toLowerCase().includes('visit court website'));
        if (websiteLink) {
            website = websiteLink.href;
        }

        return {
            name,
            website,
            url
        };

    } catch (err) {
        // console.error(`Error scraping ${url}:`, err.message);
        return null; // Silent fail for cleaner output
    }
}

async function main() {
    // 1. Load existing courts
    const rawData = fs.readFileSync(COURTS_JSON_PATH, 'utf8');
    const courts = JSON.parse(rawData);
    
    // 2. Load URLs
    const urlFileContent = fs.readFileSync(URLS_FILE_PATH, 'utf8');
    const TARGET_URLS = urlFileContent.split('\n').map(l => l.trim()).filter(l => l && l.startsWith('http'));

    console.log(`Loaded ${TARGET_URLS.length} URLs to scrape.`);
    
    let updatedCount = 0;
    let processedCount = 0;

    // 3. Scrape each URL
    for (const url of TARGET_URLS) {
        processedCount++;
        if (processedCount % 50 === 0) console.log(`Processed ${processedCount}/${TARGET_URLS.length}...`);
        
        const data = await scrapeUrl(url);
        if (!data) continue;

        // 4. Find matching court in DB
        const match = courts.find(c => normalize(c.name) === normalize(data.name));
        
        if (match) {
            let changed = false;
            
            if (data.website && !match.website) {
                match.website = data.website;
                changed = true;
            }
            
            if (changed) {
                updatedCount++;
            }
        }
        
        // Politeness delay - slightly faster since we have many
        await new Promise(r => setTimeout(r, 200));
    }

    // 5. Save results
    if (updatedCount > 0) {
        fs.writeFileSync(COURTS_JSON_PATH, JSON.stringify(courts, null, 2));
        console.log(`\nSuccess! Updated ${updatedCount} courts.`);
    } else {
        console.log('\nNo courts updated (or all already up to date).');
    }
}

main();
