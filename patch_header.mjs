import fs from 'fs';

let content = fs.readFileSync('src/components/Header.astro', 'utf8');

// Replace top logic
const topLogicSearch = `---
const phone = "0768098268";
const whatsappText = "Buna! As dori mai multe detalii despre decoratiunile cu baloane.";
const whatsappLink = \`https://wa.me/40768098268?text=\${encodeURIComponent(whatsappText)}\`;
---`;

const topLogicReplace = `---
import { supabase } from '../lib/supabase';

// 1. Fetch site config
const { data: configRows } = await supabase.from('kassia_site_config').select('*');
const config = Object.fromEntries(configRows?.map(row => [row.key, row.value]) || []);

const phone = config.phone || "0768098268";
const whatsappText = config.whatsapp_text || "Buna! As dori mai multe detalii despre decoratiunile cu baloane.";
// Helper for phone format in whatsapp
const phoneClean = phone.replace(/[^0-9]/g, '');
const whatsappNumber = phoneClean.startsWith('0') ? '4' + phoneClean : phoneClean;
const whatsappLink = \`https://wa.me/\${whatsappNumber}?text=\${encodeURIComponent(whatsappText)}\`;

// 2. Fetch menus
const { data: menus } = await supabase.from('kassia_menus').select(\`
  location,
  title,
  kassia_menu_items (label, url, order_index)
\`);

// Sort items in JS since PostgREST ordering nested tables can be tricky
menus?.forEach(m => {
  m.kassia_menu_items?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
});

const headerServicesMenu = menus?.find(m => m.location === 'header_services');
const headerEventsMenu = menus?.find(m => m.location === 'header_events');
---`;

content = content.replace(topLogicSearch, topLogicReplace);

// Replace Services Menu Desktop
const desktopServicesSearch = `<button class="nav-link dropdown-toggle">
          Servicii Baloane
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="dropdown-menu">
          <a href="/arcada-baloane-bucuresti/" class="dropdown-item">Arcade Baloane</a>
          <a href="/baloane-heliu-bucuresti/" class="dropdown-item">Baloane cu Heliu</a>
          <a href="/panou-foto-baloane-bucuresti/" class="dropdown-item">Panouri Foto (Photo Corner)</a>
          <a href="/perete-baloane-bucuresti/" class="dropdown-item">Perete din Baloane</a>
          <a href="/ghirlande-baloane-bucuresti/" class="dropdown-item">Ghirlande Baloane</a>
          <a href="/stalpi-baloane-bucuresti/" class="dropdown-item">Stâlpi Baloane</a>
          <a href="/aranjamente-baloane-bucuresti/" class="dropdown-item">Aranjamente Baloane</a>
          <a href="/buchete-baloane-bucuresti/" class="dropdown-item">Buchete din Baloane</a>
          <a href="/baloane-cifre-litere-bucuresti/" class="dropdown-item">Baloane Cifre & Litere</a>
          <a href="/livrare-baloane-bucuresti/" class="dropdown-item">Livrare Baloane</a>
        </div>`;

const desktopServicesReplace = `<button class="nav-link dropdown-toggle">
          {headerServicesMenu?.title || 'Servicii Baloane'}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="dropdown-menu">
          {headerServicesMenu?.kassia_menu_items?.map(item => (
             <a href={item.url} class="dropdown-item">{item.label}</a>
          ))}
        </div>`;
content = content.replace(desktopServicesSearch, desktopServicesReplace);

// Replace Events Menu Desktop
const desktopEventsSearch = `<button class="nav-link dropdown-toggle">
          Evenimente
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="dropdown-menu">
          <a href="/decoratiuni-baloane-botez-bucuresti/" class="dropdown-item">Botez & Tăiere Moț</a>
          <a href="/decoratiuni-baloane-nunta-bucuresti/" class="dropdown-item">Nuntă & Cununie</a>
          <a href="/decoratiuni-baloane-corporate-bucuresti/" class="dropdown-item">Corporate & Deschideri</a>
          <a href="/decoratiuni-baloane-gender-reveal-bucuresti/" class="dropdown-item">Gender Reveal</a>
          <a href="/decoratiuni-baloane-baby-shower-bucuresti/" class="dropdown-item">Baby Shower</a>
          <a href="/decoratiuni-baloane-aniversare-copii-bucuresti/" class="dropdown-item">Aniversări Copii</a>
          <a href="/decoratiuni-baloane-majorat-bucuresti/" class="dropdown-item">Majorat (18 ani)</a>
          <a href="/decoratiuni-baloane-absolvire-bucuresti/" class="dropdown-item">Absolvire & Școală</a>
        </div>`;

