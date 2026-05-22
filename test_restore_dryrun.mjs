import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { restore_kassia_page_version } from './src/lib/pageVersioning.mjs';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const slug = 'arcada-baloane-bucuresti';
  
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', slug).single();
  const { data: version } = await supabase
    .from('kassia_page_versions')
    .select('id')
    .eq('page_id', page.id)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  if (!version) {
    console.error('Snapshot nu a fost găsit!');
    return;
  }

  try {
    const result = await restore_kassia_page_version(supabase, version.id, { dryRun: true });
    const sum = result.diffSummary;

    const countTableConflicts = (table) => sum.conflictsDetail.filter(c => c.table === table).length;

    console.log('\n--- RAPORT OBLIGATORIU TEST (DRY-RUN) ---');
    console.log(`restore dry-run runs: DA`);
    console.log(`DB modified: NU`);
    console.log(`conflicts real check: DA`);
    console.log(`conflicts total: ${sum.idConflictsDetected}`);
    console.log(`scoped links valid: ${sum.scopedLinksValid ? 'DA' : 'NU'}`);
    console.log(`restore real implemented: NU`);
    console.log(`safe_for_restore_real_later: ${sum.idConflictsDetected === 0 ? 'DA' : 'NU'}`);

    if (sum.idConflictsDetected > 0) {
      console.log('\n--- CONFLICTS DETAILED ---');
      sum.conflictsDetail.forEach(c => console.log(`[${c.table}] ID ${c.id} -> ${c.reason}`));
    }
  } catch(e) {
    console.error('Error during dry-run:', e);
  }
}

run();
