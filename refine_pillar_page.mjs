import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'decoratiuni-baloane-bucuresti').single();
  
  if (!page) {
    console.error('Page not found!');
    return;
  }

  // Fetch sections to update them
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);

  // TASK 1: Update Service Cards
  const subtitles = {
    'Arcade din baloane': 'Pentru intrări, candy bar, panouri foto și zone de întâmpinare.',
    'Baloane cu heliu': 'Buchete, cifre, litere și decoruri plutitoare pentru evenimente.',
    'Panouri foto': 'Fundaluri foto decorate cu baloane pentru poze memorabile.',
    'Decor botez': 'Decoruri delicate pentru botezuri, tăieri de moț și petreceri de copii.',
    'Decor nuntă': 'Aranjamente elegante pentru cununii, nunți și momente speciale.',
    'Prețuri': 'Vezi cum se calculează costul unui decor cu baloane.',
    'Galerie': 'Inspiră-te din decoruri, arcade și panouri foto realizate pentru evenimente.',
    'Contact': 'Scrie-ne rapid pe WhatsApp pentru detalii și disponibilitate.'
  };

  for (const s of sections) {
    if (s.section_type === 'service_card' && subtitles[s.heading]) {
      const content = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
      content.subheading = subtitles[s.heading];
      await supabase.from('kassia_page_sections').update({ content }).eq('id', s.id);
    }
  }

  // TASK 2: Refine "De ce să alegi Kassia Events?"
  const deCeSection = sections.find(s => s.heading === 'De ce să alegi Kassia Events?');
  if (deCeSection) {
    const content = typeof deCeSection.content === 'string' ? JSON.parse(deCeSection.content) : deCeSection.content;
    content.body = `<p>Un decor cu baloane reușit trebuie să se potrivească locului, temei și momentului. Echipa Kassia Events îți oferă <strong>comunicare rapidă pe WhatsApp</strong>, adaptând fiecare decor în funcție de locație și buget.</p><ul><li>Planificăm <strong>culori și o temă alese împreună</strong> cu tine.</li><li>Asigurăm <strong>montaj la timp</strong> pentru ca totul să fie gata înainte de sosirea invitaților.</li><li>Creăm <strong>decoruri care arată impecabil în poze</strong>, perfecte pentru albumul amintirilor tale.</li></ul>`;
    await supabase.from('kassia_page_sections').update({ content }).eq('id', deCeSection.id);
  }

  // TASK 3: Refine "Servicii de decorațiuni cu baloane"
  const serviciiSection = sections.find(s => s.heading === 'Servicii de decorațiuni cu baloane');
  if (serviciiSection) {
    const content = typeof serviciiSection.content === 'string' ? JSON.parse(serviciiSection.content) : serviciiSection.content;
    content.body = `<p>Kassia Events realizează decoruri complete și personalizate pentru evenimente, oferind soluții variate pentru a transforma orice locație:</p><ul><li><strong>Arcade organice:</strong> perfecte pentru intrări, prezidii sau uși.</li><li><strong>Baloane cu heliu:</strong> buchete elegante, cifre aniversare sau litere voluminoase.</li><li><strong>Panouri foto:</strong> cadre metalice circulare sau dreptunghiulare îmbrăcate spectaculos.</li><li><strong>Buchete de baloane:</strong> aranjamente de masă sau podea.</li><li><strong>Decoruri tematice:</strong> pentru botez, nuntă, majorat și evenimente corporate.</li></ul><p>Fiecare serviciu este adaptat cromaticii, numărului de invitați și specificului locației.</p>`;
    await supabase.from('kassia_page_sections').update({ content }).eq('id', serviciiSection.id);
  }

  // TASK 4: Add 2 new FAQs
  const newFaqs = [
    {
      page_id: page.id,
      question: 'Puteți adapta decorul după o poză de inspirație?',
      answer: 'Da. Ne poți trimite poze de inspirație, culori preferate și detalii despre locație, iar noi adaptăm decorul cu baloane în funcție de spațiu, temă și buget.',
      order_index: 4
    },
    {
      page_id: page.id,
      question: 'Cu cât timp înainte trebuie să vă contactez?',
      answer: 'Recomandăm să ne contactezi cât mai devreme, mai ales pentru weekenduri și perioade aglomerate. Dacă data este apropiată, ne poți scrie pe WhatsApp și verificăm rapid disponibilitatea.',
      order_index: 5
    }
  ];

  await supabase.from('kassia_faqs').insert(newFaqs);

  console.log('Update completed.');
}

run();
