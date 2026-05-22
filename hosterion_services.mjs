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
      
      console.log("Mergem la lista de servicii...");
      await page.goto("https://hosterion.ro/client/clientarea.php?action=services", { waitUntil: 'networkidle2' });
      
      const html = await page.content();
      fs.writeFileSync('services_page.html', html);
      console.log("Am salvat pagina de servicii.");

      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
});
