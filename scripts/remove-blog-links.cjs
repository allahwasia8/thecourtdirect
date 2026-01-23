const fs = require('fs');
const path = require('path');

const postsDir = path.join(__dirname, '../public/data/posts');

if (!fs.existsSync(postsDir)) {
    console.error(`Posts directory not found: ${postsDir}`);
    process.exit(1);
}

const files = fs.readdirSync(postsDir);
let processedCount = 0;
let modifiedCount = 0;

files.forEach(file => {
    if (!file.endsWith('.json')) return;

    const filePath = path.join(postsDir, file);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);

        if (json.content) {
            // Regex to match <a> tags and capture inner text
            // Global (g), Case-insensitive (i)
            // Matches <a ...>...</a> and replaces with ...
            const originalContent = json.content;
            
            // We run this in a loop to handle nested links if any (though invalid HTML, better safe)
            let newContent = originalContent;
            let hasLinks = true;
            
            while (hasLinks) {
                const temp = newContent.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
                if (temp === newContent) {
                    hasLinks = false;
                } else {
                    newContent = temp;
                }
            }

            if (newContent !== originalContent) {
                json.content = newContent;
                fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
                modifiedCount++;
            }
        }
        processedCount++;
    } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
    }
});

console.log(`Processed ${processedCount} files.`);
console.log(`Removed links from ${modifiedCount} files.`);
