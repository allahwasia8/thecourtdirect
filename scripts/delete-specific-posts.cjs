const fs = require('fs');
const path = require('path');

const BLOG_POSTS_PATH = path.join(__dirname, '../public/data/blog-posts.json');

const TARGET_IDS = [
    'alabama-governors-mansion'
];

function main() {
    console.log('Reading blog-posts.json...');
    const raw = fs.readFileSync(BLOG_POSTS_PATH, 'utf8');
    const posts = JSON.parse(raw);
    
    console.log(`Total posts before cleanup: ${posts.length}`);
    
    // Filter out posts with matching IDs
    const remainingPosts = posts.filter(post => !TARGET_IDS.includes(post.id));
    
    const deletedCount = posts.length - remainingPosts.length;
    
    if (deletedCount > 0) {
        fs.writeFileSync(BLOG_POSTS_PATH, JSON.stringify(remainingPosts, null, 2));
        console.log(`\nSuccess! Deleted ${deletedCount} posts.`);
        console.log(`Remaining posts: ${remainingPosts.length}`);
    } else {
        console.log('\nNo matching posts found to delete.');
    }
}

main();
