import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: faqs } = await supabase.from('kassia_faqs').select('*');

  let changed = false;
  for (const f of faqs) {
    if (f.answer && f.answer.includes('oferta finală poate include')) {
      const newAnswer = f.answer.replace(/oferta finală poate include/g, 'Oferta finală poate include');
      await supabase.from('kassia_faqs').update({ answer: newAnswer }).eq('id', f.id);
      changed = true;
    }
  }
  
  if (changed) {
    console.log('FAQ capitalisation fixed.');
  } else {
    console.log('No FAQ needed fixing.');
  }
}

run();
