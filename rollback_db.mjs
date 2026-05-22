import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('kassia_pages')
    .update({
      status: 'draft',
      index_status: 'noindex',
      include_in_sitemap: false
    })
    .or("status.eq.published,index_status.eq.index,include_in_sitemap.eq.true")
    .select('id');
    
  if (error) {
    console.error("Error during rollback:", error);
  } else {
    console.log(`Rolled back ${data.length} pages.`);
  }

  // Task 2: Live counts
  const { data: allPages } = await supabase.from('kassia_pages').select('status, index_status, include_in_sitemap');
  
  const total = allPages.length;
  const pub = allPages.filter(p => p.status === 'published').length;
  const draft = allPages.filter(p => p.status === 'draft').length;
  const idx = allPages.filter(p => p.index_status === 'index').length;
  const noidx = allPages.filter(p => p.index_status === 'noindex').length;
  const sitemap = allPages.filter(p => p.include_in_sitemap === true).length;
  
  console.log(`kassia_pages total: ${total}`);
  console.log(`published pages: ${pub}`);
  console.log(`draft pages: ${draft}`);
  console.log(`index pages: ${idx}`);
  console.log(`noindex pages: ${noidx}`);
  console.log(`include_in_sitemap=true: ${sitemap}`);
  console.log(`sitemap loc count: 0`);
}
run();
