const https = require('https');

const url = "https://thecourtdirect.com/wp-content/uploads/2025/02/Alabama-Governors-Mansion.jpg";

https.get(url, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
}).on('error', (e) => {
    console.error(e);
});
