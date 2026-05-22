import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('kassia_pages').select('status, index_status, include_in_sitemap');
  const pub = data.filter(d => d.status === 'published').length;
  const idx = data.filter(d => d.index_status === 'index').length;
  const sitemap = data.filter(d => d.include_in_sitemap === true).length;
  console.log(`published pages count: ${pub}`);
  console.log(`index pages count: ${idx}`);
  console.log(`include_in_sitemap=true count: ${sitemap}`);
  console.log(`sitemap loc count: 0 (sitemap not generated)`);
}
run();
