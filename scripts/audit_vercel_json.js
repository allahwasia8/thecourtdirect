import fs from 'fs';

const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

function findInvalid(arr, name) {
    if (!arr) return;
    arr.forEach((item, index) => {
        // Vercel V2 redirects/rewrites don't like raw * or ? in source
        if (item.source && (item.source === '/*' || item.source === '*' || item.source.includes('?'))) {
            console.log(`❌ ERROR: ${name} at index ${index} has INVALID source: "${item.source}"`);
        }
        // Check for (.*) which is old V1 style
        if (item.source && item.source.includes('(.*)')) {
            console.log(`⚠️ WARNING: ${name} at index ${index} uses regex (.*): "${item.source}". Use :path* instead.`);
        }
    });
}

console.log('--- REWRITES ---');
findInvalid(vercelJson.rewrites, 'Rewrite');

console.log('--- REDIRECTS ---');
findInvalid(vercelJson.redirects, 'Redirect');
