import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'preturi-decoratiuni-baloane').single();

  // Update H1 and page_type
  await supabase.from('kassia_pages').update({ 
    h1: 'Prețuri decorațiuni cu baloane în București și Ilfov',
    page_type: 'service_pricing'
  }).eq('id', page.id);

  // Add FAQs
  await supabase.from('kassia_faqs').delete().eq('page_id', page.id);
  const faqsToInsert = [
    {
      page_id: page.id,
      question: 'Ce este inclus în oferta finală?',
      answer: 'Oferta finală include prețul baloanelor, materialelor adiacente, manopera pentru realizarea structurii și, acolo unde este cazul, costurile de deplasare și montaj la locație.',
      sort_order: 1
    },
    {
      page_id: page.id,
      question: 'Se percepe avans pentru rezervare?',
      answer: 'Da, pentru a bloca data evenimentului tău în calendarul nostru, percepem un avans. Restul de plată se achită în ziua evenimentului, după montaj.',
      sort_order: 2
    },
    {
      page_id: page.id,
      question: 'De ce prețurile diferă de la un eveniment la altul?',
      answer: 'Prețul unui decor depinde de dimensiunea structurii dorite, complexitatea designului, culorile alese (baloanele dublate sau culorile custom sunt mai costisitoare), precum și de distanța până la locație.',
      sort_order: 3
    }
  ];

  await supabase.from('kassia_faqs').insert(faqsToInsert);
  
  // Remove the fake FAQ section from content if it exists
  const { data: sections } = await supabase.from('kassia_page_sections').select('id, heading').eq('page_id', page.id);
  for (const s of sections) {
    if (s.heading && s.heading.includes('Întrebări frecvente')) {
      await supabase.from('kassia_page_sections').delete().eq('id', s.id);
    }
  }

  console.log('Fixed H1, page_type and added 3 real FAQs.');
}

run();
