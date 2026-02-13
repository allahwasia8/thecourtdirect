
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prerender() {
  const distPath = path.resolve(__dirname, '../dist');
  const courtsPath = path.resolve(__dirname, '../public/data/courts.json');
  const postsPath = path.resolve(__dirname, '../public/data/blog-posts.json');
  const LIMIT = 500; // Limit for this run to avoid crash
  
  // 1. Load Data
  console.log('Loading data...');
  
  let courts = [];
  if (fs.existsSync(courtsPath)) {
    courts = JSON.parse(fs.readFileSync(courtsPath, 'utf8'));
  } else {
    console.warn('Warning: courts.json not found');
  }

  let posts = [];
  if (fs.existsSync(postsPath)) {
    posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
  } else {
    console.warn('Warning: blog-posts.json not found');
  }

  console.log(`Found ${courts.length} courts and ${posts.length} blog posts.`);

  // 2. Start Local Server
  console.log('Starting local server...');
  const server = spawn('npx', ['serve', '-s', 'dist', '-p', '3000'], {
    stdio: 'pipe',
    shell: true
  });

  server.stderr.on('data', (data) => {
    console.error(`Status Server Error: ${data}`);
  });

  server.stdout.on('data', (data) => {
    if (data.toString().includes('http://localhost:3000')) {
      console.log('Server is running at http://localhost:3000');
    }
  });

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 10000));

  // 3. Launch Puppeteer
  console.log('Launching browser...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch (err) {
    console.error('Failed to launch browser:', err);
    server.kill();
    process.exit(1);
  }

  // 4. Prerender Function
  const prerenderPage = async (url, outputPath) => {
    const page = await browser.newPage();
    
    // Log console messages from the browser
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('Debug')) {
        console.log(`PAGE [${msg.type()}]: ${msg.text()}`);
      }
    });
    page.on('pageerror', err => {
      console.error(`PAGE ERROR: ${err.toString()}`);
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      // Wait for h1 or our specific ID, but don't crash if it fails
      try {
          await page.waitForSelector('h1, #main-h1', { timeout: 15000 });
          // Debugging SEO tags
          const debugInfo = await page.evaluate(() => {
            return {
              title: document.title,
              metaDesc: document.querySelector('meta[name="description"]')?.getAttribute('content'),
              h1: document.querySelector('h1')?.textContent
            };
          });
          console.log(`Debug [${url}]: Title: ${debugInfo.title}, H1: ${debugInfo.h1?.substring(0,20)}`);
      } catch (e) {
          console.warn(`Warning: H1 selector not found for ${url}, capturing anyway.`);
      }
      
      const html = await page.content();
      
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }
      fs.writeFileSync(path.join(outputPath, 'index.html'), html);
      return true;
    } catch (err) {
      console.error(`Failed to prerender ${url}:`, err.message);
      return false;
    } finally {
      await page.close();
    }
  };

  // 5. Process Directories
  console.log('Prerendering Directories...');
  await prerenderPage('http://localhost:3000/directory', path.join(distPath, 'directory'));
  
  const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
  for (const state of states) {
    await prerenderPage(`http://localhost:3000/courts/${state}`, path.join(distPath, 'courts', state));
  }

  // 6. Process Courts
  console.log('Prerendering Courts...');
  const BATCH_SIZE = 5;
  let successCount = 0;
  let failCount = 0;

  const courtsToProcess = courts.slice(0, LIMIT);
  for (let i = 0; i < courtsToProcess.length; i += BATCH_SIZE) {
    const batch = courtsToProcess.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(court => {
      const url = `http://localhost:3000/court/${court.id}`;
      const outputDir = path.join(distPath, 'court', court.id);
      return prerenderPage(url, outputDir);
    }));
    
    successCount += results.filter(r => r).length;
    failCount += results.filter(r => !r).length;

    if ((i + BATCH_SIZE) % 50 === 0) {
      console.log(`Progress: ${i + BATCH_SIZE}/${courtsToProcess.length} courts. Success: ${successCount}, Failed: ${failCount}`);
      // Give the system a breather
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // 7. Process Blog Posts
  console.log('Prerendering Blog Posts...');
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(post => {
      const url = `http://localhost:3000/${post.id}`; // Blog posts are at root
      const outputDir = path.join(distPath, post.id);
      return prerenderPage(url, outputDir);
    }));
  }

  // 8. Cleanup
  await browser.close();
  server.kill();
  console.log(`Prerendering complete. Final Stats - Courts: ${successCount} Succeeded, ${failCount} Failed.`);
  process.exit(0);
}

prerender();
