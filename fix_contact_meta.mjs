import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  await supabase.from('kassia_pages').update({
    meta_description: 'Contactează Kassia Events pentru decorațiuni cu baloane în București și Ilfov. Cere ofertă pentru arcade, baloane cu heliu, panouri foto și decoruri pentru evenimente.'
  }).eq('slug', 'contact');
  console.log('Restored contact meta_description.');
}

run();
