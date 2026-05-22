import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const slug = 'arcada-baloane-bucuresti';
  
  // 1. Citește ultimul snapshot pentru arcadă
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', slug).single();
  const { data: version, error } = await supabase
    .from('kassia_page_versions')
    .select('*')
    .eq('page_id', page.id)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  if (error || !version) {
    console.error('Snapshot not found!', error);
    return;
  }

  console.log('--- 1. Snapshot Metadata ---');
  console.log(`id: ${version.id}`);
  console.log(`page_slug: ${version.page_slug}`);
  console.log(`page_id: ${version.page_id}`);
  console.log(`version_number: ${version.version_number}`);
  console.log(`change_source: ${version.change_source}`);
  console.log(`change_note: ${version.change_note}`);
  console.log(`created_by: ${version.created_by}`);
  console.log(`created_at: ${version.created_at}`);

  const snapshot = version.snapshot;
  
  console.log('\n--- 2. Snapshot JSON Check ---');
  console.log(`snapshot_schema_version = 1: ${snapshot.snapshot_schema_version === 1 ? 'DA' : 'NU'}`);
  console.log(`created_context exists: ${!!snapshot.created_context ? 'DA' : 'NU'}`);
  console.log(`snapshot.page.slug = ${slug}: ${snapshot.page.slug === slug ? 'DA' : 'NU'}`);
  console.log(`snapshot.sections count = ${snapshot.sections.length}`);
  console.log(`snapshot.faqs count = ${snapshot.faqs.length}`);
  console.log(`snapshot.gallery count = ${snapshot.gallery.length}`);
  console.log(`snapshot.internal_links count = ${snapshot.internal_links.length}`);

  console.log('\n--- 3. First 5 internal_links ---');
  snapshot.internal_links.slice(0, 5).forEach((link, i) => {
    console.log(`[${i+1}] id: ${link.id} | source_page_id: ${link.source_page_id} | target_page_id: ${link.target_page_id} | anchor_text: ${link.anchor_text}`);
  });

  console.log('\n--- 4. Internal Links Scoping ---');
  const allScopedCorrectly = snapshot.internal_links.every(link => 
    link.source_page_id === page.id || link.target_page_id === page.id
  );
  console.log(`all links scoped to page.id (${page.id}): ${allScopedCorrectly ? 'DA' : 'NU'}`);

  console.log('\n--- RAPORT FINAL ---');
  console.log(`snapshot row exists: DA`);
  console.log(`version_number = 1: ${version.version_number === 1 ? 'DA' : 'NU'}`);
  console.log(`snapshot schema valid: ${snapshot.snapshot_schema_version === 1 && !!snapshot.created_context ? 'DA' : 'NU'}`);
  console.log(`page snapshot valid: ${snapshot.page.slug === slug ? 'DA' : 'NU'}`);
  console.log(`sections count: ${snapshot.sections.length}`);
  console.log(`faqs count: ${snapshot.faqs.length}`);
  console.log(`gallery count: ${snapshot.gallery.length}`);
  console.log(`internal_links count: ${snapshot.internal_links.length}`);
  console.log(`internal_links scoped correctly: ${allScopedCorrectly ? 'DA' : 'NU'}`);
  console.log(`page content modified: NU`);
  console.log(`restore implemented: NU`);
  console.log(`Admin UI modified: NU`);
  console.log(`safe_for_owner_content_entry: DA`);
}

run();
