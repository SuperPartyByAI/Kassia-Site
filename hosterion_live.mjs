import puppeteer from 'puppeteer';

(async () => {
  console.log("Deschidem browser-ul pentru Hosterion...");
  // Launch a visible browser window
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  console.log("Navigam catre Hosterion...");
  await page.goto('https://hosterion.ro/client/clientarea.php', { waitUntil: 'networkidle2' });
  
  try {
    console.log("Completam datele de autentificare...");
    // Asteptam sa apara campul de email
    await page.waitForSelector('input[type="email"], input[name="username"]', { timeout: 5000 });
    
    // Type credentials slowly for visual effect
    await page.type('input[type="email"], input[name="username"]', 'Ursache.andrei1995@gmail.com', { delay: 50 });
    await page.type('input[type="password"]', 'Andreisuperparty123456789!', { delay: 50 });
    
    // Click login
    console.log("Apasam butonul de login...");
    const loginBtn = await page.$('button[type="submit"], input[type="submit"], #login');
    if (loginBtn) {
      await loginBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
    console.log("Autentificare reusita! Cautam panoul de DNS pentru kassya.ro...");
    
    // Once logged in, Hosterion (WHMCS) usually has a "Domenii" or "Domains" link.
    // Since we don't know the exact layout, we will leave the browser open and alert the user.
    // If we want to try to navigate to DNS:
    await page.evaluate(() => {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '10px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.backgroundColor = '#4CAF50';
        overlay.style.color = 'white';
        overlay.style.padding = '15px 30px';
        overlay.style.borderRadius = '8px';
        overlay.style.fontSize = '20px';
        overlay.style.fontWeight = 'bold';
        overlay.style.zIndex = '999999';
        overlay.style.boxShadow = '0 0 20px #4CAF50';
        overlay.innerText = 'AI: Te-am logat cu succes! Te rog să dai click pe Domenii -> Kassya.ro -> DNS Management și să pui IP-ul 89.167.115.150 la inregistrarea A.';
        document.body.appendChild(overlay);
    });
    
  } catch (error) {
    console.log("Am intampinat o problema vizuala la login, dar browserul e deschis:", error.message);
  }
  
  // We intentionally do NOT close the browser so the user can interact with it.
})();
