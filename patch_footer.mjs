import fs from 'fs';

let content = fs.readFileSync('src/components/Footer.astro', 'utf8');

// Replace top logic
const topLogicSearch = `---
export interface Props {
  internalLinks: Array<{
    anchor_text: string;
    target_page: { path: string; status: string; };
  }>;
}

const { internalLinks = [] } = Astro.props;
const phone = "0768098268";
const email = "contact@kassia.ro";
---`;

const topLogicReplace = `---
import { supabase } from '../lib/supabase';

export interface Props {
  internalLinks: Array<{
    anchor_text: string;
    target_page: { path: string; status: string; };
  }>;
}

const { internalLinks = [] } = Astro.props;

// Fetch config
const { data: configRows } = await supabase.from('kassia_site_config').select('*');
const config = Object.fromEntries(configRows?.map(row => [row.key, row.value]) || []);

const phone = config.phone || "0768098268";
const email = config.email || "contact@kassia.ro";
const footerDesc = config.footer_desc || "Kassia îți transformă evenimentele în amintiri de neuitat prin decorațiuni spectaculoase din baloane. Calitate premium pentru botezuri, nunți și petreceri corporate.";
const whatsappText = config.whatsapp_text || "Buna! As dori mai multe detalii";
const phoneClean = phone.replace(/[^0-9]/g, '');
const whatsappNumber = phoneClean.startsWith('0') ? '4' + phoneClean : phoneClean;
const whatsappLink = \`https://wa.me/\${whatsappNumber}?text=\${encodeURIComponent(whatsappText)}\`;

// Fetch menus
const { data: menus } = await supabase.from('kassia_menus').select(\`
  location,
  title,
  kassia_menu_items (label, url, order_index)
\`);

menus?.forEach(m => {
  m.kassia_menu_items?.sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
});

const footerServicesMenu = menus?.find(m => m.location === 'footer_services');
---`;

content = content.replace(topLogicSearch, topLogicReplace);

// Replace Brand desc
content = content.replace(
  `<p class="brand-desc">Kassia îți transformă evenimentele în amintiri de neuitat prin decorațiuni spectaculoase din baloane. Calitate premium pentru botezuri, nunți și petreceri corporate.</p>`,
  `<p class="brand-desc">{footerDesc}</p>`
);

// Replace Footer Services Menu
const footerServicesSearch = `<h3 class="footer-heading">Servicii Principale</h3>
      <ul>
        <li><a href="/decoratiuni-baloane-botez-bucuresti/">Baloane Botez</a></li>
        <li><a href="/decoratiuni-baloane-nunta-bucuresti/">Baloane Nuntă</a></li>
        <li><a href="/decoratiuni-baloane-corporate-bucuresti/">Evenimente Corporate</a></li>
        <li><a href="/arcada-baloane-bucuresti/">Arcade din Baloane</a></li>
        <li><a href="/panou-foto-baloane-bucuresti/">Panouri Foto (Photo Corner)</a></li>
        <li><a href="/baloane-heliu-bucuresti/">Baloane cu Heliu</a></li>
      </ul>`;

const footerServicesReplace = `<h3 class="footer-heading">{footerServicesMenu?.title || 'Servicii Principale'}</h3>
      <ul>
        {footerServicesMenu?.kassia_menu_items?.map(item => (
          <li><a href={item.url}>{item.label}</a></li>
        ))}
      </ul>`;
content = content.replace(footerServicesSearch, footerServicesReplace);

// Replace WhatsApp Link
content = content.replace(
  `<a href={\`https://wa.me/40768098268\`} target="_blank">Scrie-ne acum</a>`,
  `<a href={whatsappLink} target="_blank">Scrie-ne acum</a>`
);

fs.writeFileSync('src/components/Footer.astro', content);
console.log("Footer patched!");
