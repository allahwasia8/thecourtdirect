const fs = require('fs');
const path = require('path');

const BLOG_POSTS_PATH = path.join(__dirname, '../public/data/blog-posts.json');

function cleanString(str) {
    if (typeof str !== 'string') return str;
    
    let newStr = str;
    // Replace specific entities found
    newStr = newStr.replace(/&#8211;/g, '-');
    newStr = newStr.replace(/&#8217;/g, "'");
    newStr = newStr.replace(/&#038;/g, '&');
    newStr = newStr.replace(/&amp;/g, '&');
    // Add more if needed
    
    return newStr;
}

function main() {
    console.log('Reading blog-posts.json...');
    const raw = fs.readFileSync(BLOG_POSTS_PATH, 'utf8');
    const posts = JSON.parse(raw);
    
    let updatedCount = 0;
    
    for (const post of posts) {
        let modified = false;
        
        const fields = ['title', 'excerpt', 'category'];
        
        for (const field of fields) {
            if (post[field]) {
                const cleaned = cleanString(post[field]);
                if (cleaned !== post[field]) {
                    // console.log(`Cleaning ${field} in "${post.title}":`);
                    // console.log(`  Was: "${post[field]}"`);
                    // console.log(`  Now: "${cleaned}"`);
                    post[field] = cleaned;
                    modified = true;
                }
            }
        }
        
        if (modified) {
            updatedCount++;
        }
    }
    
    if (updatedCount > 0) {
        fs.writeFileSync(BLOG_POSTS_PATH, JSON.stringify(posts, null, 2));
        console.log(`\nSuccess! Cleaned entities in ${updatedCount} posts.`);
    } else {
        console.log('\nNo posts needed cleaning.');
    }
}

main();
