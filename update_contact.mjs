import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('path', '/contact/').single();
  if (!page) {
    console.error("Page /contact/ not found");
    return;
  }
  
  // Update page SEO fields
  await supabase.from('kassia_pages').update({
    h1: 'Contact Kassia Events',
    meta_title: 'Contact Kassia Events | Decorațiuni cu baloane în București',
    meta_description: 'Contactează Kassia Events pentru decorațiuni cu baloane în București și Ilfov. Cere ofertă pentru arcade, baloane cu heliu, panouri foto și decoruri pentru evenimente.'
  }).eq('id', page.id);

  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
  
  for (let s of sections) {
    if (s.section_type === 'hero') {
      await supabase.from('kassia_page_sections').update({
        heading: 'Contact Kassia Events',
        content: {
          subheading: '',
          body: '<p>Ai un eveniment în pregătire și vrei un decor cu baloane personalizat? Trimite-ne detaliile despre dată, locație, tipul evenimentului și stilul dorit, iar echipa Kassia Events îți va răspunde cu o propunere potrivită.</p>',
          cta_text: '',
          cta_url: '',
          is_active: true
        }
      }).eq('id', s.id);
    } else if (s.section_type === 'content') {
      await supabase.from('kassia_page_sections').update({
        heading: 'Date de contact',
        content: {
          subheading: '',
          body: '<p>Telefon / WhatsApp: 0768 098 268<br/>Email: contact@kassia.ro</p><p>Pentru un răspuns rapid, ne poți scrie pe WhatsApp cu data evenimentului, locația, tipul decorului dorit și câteva poze de inspirație.</p><h3>Cum ceri o ofertă</h3><p>Pentru o ofertă cât mai exactă, trimite-ne următoarele detalii:</p><ul><li>data evenimentului;</li><li>locația;</li><li>tipul evenimentului: botez, nuntă, aniversare, majorat, corporate sau alt eveniment;</li><li>decorul dorit: arcadă de baloane, baloane cu heliu, panou foto, buchete sau decor complet;</li><li>culori, temă și poze de inspirație;</li><li>intervalul în care trebuie făcut montajul.</li></ul><h3>Zone acoperite</h3><p>Realizăm decorațiuni cu baloane în București și în zonele apropiate din Ilfov. Pentru evenimente în afara Bucureștiului, confirmăm disponibilitatea, transportul și montajul în funcție de locație și complexitatea decorului.</p>',
          is_active: true
        }
      }).eq('id', s.id);
    } else if (s.section_type === 'final_cta') {
      await supabase.from('kassia_page_sections').update({
        heading: 'Cere ofertă pentru evenimentul tău',
        content: {
          subheading: '',
          body: '',
          cta_text: 'Trimite mesaj pe WhatsApp',
          cta_url: 'whatsapp://send?phone=40768098268',
          is_active: true
        }
      }).eq('id', s.id);
    }
  }
  
  console.log("Contact page updated successfully.");
}
run();
