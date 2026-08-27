const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const PORT = 3000;
const HOST = `http://localhost:${PORT}`;
const ROUTES = [
  { path: '/login', file: 'login.html', title: 'Login | Message50', desc: 'Securely log in to Message50 E2EE chat.', selector: 'form' },
  { path: '/register', file: 'register.html', title: 'Register | Message50', desc: 'Create a secure Message50 account.', selector: 'form' },
  { path: '/app', file: 'app.html', title: 'App | Message50', desc: 'Securely chat E2EE with Message50 web app.', selector: 'main' }
];

async function checkServer() {
  return new Promise((resolve) => {
    http.get(HOST, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('🚀 Starting Vite dev server for prerendering...');
  const devServer = spawn('npx', ['vite', '--port', PORT], {
    shell: true,
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, BROWSER: 'none' }
  });

  // Handle server output
  devServer.stdout.on('data', (data) => {
    console.log(`[Vite] ${data.toString().trim()}`);
  });

  devServer.stderr.on('data', (data) => {
    console.error(`[Vite Error] ${data.toString().trim()}`);
  });

  // Wait for server to start
  let attempts = 0;
  while (!(await checkServer())) {
    attempts++;
    if (attempts > 30) {
      console.error('❌ Failed to start Vite dev server after 30 seconds.');
      devServer.kill();
      process.exit(1);
    }
    await sleep(1000);
  }
  console.log(`✅ Vite server is online at ${HOST}`);

  // Launch browser
  console.log('🌐 Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const baseTemplatePath = path.resolve(__dirname, '../index.html');
  const baseHtml = fs.readFileSync(baseTemplatePath, 'utf8');

  // Prerender each route
  const outputDir = path.resolve(__dirname, '../prerendered-htmls');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const route of ROUTES) {
    console.log(`📸 Prerendering ${route.path} -> ${route.file}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
      await page.goto(`${HOST}${route.path}`, { waitUntil: 'networkidle0' });
      await page.waitForSelector(route.selector, { timeout: 10000 });
      await sleep(1000);

      // Get inner HTML of the root element
      const rootContent = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root ? root.innerHTML : '';
      });

      if (!rootContent) {
        throw new Error(`Empty root content for route ${route.path}`);
      }

      // Merge with baseTemplate HTML
      let prerenderedHtml = baseHtml;

      // 1. Replace the innerHTML of <div id="root">
      const rootRegex = /(<div id="root"[^>]*>)([\s\S]*?)(<\/div>)/;
      prerenderedHtml = prerenderedHtml.replace(rootRegex, `$1${rootContent}$3`);

      // 2. Replace title and descriptions
      prerenderedHtml = prerenderedHtml.replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`);
      prerenderedHtml = prerenderedHtml.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${route.desc}" />`);
      
      // Replace OG titles/descriptions
      prerenderedHtml = prerenderedHtml.replace(/<meta property="og:title" content=".*?" \/>/g, `<meta property="og:title" content="${route.title}" />`);
      prerenderedHtml = prerenderedHtml.replace(/<meta property="og:description" content=".*?" \/>/g, `<meta property="og:description" content="${route.desc}" />`);
      prerenderedHtml = prerenderedHtml.replace(/<meta name="twitter:title" content=".*?" \/>/g, `<meta name="twitter:title" content="${route.title}" />`);
      prerenderedHtml = prerenderedHtml.replace(/<meta name="twitter:description" content=".*?" \/>/g, `<meta name="twitter:description" content="${route.desc}" />`);

      // Save file
      const destPath = path.join(outputDir, route.file);
      fs.writeFileSync(destPath, prerenderedHtml, 'utf8');
      console.log(`💾 Saved ${route.file} successfully!`);

    } catch (err) {
      console.error(`❌ Error prerendering ${route.path}:`, err);
    } finally {
      await page.close();
    }
  }

  // Cleanup
  console.log('🧹 Shutting down...');
  await browser.close();
  devServer.kill();
  console.log('🎉 Prerendering complete!');
  process.exit(0);
}

run();
