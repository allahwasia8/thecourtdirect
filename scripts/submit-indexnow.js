import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const DIST_DIR = path.resolve(__dirname, '../dist'); // Optional: check if dist exists, but better to source from data
const DATA_DIR = path.resolve(PUBLIC_DIR, 'data');

const HOST = 'thecourtdirect.com';
const INDEXNOW_ENDPOINT = 'api.indexnow.org';

async function submitToIndexNow() {
  console.log('🔍 Identifying IndexNow Key...');
  
  // 1. Find Key File
  const files = fs.readdirSync(PUBLIC_DIR);
  const keyFile = files.find(f => /^[a-f0-9]{32,}\.txt$/i.test(f));
  
  if (!keyFile) {
    console.error('❌ No IndexNow key file found in public/ directory!');
    process.exit(1);
  }
  
  const keyWrapper = fs.readFileSync(path.join(PUBLIC_DIR, keyFile), 'utf-8').trim();
  const key = keyFile.replace('.txt', ''); // Usually key is filename, content might match
  
  console.log(`✅ Found Key: ${key}`);

  // 2. Generate URL List
  console.log('📦 Generating URL List...');
  const urls = [];
  
  // Static pages
  urls.push(`https://${HOST}/`);
  urls.push(`https://${HOST}/directory`);
  urls.push(`https://${HOST}/blog`);
  urls.push(`https://${HOST}/contact`);
  urls.push(`https://${HOST}/about`);
  urls.push(`https://${HOST}/find-court`);
  
  // State Directories
  const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
  states.forEach(state => {
    urls.push(`https://${HOST}/courts/${state}`);
  });
  
  // Courts
  if (fs.existsSync(path.join(DATA_DIR, 'courts.json'))) {
    const courts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'courts.json'), 'utf-8'));
    courts.forEach(c => urls.push(`https://${HOST}/court/${c.id}`));
  }
  
  // Blog Posts
  if (fs.existsSync(path.join(DATA_DIR, 'blog-posts.json'))) {
    const posts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'blog-posts.json'), 'utf-8'));
    posts.forEach(p => urls.push(`https://${HOST}/${p.id}`));
  }
  
  console.log(`📊 Total URLs to submit: ${urls.length}`);
  
  // 3. Submit in Batches (Limit 10,000 per request, keeping it smaller for safety)
  const BATCH_SIZE = 1000;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    console.log(`🚀 Submitting batch ${i / BATCH_SIZE + 1} (${batch.length} URLs)...`);
    
    const payload = JSON.stringify({
      host: HOST,
      key: key,
      keyLocation: `https://${HOST}/${keyFile}`,
      urlList: batch
    });
    
    await new Promise((resolve, reject) => {
      const options = {
        hostname: INDEXNOW_ENDPOINT,
        port: 443,
        path: '/indexnow',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload)
        }
      };
      
      const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Batch success: ${res.statusCode}`);
            resolve();
          } else {
            console.error(`❌ Batch failed: ${res.statusCode} - ${responseBody}`);
            // Don't reject, just log and continue? Or strict fail?
            // IndexNow might rate limit, so maybe wait?
            resolve(); 
          }
        });
      });
      
      req.on('error', (e) => {
        console.error(`❌ Request error: ${e.message}`);
        resolve();
      });
      
      req.write(payload);
      req.end();
    });
    
    // Nice delay
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('🎉 IndexNow submission complete!');
}

submitToIndexNow().catch(e => console.error(e));
