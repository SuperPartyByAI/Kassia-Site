import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function restoreOferta(text) {
  if (!text) return text;
  return text.replace(/propunere/g, 'ofertă').replace(/Propunere/g, 'Ofertă');
}

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id, h1, meta_title, meta_description').eq('slug', 'preturi-decoratiuni-baloane').single();
  if (page) {
    const updates = {};
    if (page.h1 && page.h1.includes('propunere')) updates.h1 = restoreOferta(page.h1);
    if (page.meta_title && page.meta_title.includes('propunere')) updates.meta_title = restoreOferta(page.meta_title);
    if (page.meta_description && page.meta_description.includes('propunere')) updates.meta_description = restoreOferta(page.meta_description);
    
    if (Object.keys(updates).length > 0) {
      await supabase.from('kassia_pages').update(updates).eq('id', page.id);
    }

    const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
    for (const s of sections) {
      const updatesSec = {};
      if (s.heading && s.heading.includes('propunere')) updatesSec.heading = restoreOferta(s.heading);
      
      let c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
      let cChanged = false;
      if (c.body && c.body.includes('propunere')) { c.body = restoreOferta(c.body); cChanged = true; }
      if (c.cta_text && c.cta_text.includes('propunere')) { c.cta_text = restoreOferta(c.cta_text); cChanged = true; }
      
      if (cChanged) updatesSec.content = c;
      if (Object.keys(updatesSec).length > 0) await supabase.from('kassia_page_sections').update(updatesSec).eq('id', s.id);
    }
    
    const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id);
    for (const f of faqs) {
      const updatesFaq = {};
      if (f.question && f.question.includes('propunere')) updatesFaq.question = restoreOferta(f.question);
      if (f.answer && f.answer.includes('propunere')) updatesFaq.answer = restoreOferta(f.answer);
      if (Object.keys(updatesFaq).length > 0) await supabase.from('kassia_faqs').update(updatesFaq).eq('id', f.id);
    }
  }

  console.log('Restored oferta on Prices page.');
}

run();
