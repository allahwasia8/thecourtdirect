import fs from 'fs';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COURTS_FILE = path.join(__dirname, '../public/data/courts.json');
const BATCH_SIZE = 5;
// Use limit from args or default
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const LIMIT = limitArg ? parseInt(limitArg.split('=')[1]) : 50;

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

async function run() {
    if (!fs.existsSync(COURTS_FILE)) {
        console.error("Courts file not found!");
        return;
    }

    const courts = JSON.parse(fs.readFileSync(COURTS_FILE, 'utf8'));
    console.log(`Loaded ${courts.length} courts. Processing limit: ${LIMIT}`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    // Set a realistic User Agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    let updatedCount = 0;
    let savedCount = 0;

    for (let i = 0; i < courts.length; i++) {
        if (updatedCount >= LIMIT) break;

        const court = courts[i];
        
        // Remove city from query to avoid junk data issues
        const query = `${court.name} ${court.state} official site`;
        console.log(`[${updatedCount + 1}/${LIMIT}] Searching (${i}): ${query}`);

        try {
            // Use Lite version for easier scraping (static HTML)
            await page.goto(`https://lite.duckduckgo.com/lite/`, { waitUntil: 'domcontentloaded' });
            
            // Type query and submit
            await page.type('input[name="q"]', query);
            await page.click('input[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

            // Extract results
            const results = await page.evaluate(() => {
                const data = [];
                // Lite version uses tables. 
                // Titles are in .result-link
                // Snippets are in .result-snippet
                
                const links = document.querySelectorAll('.result-link');
                const snippets = document.querySelectorAll('.result-snippet');
                
                for (let i = 0; i < Math.min(links.length, 5); i++) {
                    const linkEl = links[i];
                    const snippetEl = snippets[i];
                    
                    if (linkEl) {
                        data.push({
                            title: linkEl.innerText,
                            link: linkEl.href,
                            snippet: snippetEl ? snippetEl.innerText : ''
                        });
                    }
                }
                return data;
            });

            if (results.length === 0) {
                 console.log("  -> No results extracted (selector mismatch or blocking).");
            }

            // Generate Metadata
            const currentDesc = court.metaDescription;
            let newTitle = `${court.name} - ${court.types ? court.types[0] : 'Court'} | Address & Phone`;
            let newDesc = null;

            if (results.length > 0) {
                // Find best description
                let bestSnippet = null;
                for (const res of results) {
                    if (res.link.includes('.gov') || res.link.includes('.org')) {
                        if (res.snippet && res.snippet.length > 50) {
                            bestSnippet = res.snippet;
                            break;
                        }
                    }
                }
                
                if (!bestSnippet && results[0].snippet.length > 50) {
                    bestSnippet = results[0].snippet;
                }

                if (bestSnippet) {
                   // Clean up
                   if (bestSnippet.includes('...')) {
                       bestSnippet = bestSnippet.split('...')[0] + '.';
                   }
                   newDesc = bestSnippet;
                }
            }

            // Update if better
            if (newDesc && newDesc !== currentDesc) {
                court.metaTitle = newTitle;
                court.metaDescription = newDesc;
                console.log(`  -> Updated: ${newDesc.substring(0, 60)}...`);
                updatedCount++;
            } else {
                // console.log(`  -> No improvement found.`);
            }

        } catch (error) {
            console.error(`  -> Error searching: ${error.message}`);
        }

        // Save periodically
        if (updatedCount > 0 && updatedCount % BATCH_SIZE === 0 && updatedCount > savedCount) {
            fs.writeFileSync(COURTS_FILE, JSON.stringify(courts, null, 2));
            console.log(`  -> Saved progress to ${COURTS_FILE}`);
            savedCount = updatedCount;
        }

        // Delay
        const pause = Math.floor(Math.random() * 2000) + 1000;
        await delay(pause);
    }

    fs.writeFileSync(COURTS_FILE, JSON.stringify(courts, null, 2));
    console.log("Batch update completed.");
    await browser.close();
}

run();
