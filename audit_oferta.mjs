import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('--- AUDIT OFERTA VS PROPUNERE ---');

  let propunereCount = 0;
  let ofertaCount = 0;
  let affectedPages = new Set();
  let contactMeta = '';
  let preturiMeta = '';

  // 1. Pages
  const { data: pages } = await supabase.from('kassia_pages').select('*');
  for (const p of pages) {
    const text = JSON.stringify(p).toLowerCase();
    const pCount = (text.match(/propunere/g) || []).length;
    const oCount = (text.match(/ofertă|oferta/g) || []).length;
    
    propunereCount += pCount;
    ofertaCount += oCount;
    
    if (pCount > 0 || oCount > 0) affectedPages.add(p.slug);
    
    if (p.slug === 'contact') contactMeta = p.meta_description;
    if (p.slug === 'preturi-decoratiuni-baloane') preturiMeta = p.meta_description;
  }

  // 2. Sections
  const { data: sections } = await supabase.from('kassia_page_sections').select('*, kassia_pages(slug)');
  for (const s of sections) {
    const text = JSON.stringify(s).toLowerCase();
    const pCount = (text.match(/propunere/g) || []).length;
    const oCount = (text.match(/ofertă|oferta/g) || []).length;
    
    propunereCount += pCount;
    ofertaCount += oCount;
    
    if (pCount > 0 || oCount > 0 && s.kassia_pages) affectedPages.add(s.kassia_pages.slug);
  }

  // 3. FAQs
  const { data: faqs } = await supabase.from('kassia_faqs').select('*, kassia_pages(slug)');
  for (const f of faqs) {
    const text = JSON.stringify(f).toLowerCase();
    const pCount = (text.match(/propunere/g) || []).length;
    const oCount = (text.match(/ofertă|oferta/g) || []).length;
    
    propunereCount += pCount;
    ofertaCount += oCount;
    
    if (pCount > 0 || oCount > 0 && f.kassia_pages) affectedPages.add(f.kassia_pages.slug);
  }

  console.log(`- apariții "propunere": ${propunereCount}`);
  console.log(`- apariții "ofertă/oferta": ${ofertaCount}`);
  console.log(`- pagini afectate: ${Array.from(affectedPages).join(', ')}`);
  console.log(`- meta_description /contact/: ${contactMeta}`);
  console.log(`- meta_description /preturi-decoratiuni-baloane/: ${preturiMeta}`);
}

run();
