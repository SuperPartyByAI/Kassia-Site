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
      const match = cpanelUrl.match(/(https:\/\/[^/]+:[0-9]+\/cpsess[0-9]+)/);
      if (match) {
          const baseUrl = match[1];
          console.log("Base URL:", baseUrl);
          
          console.log("Preluam inregistrarile DNS (cPanel API 2)...");
          const fetchDns = await page.evaluate(async (baseUrl) => {
              const res = await fetch(baseUrl + '/json-api/cpanel?cpanel_jsonapi_apiversion=2&cpanel_jsonapi_module=ZoneEdit&cpanel_jsonapi_func=fetchzone&domain=kassia.ro');
              return await res.json();
          }, baseUrl);
          
          console.log("Rezultat:", fetchDns);
          
          if (fetchDns.cpanelresult && fetchDns.cpanelresult.data) {
              const aRecords = fetchDns.cpanelresult.data[0].record.filter(r => r.type === 'A' && (r.name === 'kassia.ro.' || r.name === 'www.kassia.ro.'));
              console.log("A Records:", aRecords);
              
              for (const record of aRecords) {
                  console.log(`Updatam ${record.name} -> 89.167.115.150`);
                  const updateRes = await page.evaluate(async (baseUrl, line) => {
                      const params = new URLSearchParams({
                          cpanel_jsonapi_apiversion: '2',
                          cpanel_jsonapi_module: 'ZoneEdit',
                          cpanel_jsonapi_func: 'edit_zone_record',
                          domain: 'kassia.ro',
                          line: line,
                          address: '89.167.115.150'
                      });
                      const res = await fetch(baseUrl + '/json-api/cpanel?' + params.toString());
                      return await res.json();
                  }, baseUrl, record.line);
                  console.log("Update result:", updateRes);
              }
              console.log("Toate inregistrarile A au fost setate cu succes la 89.167.115.150!");
          }
      }

      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
});
