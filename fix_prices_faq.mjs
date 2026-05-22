import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'preturi-decoratiuni-baloane').single();

  if (!page) {
    console.error('Page not found!');
    return;
  }

  // Clear existing FAQs just in case, though we know count is 0
  await supabase.from('kassia_faqs').delete().eq('page_id', page.id);

  // Insert recommended FAQs
  const faqsToInsert = [
    {
      page_id: page.id,
      question: 'Ce este inclus în oferta finală?',
      answer: 'Oferta finală include prețul baloanelor, elementele de structură închiriate (cadre, panouri, suporți), manopera pentru realizarea decorului, precum și costurile de transport și montaj la locație.',
      order_index: 1
    },
    {
      page_id: page.id,
      question: 'Se percepe avans pentru rezervare?',
      answer: 'Da, pentru a bloca ferm data și ora evenimentului tău în calendarul nostru, precum și pentru achiziția materialelor necesare, percepem un avans. Restul sumei se achită de obicei în ziua montajului.',
      order_index: 2
    },
    {
      page_id: page.id,
      question: 'De ce prețurile diferă de la un eveniment la altul?',
      answer: 'Costul unui decor variază în funcție de dimensiunea acestuia, tipul baloanelor folosite (standard, cromate, dublate), complexitatea asamblării și accesoriile adăugate (flori, decupaje tematice, neoane). De asemenea, logistica locației poate influența prețul.',
      order_index: 3
    }
  ];

  const { error } = await supabase.from('kassia_faqs').insert(faqsToInsert);

  if (error) {
    console.error('Error inserting FAQs:', error);
  } else {
    console.log('FAQs inserted successfully with order_index.');
  }
}

run();
