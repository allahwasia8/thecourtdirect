import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITEMAP_FILE = path.join(__dirname, '../public/sitemap.xml');
const KEY = '831d0413206c4b9688a2e6f9b358bec7'; // Generated key
const KEY_FILE = path.join(__dirname, `../public/${KEY}.txt`);
const HOST = 'thecourtdirect.com';

async function submitToIndexNow() {
    console.log('--- IndexNow Submission ---');

    // 1. Create Key File
    if (!fs.existsSync(KEY_FILE)) {
        fs.writeFileSync(KEY_FILE, KEY);
        console.log(`Created key file: ${KEY}.txt`);
    }

    // 2. Extract URLs from sitemap
    if (!fs.existsSync(SITEMAP_FILE)) {
        console.error('Sitemap not found!');
        return;
    }

    const sitemap = fs.readFileSync(SITEMAP_FILE, 'utf8');
    const urls = sitemap.match(/<loc>(https:\/\/thecourtdirect\.com\/[^<]+)<\/loc>/g)
        .map(url => url.replace('<loc>', '').replace('</loc>', ''));

    console.log(`Found ${urls.length} URLs in sitemap.`);

    // 3. Submit in batches (IndexNow allows up to 10,000 URLs)
    const body = {
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: urls
    };

    try {
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            console.log('✅ Successfully submitted all URLs to IndexNow.');
        } else {
            const err = await response.text();
            console.error(`❌ Failed to submit: ${response.status} ${err}`);
        }
    } catch (error) {
        console.error('Error submitting to IndexNow:', error.message);
    }
}

submitToIndexNow();
