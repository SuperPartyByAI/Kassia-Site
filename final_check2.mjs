import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: sections } = await supabase.from('kassia_page_sections').select('content');
  const allTexts = sections.map(s => JSON.stringify(s.content)).join(' ');
  const placeholderCount = (allTexts.match(/Aici vei putea adăuga prețurile/g) || []).length;
  const ofertaTypoCount = (allTexts.match(/ofertăa/gi) || []).length;

  console.log('placeholderCount:', placeholderCount);
  console.log('ofertaTypoCount:', ofertaTypoCount);
}

run();
