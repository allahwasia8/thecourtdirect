const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, '../gellery');

try {
    const files = fs.readdirSync(galleryDir);
    console.log('Files in gallery:');
    files.forEach(file => console.log(file));
} catch (err) {
    console.error('Error listing gallery:', err);
}
