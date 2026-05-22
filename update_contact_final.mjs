import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'contact').single();
  if (!page) return;

  // 1. Remove duplicate heading from existing content section (Date de contact)
  await supabase.from('kassia_page_sections')
    .update({ heading: '' })
    .eq('page_id', page.id)
    .eq('heading', 'Date de contact');

  // 2. Add 'De ce sa alegi' section
  // Check if it exists first
  const { data: existingDeCe } = await supabase.from('kassia_page_sections').select('id').eq('page_id', page.id).eq('heading', 'De ce să alegi Kassia Events?');
  
  if (!existingDeCe || existingDeCe.length === 0) {
    await supabase.from('kassia_page_sections').insert({
      page_id: page.id,
      section_type: 'content',
      order_index: 25,
      heading: 'De ce să alegi Kassia Events?',
      content: {
        body: `<p>Kassia Events creează decoruri cu baloane personalizate pentru evenimente în București și Ilfov, de la arcade organice și panouri foto până la baloane cu heliu și decoruri tematice pentru botezuri, nunți, aniversări sau evenimente corporate.</p><p>Ne concentrăm pe propuneri adaptate locației, stilului evenimentului și bugetului, astfel încât fiecare decor să arate bine în poze și să se potrivească atmosferei evenimentului.</p>`,
        image_url: ''
      }
    });
  }

  // 3. Add FAQs
  await supabase.from('kassia_faqs').delete().eq('page_id', page.id); // clear existing
  
  const faqsToInsert = [
    {
      page_id: page.id,
      question: 'Cu cât timp înainte trebuie să cer oferta?',
      answer: 'Recomandăm să ne contactezi cât mai devreme, mai ales pentru weekenduri și perioade aglomerate. Disponibilitatea se confirmă în funcție de data evenimentului și complexitatea decorului.',
      order_index: 10
    },
    {
      page_id: page.id,
      question: 'Pot trimite poze de inspirație pe WhatsApp?',
      answer: 'Da. Pozele de inspirație ne ajută să înțelegem stilul dorit, culorile, dimensiunea decorului și tipul de aranjament potrivit pentru evenimentul tău.',
      order_index: 20
    },
    {
      page_id: page.id,
      question: 'Realizați decoruri cu baloane și în Ilfov?',
      answer: 'Da, realizăm decoruri cu baloane în București și în zonele apropiate din Ilfov. Transportul și montajul se confirmă în funcție de locație.',
      order_index: 30
    }
  ];

  await supabase.from('kassia_faqs').insert(faqsToInsert);

  console.log('Contact page content updated!');
}

run();
