import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('path', '/contact/').single();
  const { data: items } = await supabase.from('kassia_gallery_items').select('*').eq('page_id', page.id);
  console.log('Gallery items:', items);
}
run();
