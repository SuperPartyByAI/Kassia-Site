import puppeteer from 'puppeteer';

const wait = (ms) => new Promise(res => setTimeout(res, ms));

(async () => {
    console.log("Deschidem o fereastra NOUA (complet izolata) cu DNS fortat spre Hetzner...");
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        userDataDir: '/tmp/puppeteer_kassia_demo_' + Date.now(),
        args: [
            '--start-maximized',
            // Ocoleste propagarea globala a DNS-ului si il trimite direct pe serverul tau Hetzner
            '--host-resolver-rules="MAP kassia.ro 89.167.115.150, MAP www.kassia.ro 89.167.115.150, MAP kassya.ro 89.167.115.150, MAP www.kassya.ro 89.167.115.150"'
        ]
    });
    
    const page = (await browser.pages())[0] || await browser.newPage();
    
    console.log("Navigam pe domeniul oficial kassia.ro (redirectionat local spre IP-ul Hetzner)...");
    await page.goto("http://kassia.ro", { waitUntil: 'networkidle2' });
    await wait(2000);
    
    console.log("Facem scroll sa aratam continutul din baza de date...");
    await page.evaluate(() => window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' }));
    await wait(2000);
    await page.evaluate(() => window.scrollBy({ top: window.innerHeight / 2, behavior: 'smooth' }));
    await wait(2000);
    
    console.log("Cautam un link intern...");
    const linkPath = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        const internalLinks = links.filter(a => {
            const href = a.getAttribute('href');
            return href && href.startsWith('/') && href.length > 1;
        });
        
        if(internalLinks.length > 0) {
            return internalLinks[Math.floor(Math.random() * internalLinks.length)].getAttribute('href'); 
        }
        return null;
    });
    
    if(linkPath) {
        console.log(`Accesăm pagina interna: http://kassia.ro${linkPath}`);
        await page.goto(`http://kassia.ro${linkPath}`, { waitUntil: 'networkidle2' });
        await wait(2000);
        
        console.log("Scroll pe pagina interna...");
        await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));
        await wait(2500);
        
        console.log("Ne intoarcem la pagina principala...");
        await page.goBack({ waitUntil: 'networkidle2' });
        await wait(2000);
    }
    
    console.log("Demonstratia este completa!");
})();
