const fs = require('fs');
const content = fs.readFileSync('public/data/posts/legal-terminology.json', 'utf8');
const json = JSON.parse(content);
fs.writeFileSync('temp_terms.html', json.content);
