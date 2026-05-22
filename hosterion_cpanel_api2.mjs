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
      
      console.log("Navigam direct catre link-ul de SSO cPanel...");
      await page.goto("https://hosterion.ro/client/clientarea.php?action=productdetails&id=11505&dosinglesignon=1", { waitUntil: 'networkidle2' });
      
      await new Promise(r => setTimeout(r, 10000)); // wait for cPanel SSO redirect to finish
      
      const cpanelUrl = page.url();
      console.log("URL CPanel (dupa redirect):", cpanelUrl);
      
      const match = cpanelUrl.match(/(https:\/\/[^/]+:[0-9]+\/cpsess[0-9]+)/);
      if (match) {
          const baseUrl = match[1];
          console.log("Base UAPI URL:", baseUrl);
          
          console.log("Verificam/Cream domeniul kassia.ro in cPanel...");
          const addDomainRes = await page.evaluate(async (baseUrl) => {
              const res = await fetch(baseUrl + '/execute/DomainInfo/single_domain_data?domain=kassia.ro');
              const json = await res.json();
              if (json.errors && json.errors.length > 0) {
                  const createRes = await fetch(baseUrl + '/execute/AddonDomain/add_addon_domain?newdomain=kassia.ro&dir=kassia.ro&subdomain=kassia');
                  return await createRes.json();
              } else {
                  return { status: "already_exists", data: json.data };
              }
          }, baseUrl);
          
          console.log("Rezultat Add Domain:", addDomainRes);
          
          console.log("Preluam inregistrarile DNS pentru kassia.ro...");
          const fetchDns = await page.evaluate(async (baseUrl) => {
              const res = await fetch(baseUrl + '/execute/ZoneEdit/fetch_zone_records?domain=kassia.ro');
              return await res.json();
          }, baseUrl);
          
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
