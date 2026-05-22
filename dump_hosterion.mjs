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
      if (page) {
          const html = await page.content();
          fs.writeFileSync('domain_page.html', html);
          console.log("Am salvat pagina de domenii in domain_page.html");
      }
      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
});
