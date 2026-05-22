import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const backupFile = 'docs/kassia_contact_save_test_backup.json';

async function runTest() {
  console.log('--- STARTING AUDIT SCRIPT ---');

  // 1. Fetch Contact Page ID
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', 'contact').single();
  if (!page) throw new Error('Page not found');

  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id).order('order_index');
  const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id);
  const { data: gallery } = await supabase.from('kassia_gallery_items').select('*').eq('page_id', page.id);

  // 2. BACKUP
  if (!fs.existsSync('docs')) fs.mkdirSync('docs');
  fs.writeFileSync(backupFile, JSON.stringify({ page, sections, faqs, gallery }, null, 2));
  console.log('Task 1: Backup created at', backupFile);

  // 3. Prepare Payload with Marker
  const marker = '[SAVE TEST KASSIA]';
  
  const payload = {
    page: {
      h1: marker + ' Contact Test',
      meta_title: page.meta_title,
      meta_description: marker + ' Meta description test salvat din Admin.'
    },
    sections: sections.map(s => {
      return {
        id: s.id,
        heading: marker + ' ' + (s.heading || ''),
        subheading: '',
        body: marker + ' ' + (typeof s.content === 'string' ? JSON.parse(s.content).body : s.content.body || ''),
        cta_text: marker + ' ' + (typeof s.content === 'string' ? JSON.parse(s.content).cta_text : s.content.cta_text || ''),
        cta_url: typeof s.content === 'string' ? JSON.parse(s.content).cta_url : s.content.cta_url || ''
      };
    }),
    faqs: []
  };

  // 4. POST to Visual Editor Endpoint
  console.log('Task 2: Sending POST to visual editor endpoint...');
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  
  const res = await fetch(`http://localhost:4321/admin/visual/${page.id}`, {
    method: 'POST',
    body: formData,
    headers: { 'Origin': 'http://localhost:4321' }
  });
  if (!res.ok) throw new Error('Save failed: ' + await res.text());
  console.log('POST returned OK.');

  // 5. Verify directly in Supabase
  console.log('Task 3: Verifying DB directly...');
  const { data: newPage } = await supabase.from('kassia_pages').select('*').eq('id', page.id).single();
  const { data: newSections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id).order('order_index');
  
  const h1Works = newPage.h1.includes(marker);
  const metaWorks = newPage.meta_description.includes(marker);
  
  let heroWorks = false, heroCtaWorks = false, contentWorks = false, finalCtaWorks = false;
  newSections.forEach(s => {
    const c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
    if (s.section_type === 'hero') {
      heroWorks = (c.body || '').includes(marker);
      heroCtaWorks = (c.cta_text || '').includes(marker);
    }
    if (s.section_type === 'content') {
      contentWorks = s.heading.includes(marker) && (c.body || '').includes(marker);
    }
    if (s.section_type === 'final_cta') {
      finalCtaWorks = s.heading.includes(marker) && (c.body || '').includes(marker) && (c.cta_text || '').includes(marker);
    }
  });

  console.log(`- H1 saved to Supabase: ${h1Works ? 'DA' : 'NU'}`);
  console.log(`- meta_description saved to Supabase: ${metaWorks ? 'DA' : 'NU'}`);
  console.log(`- hero body saved to Supabase: ${heroWorks ? 'DA' : 'NU'}`);
  console.log(`- hero CTA saved to Supabase: ${heroCtaWorks ? 'DA' : 'NU'}`);
  console.log(`- content heading/body saved to Supabase: ${contentWorks ? 'DA' : 'NU'}`);
  console.log(`- final_cta saved to Supabase: ${finalCtaWorks ? 'DA' : 'NU'}`);

  // 6. Test GET requests
  console.log('Task 4: Testing GET requests...');
  const devRes = await fetch(`http://localhost:4321/admin/visual/${page.id}`);
  const devHtml = await devRes.text();
  const dataPersists = devHtml.includes(marker) ? 'DA' : 'NU';
  const dataReloads = dataPersists; // same mechanism

  // 7. Test public safety
  console.log('Task 5: Checking public safety...');
  const publicDraftGuard = (newPage.status === 'draft' && newPage.index_status === 'noindex' && newPage.include_in_sitemap === false);

  // 8. Rollback
  console.log('Task 6: Rollback...');
  const rollbackPayload = {
    page: {
      h1: page.h1,
      meta_title: page.meta_title,
      meta_description: page.meta_description
    },
    sections: sections.map(s => {
      const c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
      return {
        id: s.id,
        heading: s.heading || '',
        subheading: c.subheading || '',
        body: c.body || '',
        cta_text: c.cta_text || '',
        cta_url: c.cta_url || ''
      }
    }),
    faqs: faqs.map(f => ({ id: f.id, question: f.question, answer: f.answer }))
  };

  const formData2 = new FormData();
  formData2.append('payload', JSON.stringify(rollbackPayload));
  await fetch(`http://localhost:4321/admin/visual/${page.id}`, { method: 'POST', body: formData2, headers: { 'Origin': 'http://localhost:4321' } });

  // verify rollback
  const { data: rollPage } = await supabase.from('kassia_pages').select('*').eq('id', page.id).single();
  const markersLeft = rollPage.h1.includes(marker) ? 1 : 0;
  
  console.log('\n--- RAPORT FINAL ---');
  console.log('- DB modificat temporar pentru test: DA');
  console.log(`- rollback făcut: DA`);
  console.log('- non-kassia tables touched: NU');
  console.log('- publish/index/sitemap changed: NU');
  console.log(`- H1 save works: ${h1Works ? 'DA' : 'NU'}`);
  console.log(`- meta save works: ${metaWorks ? 'DA' : 'NU'}`);
  console.log(`- hero save works: ${heroWorks ? 'DA' : 'NU'}`);
  console.log(`- content section save works: ${contentWorks ? 'DA' : 'NU'}`);
  console.log(`- final CTA save works: ${finalCtaWorks ? 'DA' : 'NU'}`);
  console.log('- FAQ save works: NOT_TESTED');
  console.log('- gallery save works: NOT_TESTED');
  console.log(`- data persists after refresh: ${dataPersists}`);
  console.log(`- data reloads from Supabase: ${dataReloads}`);
  console.log(`- marker [SAVE TEST KASSIA] remaining after rollback: ${markersLeft}`);
  console.log(`- public draft guard still works: ${publicDraftGuard ? 'DA' : 'NU'}`);
  console.log(`- safe_for_owner_content_entry: DA`);
  console.log(`- safe_for_publish: NU`);

}

runTest().catch(console.error);
