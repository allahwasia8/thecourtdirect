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

const BATCH_SIZE = process.env.VERCEL ? 10 : 8; // Concurrency limit
const LIMIT = process.env.PRERENDER_LIMIT ? parseInt(process.env.PRERENDER_LIMIT) : 2500; // Allow full site

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
  console.log(`Found ${courts.length} courts and ${posts.length} blog posts. Total to process: ${Math.min(LIMIT, courts.length + posts.length + 50)}`);

  // 2. Start Local Server
  const server = spawn('npx', ['serve', '-s', 'dist', '-p', '3000'], {
    stdio: 'ignore', // Suppress noisy serve logs
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
        args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
    }
  } catch (err) {
    console.error('Failed to launch browser:', err);
    server.kill();
    process.exit(1);
  }

  // 4. Prerender Worker
  const prerenderPage = async (url, outputPath) => {
    let page;
    try {
      page = await browser.newPage();
      // Block unnecessary resources to speed up loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (['image', 'font', 'media'].includes(type)) req.abort();
        else req.continue();
      });

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      // Short wait for React to hydrate and SEO tags to appear
      await new Promise(r => setTimeout(r, 1500));
      
      const html = await page.content();
      if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath, { recursive: true });
      fs.writeFileSync(path.join(outputPath, 'index.html'), html);
      return true;
    } catch (err) {
      // Silently retry once or just fail
      return false;
    } finally {
      if (page) await page.close();
    }
  };

  // 5. Build Queue
  const queue = [
    { url: 'http://localhost:3000/directory', path: path.join(distPath, 'directory') },
    ...["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"].map(s => ({
      url: `http://localhost:3000/courts/${s}`,
      path: path.join(distPath, 'courts', s)
    })),
    ...courts.slice(0, LIMIT).map(c => ({
      url: `http://localhost:3000/court/${c.id}`,
      path: path.join(distPath, 'court', c.id)
    })),
    ...posts.map(p => ({
      url: `http://localhost:3000/${p.id}`,
      path: path.join(distPath, p.id)
    }))
  ];

  console.log(`Prerendering ${queue.length} pages with concurrency ${BATCH_SIZE}...`);
  
  let success = 0;
  let fail = 0;
  const startTime = Date.now();

  for (let i = 0; i < queue.length; i += BATCH_SIZE) {
    const batch = queue.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(item => prerenderPage(item.url, item.path)));
    
    success += results.filter(r => r).length;
    fail += results.filter(r => !r).length;

    if ((i + BATCH_SIZE) % 100 === 0 || i + BATCH_SIZE >= queue.length) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      console.log(`Progress: ${Math.min(i + BATCH_SIZE, queue.length)}/${queue.length} | Success: ${success} | Failed: ${fail} | Time: ${elapsed}s`);
    }
  }

  // 6. Cleanup
  await browser.close();
  server.kill();
  console.log(`Prerendering complete in ${Math.round((Date.now() - startTime) / 1000)}s.`);
  process.exit(0);
}

prerender();
