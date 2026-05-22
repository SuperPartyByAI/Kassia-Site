import puppeteer from 'puppeteer-core';
import http from 'http';

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
      
      console.log("Cautam optiunea de nameservere implicite...");
      
      // Selectam radio button-ul
      await page.evaluate(() => {
          const radio = document.querySelector('input[type="radio"][value="default"]');
          if (radio) {
              radio.click();
          }
      });
      
      // Apasam butonul de salvare
      console.log("Apasam butonul de salvare...");
      await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle2' }),
          page.evaluate(() => {
              const btn = Array.from(document.querySelectorAll('input[type="submit"]')).find(el => el.value.includes('Modificare nameservere'));
              if(btn) btn.click();
          })
      ]);
      
      console.log("Nameserverele au fost resetate la cele Hosterion!");

      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
});
