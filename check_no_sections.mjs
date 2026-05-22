import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: allPages } = await supabase.from('kassia_pages').select('id, path');
  const { data: sections } = await supabase.from('kassia_page_sections').select('page_id');
  
  const pagesWithSections = new Set(sections.map(s => s.page_id));
  const pagesWithoutSections = allPages.filter(p => !pagesWithSections.has(p.id));
  
  console.log(`Found ${pagesWithoutSections.length} pages without sections.`);
  if (pagesWithoutSections.length > 0) {
    console.log(pagesWithoutSections.map(p => p.path));
  }
}
run();
