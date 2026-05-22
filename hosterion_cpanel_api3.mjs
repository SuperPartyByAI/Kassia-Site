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
      
      const page = pages.find((p) => p.url().includes("hosterion.ro") || p.url().includes("2083"));
      if (!page) {
        console.log("Nu am gasit tab-ul Hosterion.");
        process.exit(1);
      }
      
      await page.bringToFront();
      
      const cpanelUrl = page.url();
      console.log("URL CPanel curent:", cpanelUrl);
      
      const match = cpanelUrl.match(/(https:\/\/[^/]+:[0-9]+\/cpsess[0-9]+)/);
      if (match) {
          const baseUrl = match[1];
          console.log("Base UAPI URL:", baseUrl);
          
          console.log("Preluam inregistrarile DNS pentru kassia.ro...");
          const fetchDns = await page.evaluate(async (baseUrl) => {
              try {
                  const res = await fetch(baseUrl + '/execute/ZoneEdit/fetch_zone_records?domain=kassia.ro');
                  return await res.json();
              } catch(e) {
                  return { error: e.toString() };
              }
          }, baseUrl);
          
          console.log("Rezultat fetch DNS:", fetchDns);
          
          if (fetchDns.data) {
              const aRecords = fetchDns.data.filter(r => r.type === 'A' && (r.name === 'kassia.ro.' || r.name === 'www.kassia.ro.'));
              console.log("A Records curente:", aRecords);
              
              for (const record of aRecords) {
                  console.log(`Updatam ${record.name} -> 89.167.115.150`);
                  const updateRes = await page.evaluate(async (baseUrl, line) => {
                      const res = await fetch(baseUrl + `/execute/ZoneEdit/edit_zone_record?domain=kassia.ro&line=${line}&address=89.167.115.150`);
                      return await res.json();
                  }, baseUrl, record.line);
                  console.log("Update result:", updateRes);
              }
              console.log("Am setat corect toate inregistrarile in cPanel!");
          }
      } else {
          console.log("Nu suntem in cPanel.");
      }

      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
});
