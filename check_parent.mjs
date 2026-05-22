import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: pages } = await supabase.from('kassia_pages').select('*');
  let missingParents = [];
  
  pages.forEach(p => {
    if (['service', 'event', 'location', 'satellite', 'blog'].includes(p.page_type) && !p.parent_page_id) {
      missingParents.push(p.path);
    }
  });

  console.log(`Missing parent_page_id count: ${missingParents.length}`);
  if (missingParents.length > 0) {
    missingParents.slice(0, 5).forEach(m => console.log(m));
  }
}
run();
