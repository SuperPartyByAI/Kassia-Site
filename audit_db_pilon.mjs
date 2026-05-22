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

  console.log('--- PAGE INFO ---');
  console.log('ID:', page.id);
  console.log('H1:', page.h1);
  console.log('Title:', page.title);
  console.log('Meta Title:', page.meta_title);
  console.log('Meta Desc:', page.meta_description);
  console.log('Page Type:', page.page_type);
  console.log('Status:', page.status, page.index_status, page.include_in_sitemap);

  console.log('\n--- SECTIONS INFO ---');
  console.log('Total Sections:', sections ? sections.length : 0);
  
  let serviceCardCount = 0;
  let brokenCardLinks = 0;
  
  if (sections) {
    sections.forEach(s => {
      console.log(`- ID: ${s.id}, Type: ${s.section_type}, Heading: ${s.heading}, OrderIndex: ${s.order_index}, SortOrder: ${s.sort_order}`);
      const c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
      console.log(`  CTA Text: ${c?.cta_text || 'N/A'}`);
      console.log(`  CTA URL: ${c?.cta_url || 'N/A'}`);
      console.log(`  Image: ${c?.image_url || 'N/A'}`);
      
      if (s.section_type === 'service_card') {
        serviceCardCount++;
        const targetUrl = c?.cta_url;
        if (targetUrl !== '/galerie/' && targetUrl !== '/contact/' && !pageSlugs.includes(targetUrl)) {
          brokenCardLinks++;
          console.log(`  -> BROKEN LINK: ${targetUrl}`);
        }
      }
    });
  }

  console.log('\n--- FAQs INFO ---');
  console.log('Total FAQ:', faqs ? faqs.length : 0);
  if (faqs) {
    faqs.forEach(f => {
      console.log(`- Q: ${f.question}`);
      console.log(`  A: ${f.answer}`);
      console.log(`  Order: ${f.order_index}, Sort: ${f.sort_order}`);
    });
  }
}

run();
