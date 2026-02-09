
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
  const server = spawn('cmd.exe', ['/c', 'npx serve -s dist -p 3000'], {
    stdio: 'pipe', // Change to pipe to capture errors
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
  await new Promise(resolve => setTimeout(resolve, 5000));

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
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      // Wait for h1 to ensure content loaded
      await page.waitForSelector('h1', { timeout: 10000 });
      
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

  for (let i = 0; i < courts.length; i += BATCH_SIZE) {
    const batch = courts.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(court => {
      const url = `http://localhost:3000/court/${court.id}`;
      const outputDir = path.join(distPath, 'court', court.id);
      return prerenderPage(url, outputDir);
    }));
    
    successCount += results.filter(r => r).length;
    failCount += results.filter(r => !r).length;

    if ((i + BATCH_SIZE) % 50 === 0) {
      console.log(`Progress: ${i + BATCH_SIZE}/${courts.length} courts. Success: ${successCount}, Failed: ${failCount}`);
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
