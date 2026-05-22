import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { create_kassia_page_version } from './src/lib/pageVersioning.mjs';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const slug = 'baloane-heliu-bucuresti';
  try {
    console.log(`Creating pre-update backup for: ${slug}`);
    const result = await create_kassia_page_version(supabase, slug, 'antigravity_script', 'Before helium page content update', 'system', { dryRun: false });
    console.log(`SUCCESS: Snapshot created with version_number: ${result.version_number}`);
  } catch(e) {
    console.error('FAILED to create snapshot:', e);
  }
}

run();
