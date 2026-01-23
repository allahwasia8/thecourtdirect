const fs = require('fs');
const path = require('path');

const BLOG_POSTS_PATH = path.join(__dirname, '../public/data/blog-posts.json');

function main() {
    console.log('Reading blog-posts.json...');
    const raw = fs.readFileSync(BLOG_POSTS_PATH, 'utf8');
    const posts = JSON.parse(raw);
    
    let updatedCount = 0;
    
    for (const post of posts) {
        let modified = false;
        
        // Ensure categories array exists
        if (!post.categories) {
            post.categories = [];
        }
        
        const titleLower = post.title ? post.title.toLowerCase() : '';
        
        // Rule 1: "How to" -> "FAQ's"
        if (titleLower.includes('how to')) {
            const cat = "FAQ's";
            if (!post.categories.includes(cat)) {
                post.categories.push(cat);
                modified = true;
                console.log(`[FAQ's] Added to: "${post.title}"`);
            }
        }
        
        // Rule 2: "Family court" -> "Family court"
        if (titleLower.includes('family court')) {
            const cat = "Family court";
            if (!post.categories.includes(cat)) {
                post.categories.push(cat);
                modified = true;
                console.log(`[Family court] Added to: "${post.title}"`);
            }
        }
        
        if (modified) {
            updatedCount++;
        }
    }
    
    if (updatedCount > 0) {
        fs.writeFileSync(BLOG_POSTS_PATH, JSON.stringify(posts, null, 2));
        console.log(`\nSuccess! Updated categories for ${updatedCount} posts.`);
    } else {
        console.log('\nNo posts matched the criteria or categories were already present.');
    }
}

main();
