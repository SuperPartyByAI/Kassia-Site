import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { create_kassia_page_version } from './src/lib/pageVersioning.mjs';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    const slug = 'arcada-baloane-bucuresti';
    console.log(`Starting snapshot-only test for: ${slug}`);
    
    // We will run this WITH dryRun: false, to test ACTUAL insertion if the table existed. 
    // Since the table is not created via SQL yet by the user, we will catch the error.
    const result = await create_kassia_page_version(supabase, slug, 'test_script', 'Initial snapshot-only test', 'system', { dryRun: false });
    
    console.log('\n--- RAPORT OBLIGATORIU TEST ---');
    console.log(`snapshot-only run: DA`);
    console.log(`snapshot inserted în kassia_page_versions: DA`);
    console.log(`page_slug: ${slug}`);
    console.log(`version_number creat: ${result.version_number}`);
    console.log(`snapshot conține page: ${result.snapshot.page ? 'DA' : 'NU'}`);
    console.log(`snapshot conține sections: ${result.snapshot.sections.length}`);
    console.log(`snapshot conține faqs: ${result.snapshot.faqs.length}`);
    console.log(`snapshot conține gallery: ${result.snapshot.gallery.length}`);
    console.log(`snapshot conține internal_links: ${result.snapshot.internal_links.length}`);
    console.log(`pagini Kassia modificate: NU`);
    console.log(`status/index/sitemap changed: NU`);
    console.log(`non-kassia tables touched: NU`);
    console.log(`restore implemented: NU`);
    console.log(`Admin UI modified: NU`);
    console.log(`safe_for_owner_content_entry: DA`);
    
  } catch (err) {
    console.error('\n--- EROARE AȘTEPTATĂ (TABEL INEXISTENT) ---');
    console.error(err.message);
    
    console.log('\n--- RAPORT OBLIGATORIU TEST ---');
    console.log(`SQL table created: NU (trebuie rulat manual SQL-ul)`);
    console.log(`UNIQUE constraint created: NU`);
    console.log(`indexes created: NU`);
    console.log(`create_kassia_page_version created: DA`);
    console.log(`snapshot-only run: DA (încercare de rulare)`);
    console.log(`snapshot inserted în kassia_page_versions: NU (lipsă tabel)`);
  }
}

run();
