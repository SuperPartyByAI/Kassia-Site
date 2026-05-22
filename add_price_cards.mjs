import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function generateUUID() {
  return crypto.randomUUID();
}

const services = [
  { title: "Botez & Tăiere Moț", img: "/images/aranjamente.webp" },
  { title: "Nuntă & Cununie", img: "/images/arcade.webp" },
  { title: "Corporate & Deschideri", img: "/images/home-intro.webp" },
  { title: "Majorat & Aniversări", img: "/images/home-pricing.webp" },
  { title: "Arcade din Baloane", img: "/images/arcade.webp" },
  { title: "Panouri Foto (Photo Corner)", img: "/images/contact-intro.png" },
  { title: "Baloane cu Heliu", img: "/images/heliu.webp" },
  { title: "Aranjamente & Buchete", img: "/images/ghirlande.webp" }
];

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'preturi-decoratiuni-baloane').single();
  if (!page) return;

  // First, delete existing service_card and empty content sections to avoid duplicates if run multiple times
  const { data: existing } = await supabase.from('kassia_page_sections').select('id, section_type, heading').eq('page_id', page.id);
  const toDelete = existing.filter(s => s.section_type === 'service_card' || services.some(srv => s.heading === `Prețuri ${srv.title}`));
  for (const s of toDelete) {
    await supabase.from('kassia_page_sections').delete().eq('id', s.id);
  }

  let currentOrder = 10;
  
  // 1. Insert Service Cards
  for (const s of services) {
    const slug = 'preturi-' + s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    await supabase.from('kassia_page_sections').insert({
      id: generateUUID(),
      page_id: page.id,
      section_type: 'service_card',
      heading: s.title,
      content: {
        subheading: 'Vezi Pachetele',
        image_url: s.img,
        cta_text: 'Vezi Prețuri',
        cta_url: '#' + slug,
        is_active: true
      },
      order_index: currentOrder++
    });
  }

  // 2. Insert Content Sections for each service to hold the actual prices later
  for (const s of services) {
    await supabase.from('kassia_page_sections').insert({
      id: generateUUID(),
      page_id: page.id,
      section_type: 'content',
      heading: `Prețuri ${s.title}`,
      content: {
        body: `<p>Aici vei putea adăuga prețurile, pachetele și detaliile pentru ${s.title}. Clientul poate ajunge direct la această secțiune apăsând pe cardul din meniul de sus.</p>`,
        image_url: s.img,
        cta_text: 'Cere o ofertă exactă pe WhatsApp',
        cta_url: 'https://wa.me/40768098268',
        is_active: true
      },
      order_index: currentOrder++
    });
  }

  console.log('Cards and Hub sections created successfully!');
}

run();
