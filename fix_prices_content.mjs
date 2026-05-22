import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const newTexts = {
  "Prețuri Botez & Tăiere Moț": "<p>Decorurile pentru botez și tăiere de moț pot include arcadă din baloane, panou foto, baloane cu heliu, decor pentru candy bar și elemente personalizate în funcție de temă.</p><p>Costul se stabilește în funcție de dimensiunea decorului, locație, culori, accesorii și timpul necesar pentru montaj.</p>",
  "Prețuri Nuntă & Cununie": "<p>Pentru nunți și cununii, decorurile cu baloane pot fi folosite pentru intrare, zona foto, candy bar, ring de dans sau momente speciale ale evenimentului.</p><p>Oferta se calculează în funcție de concept, dimensiune, locație și complexitatea montajului.</p>",
  "Prețuri Corporate & Deschideri": "<p>Pentru evenimente corporate, lansări sau deschideri de locații, decorurile cu baloane pot include arcade, coloane, panouri foto și elemente în culorile brandului.</p><p>Costul depinde de dimensiunea spațiului, tipul decorului, branding și intervalul de montaj.</p>",
  "Prețuri Majorat & Aniversări": "<p>Pentru majorate și aniversări, decorurile pot include panou foto, arcadă organică, baloane cu heliu, cifre, litere și zone tematice pentru poze.</p><p>Prețul se stabilește în funcție de temă, numărul de elemente și complexitatea decorului.</p>",
  "Prețuri Arcade din Baloane": "<p>Arcadele din baloane se pot realiza pentru intrări, candy bar, panouri foto, scene sau zone de întâmpinare.</p><p>Costul depinde de lungime, volum, tipul compoziției și timpul necesar pentru montaj.</p>",
  "Prețuri Panouri Foto (Photo Corner)": "<p>Panourile foto cu baloane sunt potrivite pentru botezuri, nunți, aniversări, majorate și evenimente corporate.</p><p>Oferta depinde de tipul panoului, dimensiune, decorul cu baloane, accesorii și tematica evenimentului.</p>",
  "Prețuri Baloane cu Heliu": "<p>Baloanele cu heliu pot fi folosite pentru mese, intrări, surprize, buchete, cifre, litere sau decoruri simple pentru evenimente.</p><p>Costul variază în funcție de tipul balonului, cantitate, personalizare și livrare.</p>",
  "Prețuri Aranjamente & Buchete": "<p>Aranjamentele și buchetele de baloane sunt potrivite pentru cadouri, aniversări, decoruri de masă sau zone speciale din eveniment.</p><p>Prețul se stabilește în funcție de dimensiune, numărul de baloane, culori și elemente personalizate.</p>"
};

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'preturi-decoratiuni-baloane').single();
  if (!page) return;

  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);

  for (const s of sections) {
    if (s.section_type === 'service_card') {
      let c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
      // Remove subheading to avoid double CTA or double title effect
      c.subheading = '';
      c.cta_text = 'Vezi detalii';
      await supabase.from('kassia_page_sections').update({ content: c }).eq('id', s.id);
    } 
    else if (s.section_type === 'content' && s.heading && newTexts[s.heading]) {
      let c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
      c.body = newTexts[s.heading];
      await supabase.from('kassia_page_sections').update({ content: c }).eq('id', s.id);
    }
  }

  // Task 3: Fix "ofertăa" globally
  const { data: allSections } = await supabase.from('kassia_page_sections').select('*');
  for (const s of allSections) {
    let c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
    let changed = false;

    if (c && c.cta_text && c.cta_text.includes('ofertăa')) {
      c.cta_text = c.cta_text.replace(/ofertăa/g, 'ofertă');
      changed = true;
    }
    if (c && c.body && c.body.includes('ofertăa')) {
      c.body = c.body.replace(/ofertăa/g, 'ofertă');
      changed = true;
    }

    if (changed) {
      await supabase.from('kassia_page_sections').update({ content: c }).eq('id', s.id);
    }
  }

  console.log('Task 1, 2, and 3 DB updates applied.');
}

run();
