import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: blogPages } = await supabase.from('kassia_pages').select('id, path').eq('page_type', 'blog');
  const { data: sections } = await supabase.from('kassia_page_sections').select('page_id, section_type');
  
  blogPages.forEach(p => {
    const pSec = sections.filter(s => s.page_id === p.id);
    console.log(`${p.path} has ${pSec.length} sections.`);
  });
}
run();
