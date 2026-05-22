import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';

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
      const pages = await browser.pages();
      
      const page = pages.find((p) => p.url().includes("hosterion.ro"));
      if (!page) {
        console.log("Nu am gasit tab-ul Hosterion.");
        process.exit(1);
      }
      
      await page.bringToFront();
      
      console.log("Mergem la lista de domenii...");
      await page.goto("https://hosterion.ro/client/clientarea.php?action=domains", { waitUntil: 'networkidle2' });
      
      const domainId = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          for (let a of links) {
              if (a.href && a.href.includes('clientarea.php?action=domaindetails&id=')) {
                  const tr = a.closest('tr');
                  if (tr && (tr.innerText.toLowerCase().includes('kassya.ro') || tr.innerText.toLowerCase().includes('kassia.ro'))) {
                      const urlParams = new URLSearchParams(a.href.split('?')[1]);
                      return urlParams.get('id');
                  }
              }
          }
          return null;
      });
      
      if (domainId) {
          console.log(`Am gasit domeniul! ID-ul este: ${domainId}. Navigam la management...`);
          await page.goto(`https://hosterion.ro/client/clientarea.php?action=domaindetails&id=${domainId}`, { waitUntil: 'networkidle2' });
          
          console.log("Cautam sectiunea de DNS...");
          let dnsUrl = await page.evaluate(() => {
              const menuLinks = Array.from(document.querySelectorAll('a'));
              const dnsLink = menuLinks.find(a => 
                a.innerText.toLowerCase().includes('dns') || 
                (a.href && a.href.includes('dns')) ||
                (a.href && a.href.includes('module=dns'))
              );
              return dnsLink ? dnsLink.href : null;
          });
          
          if(dnsUrl) {
              console.log("Am gasit URL-ul de DNS: " + dnsUrl);
              await page.goto(dnsUrl, { waitUntil: 'networkidle2' });
              
              const html = await page.content();
              fs.writeFileSync('dns_page.html', html);
              console.log("Am salvat structura paginii de DNS. O voi analiza si edita.");
          } else {
              console.log("Nu am putut gasi butonul de DNS pe pagina de detalii.");
          }
      } else {
          console.log("Nu am putut gasi nici kassia.ro nici kassya.ro in lista de domenii.");
      }

      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
}).on("error", (err) => {
  console.log("Error:", err.message);
});
