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
      
      console.log("Navigam catre serviciul wowparty.ro (id=11505)...");
      await page.goto("https://hosterion.ro/client/clientarea.php?action=productdetails&id=11505", { waitUntil: 'networkidle2' });
      
      console.log("Cautam butonul de Autentificare in cPanel...");
      const cpanelLink = await page.evaluate(() => {
          // In WHMCS, butonul de cPanel este de obicei un formular cu actiunea 'dologin.php' sau un link
          const form = document.querySelector('form[action*="dologin"]');
          if(form) {
              form.submit();
              return true;
          }
          
          const links = Array.from(document.querySelectorAll('a'));
          const cp = links.find(a => a.innerText.toLowerCase().includes('cpanel'));
          if (cp) {
              cp.click();
              return true;
          }
          return false;
      });
      
      if(cpanelLink) {
          console.log("Am dat click pe login cPanel. Asteptam 10 secunde sa se incarce...");
          await new Promise(r => setTimeout(r, 10000)); // asteptam redurectionarea cPanel (care dureaza)
          
          const html = await page.content();
          fs.writeFileSync('cpanel_page.html', html);
          console.log("Am salvat pagina de cPanel.");
      } else {
          console.log("Nu am gasit butonul de cPanel.");
      }

      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
});
