
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
  const server = spawn('npx', ['serve', '-s', 'dist', '-p', '3000'], {
    stdio: 'inherit',
    shell: true
  });

  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 3. Launch Puppeteer
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: "new"
  });

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

  // 5. Process Courts
  console.log('Prerendering Courts...');
  const BATCH_SIZE = 5;
  for (let i = 0; i < courts.length; i += BATCH_SIZE) {
    const batch = courts.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(court => {
      const url = `http://localhost:3000/court/${court.id}`;
      const outputDir = path.join(distPath, 'court', court.id);
      return prerenderPage(url, outputDir);
    }));
    if ((i + BATCH_SIZE) % 100 === 0) console.log(`Processed ${i + BATCH_SIZE} courts...`);
  }

  // 6. Process Blog Posts
  console.log('Prerendering Blog Posts...');
  for (let i = 0; i < posts.length; i += BATCH_SIZE) {
    const batch = posts.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(post => {
      const url = `http://localhost:3000/${post.id}`; // Blog posts are at root
      const outputDir = path.join(distPath, post.id);
      return prerenderPage(url, outputDir);
    }));
    if ((i + BATCH_SIZE) % 100 === 0) console.log(`Processed ${i + BATCH_SIZE} posts...`);
  }

  // 7. Cleanup
  await browser.close();
  server.kill();
  console.log('Prerendering complete.');
  process.exit(0);
}

prerender();