const desktopEventsReplace = `<button class="nav-link dropdown-toggle">
          {headerEventsMenu?.title || 'Evenimente'}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </button>
        <div class="dropdown-menu">
          {headerEventsMenu?.kassia_menu_items?.map(item => (
             <a href={item.url} class="dropdown-item">{item.label}</a>
          ))}
        </div>`;
content = content.replace(desktopEventsSearch, desktopEventsReplace);

// Replace Mobile Services
const mobileServicesSearch = `<h3 class="mobile-menu-title">Servicii Baloane</h3>
    <div class="mobile-menu-links">
      <a href="/arcada-baloane-bucuresti/">Arcade Baloane</a>
      <a href="/baloane-heliu-bucuresti/">Baloane cu Heliu</a>
      <a href="/panou-foto-baloane-bucuresti/">Panouri Foto</a>
      <a href="/perete-baloane-bucuresti/">Perete din Baloane</a>
      <a href="/ghirlande-baloane-bucuresti/">Ghirlande Baloane</a>
      <a href="/stalpi-baloane-bucuresti/">Stâlpi Baloane</a>
      <a href="/aranjamente-baloane-bucuresti/">Aranjamente Baloane</a>
      <a href="/buchete-baloane-bucuresti/">Buchete din Baloane</a>
      <a href="/baloane-cifre-litere-bucuresti/">Baloane Cifre & Litere</a>
      <a href="/livrare-baloane-bucuresti/">Livrare Baloane</a>
    </div>`;

const mobileServicesReplace = `<h3 class="mobile-menu-title">{headerServicesMenu?.title || 'Servicii Baloane'}</h3>
    <div class="mobile-menu-links">
      {headerServicesMenu?.kassia_menu_items?.map(item => (
         <a href={item.url}>{item.label}</a>
      ))}
    </div>`;
content = content.replace(mobileServicesSearch, mobileServicesReplace);

// Replace Mobile Events
const mobileEventsSearch = `<h3 class="mobile-menu-title">Evenimente</h3>
    <div class="mobile-menu-links">
      <a href="/decoratiuni-baloane-botez-bucuresti/">Botez & Tăiere Moț</a>
      <a href="/decoratiuni-baloane-nunta-bucuresti/">Nuntă & Cununie</a>
      <a href="/decoratiuni-baloane-corporate-bucuresti/">Corporate & Deschideri</a>
      <a href="/decoratiuni-baloane-gender-reveal-bucuresti/">Gender Reveal</a>
      <a href="/decoratiuni-baloane-baby-shower-bucuresti/">Baby Shower</a>
      <a href="/decoratiuni-baloane-aniversare-copii-bucuresti/">Aniversări Copii</a>
      <a href="/decoratiuni-baloane-majorat-bucuresti/">Majorat (18 ani)</a>
      <a href="/decoratiuni-baloane-absolvire-bucuresti/">Absolvire & Școală</a>
    </div>`;

const mobileEventsReplace = `<h3 class="mobile-menu-title">{headerEventsMenu?.title || 'Evenimente'}</h3>
    <div class="mobile-menu-links">
      {headerEventsMenu?.kassia_menu_items?.map(item => (
         <a href={item.url}>{item.label}</a>
      ))}
    </div>`;
content = content.replace(mobileEventsSearch, mobileEventsReplace);

// Replace phone 1
content = content.replace(
  /\<a href=\\{\`https:\/\/wa.me\/40768098268\`\\} target="_blank" rel="noopener noreferrer" class="btn-whatsapp"\>/g,
  `<a href={whatsappLink} target="_blank" rel="noopener noreferrer" class="btn-whatsapp">`
);

fs.writeFileSync('src/components/Header.astro', content);
console.log("Header patched!");
