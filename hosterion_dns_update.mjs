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
      
      const page = pages.find((p) => p.url().includes("hosterion.ro/client/clientarea.php"));
      if (!page) {
        console.log("Nu am gasit tab-ul Hosterion.");
        process.exit(1);
      }
      
      await page.bringToFront();
      
      // Navigam la lista de domenii (fara overlays)
      console.log("Mergem la lista de domenii...");
      await page.goto("https://hosterion.ro/client/clientarea.php?action=domains", { waitUntil: 'networkidle2' });
      
      console.log("Am ajuns in lista de domenii. Caut kassya.ro...");
      
      // Cautam butonul de 'Administrare' sau id-ul domeniului
      const domainId = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          for (let a of links) {
              if (a.href && a.href.includes('clientarea.php?action=domaindetails&id=')) {
                  // Verificam daca randul respectiv contine kassya.ro
                  const tr = a.closest('tr');
                  if (tr && tr.innerText.toLowerCase().includes('kassya.ro')) {
                      const urlParams = new URLSearchParams(a.href.split('?')[1]);
                      return urlParams.get('id');
                  }
              }
          }
          return null;
      });
      
      if (domainId) {
          console.log(`Am gasit ID-ul domeniului: ${domainId}. Navigam la management...`);
          await page.goto(`https://hosterion.ro/client/clientarea.php?action=domaindetails&id=${domainId}`, { waitUntil: 'networkidle2' });
          
          // Apoi navigam la sectiunea de DNS (de obicei un modul WHMCS)
          // Din pacate rutele pot diferi. Incercam linkurile vizibile.
          await page.evaluate(() => {
              const menuLinks = Array.from(document.querySelectorAll('a'));
              const dnsLink = menuLinks.find(a => a.innerText.toLowerCase().includes('dns') || a.innerText.toLowerCase().includes('management dns') || (a.href && a.href.includes('dns')));
              if (dnsLink) {
                  dnsLink.click();
              }
          });
          
          console.log("Te-am adus in zona domeniului Kassya.ro. Daca modulul DNS s-a deschis, tot ce trebuie sa faci e sa pui A Record la 89.167.115.150 si sa apesi Salveaza.");
      } else {
          console.log("Nu am putut gasi kassya.ro in lista de domenii.");
      }

      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
}).on("error", (err) => {
  console.log("Error:", err.message);
});
