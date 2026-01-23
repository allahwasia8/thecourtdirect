const fs = require('fs');
const content = fs.readFileSync('public/data/posts/legal-terminology.json', 'utf8');
const json = JSON.parse(content);
console.log(json.content.substring(0, 1000));
