import puppeteer from 'puppeteer-core';
import http from 'http';

const wait = (ms) => new Promise(res => setTimeout(res, ms));

http.get("http://127.0.0.1:52151/json/version", (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", async () => {
    try {
      const { webSocketDebuggerUrl } = JSON.parse(data);
      const browser = await puppeteer.connect({
        browserWSEndpoint: webSocketDebuggerUrl,
        defaultViewport: null
      });
      
      console.log("Deschidem tab-ul cu Host-ul corect pentru Kassya...");
      const page = await browser.newPage();
      
      // Setam header-ul "Host" ca serverul NGINX sa stie ca vrem Kassya, nu Divertix!
      await page.setExtraHTTPHeaders({
          'Host': 'kassya.ro'
      });
      
      await page.bringToFront();
      
      console.log("Navigam catre serverul Hetzner folosind Host-ul Kassya...");
      await page.goto("http://89.167.115.150", { waitUntil: 'networkidle2' });
      await wait(1500);
      
      console.log("Simulam navigarea vizuala (Scroll in jos)...");
      await page.evaluate(() => window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' }));
      await wait(2000);
      await page.evaluate(() => window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' }));
      await wait(2000);
      
      console.log("Cautam un link intern ca sa demonstram schimbarea paginii...");
      const linkHref = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          const internalLinks = links.filter(a => {
              const href = a.getAttribute('href');
              // acceptam link-uri de genul /ceva
              return href && href.startsWith('/') && href.length > 1;
          });
          
          if(internalLinks.length > 0) {
              const randomLink = internalLinks[Math.floor(Math.random() * internalLinks.length)];
              return randomLink.href;
          }
          return null;
      });
      
      if(linkHref) {
          // Deoarece link-urile ar putea fi abolute spre kassya.ro (care nu e inca propagat),
          // trebuie sa fortam navigarea tot spre IP cu Host-ul setat daca e nevoie.
          // Totusi, setExtraHTTPHeaders se aplica la toate cererile paginii, deci goto spre o ruta relativa pe IP va merge perfect!
          
          let targetUrl = linkHref;
          if (targetUrl.includes('kassya.ro')) {
             targetUrl = targetUrl.replace(/https?:\/\/kassya\.ro/, 'http://89.167.115.150');
          } else if (targetUrl.startsWith('/')) {
             targetUrl = 'http://89.167.115.150' + targetUrl;
          }
          
          console.log(`Accesăm link-ul intern...`);
          await page.goto(targetUrl, { waitUntil: 'networkidle2' });
          await wait(2000);
          
          console.log("Suntem pe pagina interna! Scroll...");
          await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
          await wait(2500);
          
          console.log("Ne intoarcem inapoi (Back)...");
          await page.goBack({ waitUntil: 'networkidle2' });
          await wait(2000);
      }
      
      console.log("Demonstratia Kassya s-a incheiat!");
      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
}).on("error", (err) => {
  console.log("Error:", err.message);
});
