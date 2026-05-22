import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', 'decoratiuni-baloane-bucuresti').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
  const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id);
  const { data: allPages } = await supabase.from('kassia_pages').select('slug');

  const pageSlugs = allPages.map(p => '/' + p.slug + '/');

  let heroCount = 0;
  let contentCount = 0;
  let serviceCardCount = 0;
  let brokenCardLinks = 0;
  let allHaveOrderIndex = true;
  let sortOrderUsed = false;
  
  let placeholderCount = 0;
  let xxxCount = 0;

  if (sections) {
    sections.forEach(s => {
      if (s.section_type === 'hero') heroCount++;
      if (s.section_type === 'content') contentCount++;
      if (s.section_type === 'service_card') serviceCardCount++;
      
      if (s.order_index === undefined || s.order_index === null) allHaveOrderIndex = false;
      if (s.sort_order !== undefined) sortOrderUsed = true; // Supabase JS usually drops undefined cols anyway if they don't exist

      const text = JSON.stringify(s.content).toLowerCase() + (s.heading ? s.heading.toLowerCase() : '');
      placeholderCount += (text.match(/aici vei putea/g) || []).length;
      placeholderCount += (text.match(/adaugă/g) || []).length;
      placeholderCount += (text.match(/placeholder/g) || []).length;
      xxxCount += (text.match(/\[xxx\]/g) || []).length;

      const c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
      if (s.section_type === 'service_card') {
        const targetUrl = c?.cta_url;
        if (targetUrl !== '/galerie/' && targetUrl !== '/contact/' && !pageSlugs.includes(targetUrl)) {
          brokenCardLinks++;
        }
      }
    });
  }

  console.log('--- AUDIT REPORT ---');
  console.log('total sections:', sections ? sections.length : 0);
  console.log('hero count:', heroCount);
  console.log('content count:', contentCount);
  console.log('service_card count:', serviceCardCount);
  console.log('FAQ count:', faqs ? faqs.length : 0);
  console.log('toate secțiunile au order_index:', allHaveOrderIndex ? 'DA' : 'NU');
  console.log('sort_order folosit în secțiuni:', sortOrderUsed ? 'DA' : 'NU');
  console.log('service_card links target pages exist:', brokenCardLinks === 0 ? 'DA' : 'NU');
  console.log('broken card links:', brokenCardLinks);
  console.log('placeholder count:', placeholderCount);
  console.log('[XXX] count:', xxxCount);
  console.log('status/index/sitemap:', `${page.status}/${page.index_status}/${page.include_in_sitemap}`);
}

run();
