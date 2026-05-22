import { spawn } from 'child_process';
import http from 'http';

async function waitPort(port) {
  for(let i=0; i<30; i++) {
    try {
      await new Promise((res, rej) => {
        const req = http.get(`http://localhost:${port}/`, (r) => res(true));
        req.on('error', rej);
      });
      return true;
    } catch(e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  return false;
}

async function run() {
  console.log("Starting PROD server...");
  const server = spawn('node', ['./dist/server/entry.mjs'], { env: { ...process.env, PORT: '4321', HOST: '127.0.0.1' } });
  
  const ready = await waitPort(4321);
  if (!ready) {
    console.log("Server failed to start.");
    server.kill();
    return;
  }
  console.log("PROD Server started on 4321.");
  
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

  server.kill();
}
run();
