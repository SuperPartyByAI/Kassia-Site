import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("=== DATE GLOBALE (kassia_site_config) ===");
  const { data: config } = await supabase.from('kassia_site_config').select('*');
  console.table(config);

  console.log("\n=== MENIURI (kassia_menus) ===");
  const { data: menus } = await supabase.from('kassia_menus').select('location, title, kassia_menu_items(label, url, order_index)');
  
  if (menus) {
    menus.forEach(menu => {
        console.log(`\nMeniu: ${menu.title} (Locație: ${menu.location})`);
        const sortedItems = menu.kassia_menu_items?.sort((a,b) => a.order_index - b.order_index);
        console.table(sortedItems);
    });
  }
}
run();
