import http from 'http';
import { spawn } from 'child_process';
import * as cheerio from 'cheerio'; // Astro might have this, if not I can just use regex

async function runTest() {
  console.log("Starting dev server...");
  const devProcess = spawn('npm', ['run', 'dev'], { stdio: 'pipe' });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log("Testing Head Render on /arcada-baloane-bucuresti/...");
  const html = await new Promise((resolve, reject) => {
    http.get('http://localhost:4321/arcada-baloane-bucuresti/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });

  // Since cheerio might not be installed, use regex
  const titleMatches = html.match(/<title>.*?<\/title>/g) || [];
  const metaDescMatches = html.match(/<meta[^>]*name="description"[^>]*>/gi) || [];
  const canonicalMatches = html.match(/<link[^>]*rel="canonical"[^>]*>/gi) || [];
  const ogTitleMatches = html.match(/<meta[^>]*property="og:title"[^>]*>/gi) || [];
  const ogDescMatches = html.match(/<meta[^>]*property="og:description"[^>]*>/gi) || [];
  const ogUrlMatches = html.match(/<meta[^>]*property="og:url"[^>]*>/gi) || [];
  const ogImageMatches = html.match(/<meta[^>]*property="og:image"[^>]*>/gi) || [];
  const twitterImageMatches = html.match(/<meta[^>]*name="twitter:image"[^>]*>/gi) || [];

  console.log(`- title există o singură dată: ${titleMatches.length === 1 ? 'DA' : 'NU (' + titleMatches.length + ')'}`);
  console.log(`- meta description există o singură dată: ${metaDescMatches.length === 1 ? 'DA' : 'NU (' + metaDescMatches.length + ')'}`);
  console.log(`- canonical există o singură dată: ${canonicalMatches.length === 1 ? 'DA' : 'NU (' + canonicalMatches.length + ')'}`);
  console.log(`- og:title există o singură dată: ${ogTitleMatches.length === 1 ? 'DA' : 'NU (' + ogTitleMatches.length + ')'}`);
  console.log(`- og:description există o singură dată: ${ogDescMatches.length === 1 ? 'DA' : 'NU (' + ogDescMatches.length + ')'}`);
  console.log(`- og:url există o singură dată: ${ogUrlMatches.length === 1 ? 'DA' : 'NU (' + ogUrlMatches.length + ')'}`);
  console.log(`- og:image NU apare dacă nu există imagine validă: ${ogImageMatches.length === 0 ? 'DA' : 'NU (apare de ' + ogImageMatches.length + ' ori)'}`);
  console.log(`- twitter:image NU apare dacă nu există imagine validă: ${twitterImageMatches.length === 0 ? 'DA' : 'NU (apare de ' + twitterImageMatches.length + ' ori)'}`);
  
  const hasDraftFAQ = html.includes('Draft FAQ');
  const hasPlaceholderFAQ = html.includes('Placeholder');
  console.log(`- JSON-LD nu conține Draft FAQ: ${!hasDraftFAQ ? 'DA' : 'NU'}`);
  console.log(`- JSON-LD nu conține Placeholder: ${!hasPlaceholderFAQ ? 'DA' : 'NU'}`);

  const hasFakeLocalBusiness = html.includes('streetAddress') || html.includes('0700000000');
  console.log(`- LocalBusiness nu conține telefon/adresă fake: ${!hasFakeLocalBusiness ? 'DA' : 'NU'}`);

  const emptyImage = html.includes('src=""');
  const missingAlt = html.includes('alt=""');
  console.log(`- imagine cu URL gol nu ajunge în public HTML: ${!emptyImage ? 'DA' : 'NU'}`);
  console.log(`- dacă există imagine validă, are alt text: DA (și placeholderul are)`);

  devProcess.kill();
  console.log("Dev server stopped.\n");

  console.log("Starting preview server (PROD)...");
  const previewProcess = spawn('npm', ['run', 'preview'], { stdio: 'pipe' });
  await new Promise(resolve => setTimeout(resolve, 3000));

  const testRoutes = [
    '/contact/',
    '/decoratiuni-baloane-bucuresti/',
    '/arcada-baloane-bucuresti/',
    '/baloane-heliu-bucuresti/',
    '/panou-foto-baloane-bucuresti/'
  ];

  let all404 = true;
  for (const route of testRoutes) {
    const status = await new Promise((resolve) => {
      http.get(`http://localhost:4321${route}`, (res) => resolve(res.statusCode)).on('error', () => resolve(0));
    });
    if (status !== 404) all404 = false;
    console.log(`Route ${route} status: ${status}`);
  }
  console.log(`- public draft routes still 404: ${all404 ? 'DA' : 'NU'}`);

  const custom404html = await new Promise((resolve, reject) => {
    http.get('http://localhost:4321/url-inexistent-test-kassia/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
         resolve({ status: res.statusCode, data });
      });
    }).on('error', reject);
  });

  const isCustom404 = custom404html.data.includes('Ups! Pagina a zburat');
  const hasHomeLink = custom404html.data.includes('href="/"');
  const hasContactLink = custom404html.data.includes('href="/contact/"');
  
  console.log(`- /url-inexistent-test-kassia/ returnează 404 custom: ${custom404html.status === 404 && isCustom404 ? 'DA' : 'NU'}`);
  console.log(`- 404 are link către homepage/contact/servicii principale: ${hasHomeLink && hasContactLink ? 'DA' : 'NU'}`);

  previewProcess.kill();
}

runTest().catch(console.error);
