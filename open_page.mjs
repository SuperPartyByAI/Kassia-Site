import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { exec } from 'child_process';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('path', '/contact/').single();
  const url = `http://localhost:4321/admin/visual/${page.id}`;
  console.log(`Opening URL: ${url}`);
  exec(`open "${url}"`);
}
run();
