import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import http from 'http';

// Conditional imports for Vercel
let chromium;
let puppeteerCore;
try {
  if (process.env.VERCEL) {
    chromium = (await import('@sparticuz/chromium')).default;
    puppeteerCore = (await import('puppeteer-core')).default;
  }
} catch (e) {
  console.log('Sparticuz chromium not available, falling back to standard puppeteer');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION
const CONCURRENCY = process.env.VERCEL ? 10 : 8; 
const LIMIT = process.env.PRERENDER_LIMIT ? parseInt(process.env.PRERENDER_LIMIT) : 3000;

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  console.log(`Waiting for server at ${url}...`);
  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200) resolve();
          else reject();
        });
        req.on('error', reject);
        req.end();
      });
      console.log('Server is ready!');
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Server timed out');
}

async function prerender() {
  const distPath = path.resolve(__dirname, '../dist');
  const courtsPath = path.resolve(__dirname, '../public/data/courts.json');
  const postsPath = path.resolve(__dirname, '../public/data/blog-posts.json');
  
  // 1. Load Data
  console.log('Loading data...');
  const courts = fs.existsSync(courtsPath) ? JSON.parse(fs.readFileSync(courtsPath, 'utf8')) : [];
  const posts = fs.existsSync(postsPath) ? JSON.parse(fs.readFileSync(postsPath, 'utf8')) : [];
  console.log(`Found ${courts.length} courts and ${posts.length} blog posts.`);

  // 2. Start Local Server
  const server = spawn('npx', ['serve', '-s', 'dist', '-p', '3000'], {
    stdio: 'ignore', 
    shell: true
  });

  try {
    await waitForServer('http://localhost:3000');
  } catch (err) {
    console.error(err.message);
    server.kill();
    process.exit(1);
  }

  // 3. Launch Puppeteer
  console.log('Launching browser...');
  let browser;
  try {
    if (process.env.VERCEL && chromium) {
      browser = await puppeteerCore.launch({
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      });
    }
  } catch (err) {
    console.error('Failed to launch browser:', err);
    server.kill();
    process.exit(1);
  }

  // 4. Setup Worker Pool
  const queue = [
    { url: 'http://localhost:3000/directory', path: path.join(distPath, 'directory') },
    ...["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"].map(s => ({
      url: `http://localhost:3000/courts/${s}`,
      path: path.join(distPath, 'courts', s)
    })),
    ...courts.map(c => ({
      url: `http://localhost:3000/court/${c.id}`,
      path: path.join(distPath, 'court', c.id)
    })),
    ...posts.map(p => ({
      url: `http://localhost:3000/${p.id}`,
      path: path.join(distPath, p.id)
    }))
  ].slice(0, LIMIT);

  console.log(`Starting Worker Pool processing for ${queue.length} pages with ${CONCURRENCY} workers...`);

  let queueIndex = 0;
  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  const worker = async (id) => {
    let page;
    try {
      page = await browser.newPage();
      // Block resources globally for this page instance
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (['image', 'font', 'media', 'stylesheet'].includes(type)) req.abort();
        else req.continue();
      });
    } catch (e) {
      console.error(`Worker ${id} failed to create page:`, e);
      return;
    }

    while (queueIndex < queue.length) {
      const jobIndex = queueIndex++;
      const { url, path: outputPath } = queue[jobIndex];
      
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
        // Minimal wait for hydration
        await new Promise(r => setTimeout(r, 500));
        
        const html = await page.content();
        if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });
        fs.writeFileSync(path.join(outputPath, 'index.html'), html);
        successCount++;
      } catch (err) {
        // console.error(`Failed: ${url}`, err.message);
        failCount++;
      }

      if ((successCount + failCount) % 100 === 0) {
         const elapsed = Math.round((Date.now() - startTime) / 1000);
         const rate = Math.round(((successCount + failCount) / elapsed) * 100) / 100;
         console.log(`Progress: ${successCount + failCount}/${queue.length} | Rate: ${rate} p/s | Time: ${elapsed}s`);
      }
    }
    
    await page.close();
  };

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i));
  }

  await Promise.all(workers);

  // 6. Cleanup
  await browser.close();
  server.kill();
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  console.log(`Prerendering complete! processed ${successCount} pages in ${totalTime}s.`);
  console.log(`Final Rate: ${Math.round((successCount / totalTime) * 100) / 100} pages/second.`);
  process.exit(0);
}

prerender();
