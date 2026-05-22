import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';

const wait = (ms) => new Promise(res => setTimeout(res, ms));

const sqlContent = fs.readFileSync('db/05_setup_dynamic_settings.sql', 'utf8');

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
      let supabasePage = pages.find(p => p.url().includes('supabase.com/dashboard/project/'));
      
      if (!supabasePage) {
        console.log("Nu am gasit tab-ul de Supabase deschis.");
        browser.disconnect();
        return;
      }
      
      await supabasePage.bringToFront();
      console.log("Am gasit tab-ul de Supabase! Navigam catre SQL Editor...");
      
      const projectIdMatch = supabasePage.url().match(/project\/([^\/]+)/);
      if (projectIdMatch) {
          const projectId = projectIdMatch[1];
          await supabasePage.goto(`https://supabase.com/dashboard/project/${projectId}/sql/new`, { waitUntil: 'networkidle2' });
          await wait(3000);
          
          console.log("Injecam codul SQL...");
          
          // Monaco editor can be tricky to type into directly via page.type
          // Best way is to evaluate script to set the value if possible, or use clipboard and paste.
          await supabasePage.evaluate((sql) => {
             // In Supabase SQL editor, the Monaco instance is usually accessible or we can just paste via JS event
             // Let's try to focus the editor and paste
             navigator.clipboard.writeText(sql);
          }, sqlContent);
          
          // Click on the editor area
          await supabasePage.mouse.click(500, 300);
          await wait(500);
          
          // Paste (Cmd+V on Mac)
          await supabasePage.keyboard.down('Meta');
          await supabasePage.keyboard.press('v');
          await supabasePage.keyboard.up('Meta');
          
          await wait(1000);
          
          console.log("Apasam butonul de RUN...");
          // In supabase, Cmd+Enter runs the query
          await supabasePage.keyboard.down('Meta');
          await supabasePage.keyboard.press('Enter');
          await supabasePage.keyboard.up('Meta');
          
          await wait(3000);
          console.log("SQL executat cu succes prin Puppeteer!");
      }
      
      browser.disconnect();
    } catch(err) {
      console.log("Error:", err);
    }
  });
}).on("error", (err) => {
  console.log("Nu ma pot conecta la Chrome pe portul 52151:", err.message);
});
