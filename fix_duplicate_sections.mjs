import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getAll(table) {
  let all = [];
  let from = 0;
  let to = 999;
  while (true) {
    const { data } = await supabase.from(table).select('*').range(from, to).order('id', { ascending: true });
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    from += 1000;
    to += 1000;
  }
  return all;
}

async function run() {
  const sections = await getAll('kassia_page_sections');
  const seen = new Set();
  const toDelete = [];
  
  sections.forEach(s => {
    const key = `${s.page_id}_${s.section_type}`;
    if (seen.has(key)) {
      toDelete.push(s.id);
    } else {
      seen.add(key);
    }
  });
  
  console.log(`Found ${toDelete.length} duplicate sections to delete.`);
  
  if (toDelete.length > 0) {
    // Delete in chunks
    const chunkSize = 100;
    for (let i = 0; i < toDelete.length; i += chunkSize) {
      const chunk = toDelete.slice(i, i + chunkSize);
      const { error } = await supabase.from('kassia_page_sections').delete().in('id', chunk);
      if (error) {
        console.error("Error deleting:", error);
      } else {
        console.log(`Deleted chunk of ${chunk.length}`);
      }
    }
  }
}
run();
