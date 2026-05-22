import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { count: pagesCount } = await supabase.from('kassia_pages').select('*', { count: 'exact', head: true });
  const { count: menuItemsCount } = await supabase.from('kassia_menu_items').select('*', { count: 'exact', head: true });
  const { count: internalLinksCount } = await supabase.from('kassia_internal_links').select('*', { count: 'exact', head: true });

  console.log(`PAGINI: ${pagesCount}`);
  console.log(`MENU_LINKS: ${menuItemsCount}`);
  console.log(`INTERNAL_LINKS: ${internalLinksCount}`);
}
run();
