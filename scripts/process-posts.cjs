const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, '..', 'thecourtdirect_posts.json');
const outputDir = path.join(__dirname, '..', 'public', 'data');
const postsDir = path.join(outputDir, 'posts');

// Ensure directories exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
}

// Read input
console.log('Reading input file...');
const rawData = fs.readFileSync(inputFile, 'utf8');
const posts = JSON.parse(rawData);

console.log(`Processing ${posts.length} posts...`);

const postList = [];

// Helper to calculate read time
function calculateReadTime(content) {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>?/gm, ''); // Strip HTML
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
}

// Helper to format date
function formatDate(isoString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(isoString).toLocaleDateString('en-US', options);
}

// Helper to get featured image
function getFeaturedImage(post) {
    if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        return post._embedded['wp:featuredmedia'][0].source_url;
    }
    return null;
}

// Helper to get author name
function getAuthor(post) {
    if (post._embedded && post._embedded.author && post._embedded.author[0]) {
        return post._embedded.author[0].name;
    }
    return 'Court Direct Team';
}

// Helper to get category
function getCategory(post) {
    if (post._embedded && post._embedded['wp:term']) {
        const categories = post._embedded['wp:term'][0];
        if (categories && categories.length > 0) {
            return categories[0].name;
        }
    }
    return 'Legal Education';
}

posts.forEach(post => {
    // Skip if no slug
    if (!post.slug) return;

    const readTime = calculateReadTime(post.content.rendered);
    const date = formatDate(post.date);
    const author = getAuthor(post);
    const category = getCategory(post);
    const image = getFeaturedImage(post);

    // Create summary object
    const summary = {
        id: post.slug,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
        author: author,
        date: date,
        readTime: readTime,
        category: category,
        featured: post.sticky || false,
        image: image 
    };

    postList.push(summary);

    // Create full content object
    const fullPost = {
        ...summary,
        content: post.content.rendered,
        authorRole: 'Contributor' // Default role
    };

    // Save individual file
    const filePath = path.join(postsDir, `${post.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(fullPost, null, 2));
});

// Save list
const listPath = path.join(outputDir, 'blog-posts.json');
fs.writeFileSync(listPath, JSON.stringify(postList, null, 2));

console.log(`✅ Generated ${postList.length} post summaries`);
console.log(`✅ Saved individual post files to ${postsDir}`);
console.log(`✅ Saved list to ${listPath}`);
