import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom'; // Use JSDOM to parse HTML

const DIST_DIR = path.resolve('dist');

function getFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getFiles(file));
        } else if (file.endsWith('index.html')) {
            results.push(file);
        }
    });
    return results;
}

async function verify() {
    console.log('--- SEO HTML Audit ---');
    const files = getFiles(DIST_DIR);
    console.log(`Found ${files.length} HTML files.`);

    let errors = 0;
    let warnings = 0;

    for (const file of files) {
        const html = fs.readFileSync(file, 'utf8');
        const dom = new JSDOM(html);
        const doc = dom.window.document;
        const relativePath = path.relative(DIST_DIR, file);

        const title = doc.querySelector('title')?.textContent;
        const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content');
        const h1 = doc.querySelector('h1')?.textContent;
        const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href');

        const fileIssues = [];

        if (!title) fileIssues.push('❌ Missing <title>');
        else if (title.length < 30) fileIssues.push(`⚠️ Title too short (${title.length}): ${title}`);

        if (!desc) fileIssues.push('❌ Missing Meta Description');
        else if (desc.length < 100) fileIssues.push(`⚠️ Desc too short (${desc.length}): ${desc}`);

        if (!h1) fileIssues.push('❌ Missing <h1>');
        
        if (!canonical) fileIssues.push('❌ Missing Canonical Tag');

        if (fileIssues.length > 0) {
            console.log(`\nFile: ${relativePath}`);
            fileIssues.forEach(issue => {
                console.log(`  ${issue}`);
                if (issue.includes('❌')) errors++;
                else warnings++;
            });
        }
    }

    console.log(`\n--- Audit Complete ---`);
    console.log(`Total Errors: ${errors}`);
    console.log(`Total Warnings: ${warnings}`);
}

verify().catch(console.error);
