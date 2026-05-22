import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function replaceTerms(text) {
  if (!text) return text;
  let newText = text;
  
  // Replacements
  newText = newText.replace(/Vrei o ofertă pentru evenimentul tău\?/g, 'Hai să discutăm despre evenimentul tău!');
  newText = newText.replace(/Cere ofertă pe WhatsApp/gi, 'Scrie-ne pe WhatsApp');
  newText = newText.replace(/Cum ceri o ofertă pentru decorul cu baloane/gi, 'Cum stabilim detaliile pentru decorul tău');
  newText = newText.replace(/Pentru o estimare corectă/gi, 'Pentru a ne asigura că totul iese perfect');
  newText = newText.replace(/Cu cât timp înainte trebuie să cer oferta\?/gi, 'Cu cât timp înainte trebuie să vă contactez?');
  newText = newText.replace(/pregăti o ofertă/gi, 'veni cu o propunere');
  newText = newText.replace(/prima ofertă/gi, 'prima discuție pe WhatsApp');
  newText = newText.replace(/ofertă/gi, 'propunere');
  newText = newText.replace(/oferta/gi, 'propunerea');
  
  return newText;
}

async function run() {
  // 1. Pages (H1, meta_description, etc.)
  const { data: pages } = await supabase.from('kassia_pages').select('*');
  for (const p of pages) {
    let needsUpdate = false;
    let updates = {};
    
    if (p.h1 && replaceTerms(p.h1) !== p.h1) { updates.h1 = replaceTerms(p.h1); needsUpdate = true; }
    if (p.meta_description && replaceTerms(p.meta_description) !== p.meta_description) { updates.meta_description = replaceTerms(p.meta_description); needsUpdate = true; }
    
    if (needsUpdate) {
      await supabase.from('kassia_pages').update(updates).eq('id', p.id);
    }
  }

  // 2. Page Sections
  const { data: sections } = await supabase.from('kassia_page_sections').select('*');
  for (const s of sections) {
    let needsUpdate = false;
    let updates = {};
    
    if (s.heading && replaceTerms(s.heading) !== s.heading) { updates.heading = replaceTerms(s.heading); needsUpdate = true; }
    
    let contentChanged = false;
    let c = typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {});
    
    if (c.body && replaceTerms(c.body) !== c.body) { c.body = replaceTerms(c.body); contentChanged = true; }
    if (c.cta_text && replaceTerms(c.cta_text) !== c.cta_text) { c.cta_text = replaceTerms(c.cta_text); contentChanged = true; }
    if (c.subheading && replaceTerms(c.subheading) !== c.subheading) { c.subheading = replaceTerms(c.subheading); contentChanged = true; }
    
    if (contentChanged) { updates.content = c; needsUpdate = true; }
    
    if (needsUpdate) {
      await supabase.from('kassia_page_sections').update(updates).eq('id', s.id);
    }
  }

  // 3. FAQs
  const { data: faqs } = await supabase.from('kassia_faqs').select('*');
  for (const f of faqs) {
    let needsUpdate = false;
    let updates = {};
    
    if (f.question && replaceTerms(f.question) !== f.question) { updates.question = replaceTerms(f.question); needsUpdate = true; }
    if (f.answer && replaceTerms(f.answer) !== f.answer) { updates.answer = replaceTerms(f.answer); needsUpdate = true; }
    
    if (needsUpdate) {
      await supabase.from('kassia_faqs').update(updates).eq('id', f.id);
    }
  }

  console.log('Database terms replaced successfully!');
}

run();
