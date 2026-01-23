const fs = require('fs');
const path = require('path');

const BLOG_POSTS_PATH = path.join(__dirname, '../public/data/blog-posts.json');

function main() {
    console.log('Reading blog-posts.json...');
    const raw = fs.readFileSync(BLOG_POSTS_PATH, 'utf8');
    const posts = JSON.parse(raw);
    
    console.log(`Total posts before cleanup: ${posts.length}`);
    
    // Filter out posts with no image
    // Keep posts where image is a string and not empty
    const postsWithImages = posts.filter(post => {
        return post.image && typeof post.image === 'string' && post.image.trim() !== '';
    });
    
    const deletedCount = posts.length - postsWithImages.length;
    
    if (deletedCount > 0) {
        fs.writeFileSync(BLOG_POSTS_PATH, JSON.stringify(postsWithImages, null, 2));
        console.log(`\nSuccess! Deleted ${deletedCount} posts without images.`);
        console.log(`Remaining posts: ${postsWithImages.length}`);
    } else {
        console.log('\nNo posts found without images. Nothing to delete.');
    }
}

main();
