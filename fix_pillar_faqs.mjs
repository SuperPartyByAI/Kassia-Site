import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'decoratiuni-baloane-bucuresti').single();
  
  await supabase.from('kassia_faqs').delete().eq('page_id', page.id);
  
  const faqsToInsert = [
    {
      page_id: page.id,
      question: 'Cât timp durează montajul unui decor cu baloane?',
      answer: 'Timpul de montaj variază între 1 și 3 ore, în funcție de complexitatea și dimensiunea decorului. Discutăm aceste detalii în prealabil pentru a ajunge la locație la momentul oportun.',
      order_index: 1
    },
    {
      page_id: page.id,
      question: 'Vă ocupați și de demontarea decorului după eveniment?',
      answer: 'În general, baloanele rămân la tine! În cazul panourilor foto cu cadru metalic închiriate, stabilim de comun acord ridicarea recuzitei după terminarea petrecerii sau a doua zi.',
      order_index: 2
    },
    {
      page_id: page.id,
      question: 'Oferiți decorațiuni și în Ilfov?',
      answer: 'Da, asigurăm transport și montaj oriunde în București și Ilfov. Costurile de transport se calculează în funcție de distanța exactă până la locație.',
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
