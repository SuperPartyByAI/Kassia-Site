import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'decoratiuni-baloane-bucuresti').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
  const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id);

  let placeholderCount = 0;
  let textCounts = {
    '[XXX]': 0, 'Aici vei putea': 0, 'Adaugă': 0, 'Placeholder': 0
  };

  sections.forEach(s => {
    let text = JSON.stringify(s.content).toLowerCase();
    textCounts['[XXX]'] += (text.match(/\[xxx\]/g) || []).length;
    textCounts['Aici vei putea'] += (text.match(/aici vei putea/g) || []).length;
    textCounts['Adaugă'] += (text.match(/adaugă/g) || []).length;
    textCounts['Placeholder'] += (text.match(/placeholder/g) || []).length;
  });

  console.log('Placeholders:', textCounts);
  console.log('FAQ Count:', faqs ? faqs.length : 0);
}

run();
