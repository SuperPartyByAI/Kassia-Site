import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: blogPages } = await supabase.from('kassia_pages').select('id, path').eq('page_type', 'blog');
  const blogIds = blogPages.map(p => p.id);
  const { data: sections } = await supabase.from('kassia_page_sections').select('section_type').in('page_id', blogIds);
  
  const types = new Set(sections.map(s => s.section_type));
  console.log("Existing blog section types:", Array.from(types));
}
run();
