import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'preturi-decoratiuni-baloane').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);

  let placeholderCount = 0;
  let ofertaTypoCount = 0;
  let xxxCount = 0;
  let serviceCardCount = 0;
  let contentCount = 0;
  let cardsClean = true;
  
  const sectionHeadings = sections.map(s => s.heading).join(', ');

  sections.forEach(s => {
    const text = JSON.stringify(s.content).toLowerCase();
    placeholderCount += (text.match(/aici vei putea adăuga/g) || []).length;
    ofertaTypoCount += (text.match(/ofertăa/g) || []).length;
    xxxCount += (text.match(/\[xxx\]/g) || []).length;

    if (s.section_type === 'service_card') {
      serviceCardCount++;
      let c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
      if (!s.heading || !c.cta_text || !c.cta_url || c.subheading) {
        cardsClean = false;
        console.log('Failed card:', s.heading, c);
      }
    } else if (s.section_type === 'content') {
      contentCount++;
    }
  });

  console.log(`- section headings: ${sectionHeadings}`);
  console.log(`- count „Aici vei putea adăuga”: ${placeholderCount}`);
  console.log(`- count „ofertăa”: ${ofertaTypoCount}`);
  console.log(`- count „[XXX]”: ${xxxCount}`);
  console.log(`- service_card count: ${serviceCardCount}`);
  console.log(`- content sections count: ${contentCount}`);
  console.log(`- cards clean: ${cardsClean ? 'DA' : 'NU'}`);

  const { data: allPages } = await supabase.from('kassia_pages').select('status, index_status, include_in_sitemap');
  let pub = 0, idx = 0, sit = 0;
  allPages.forEach(p => {
    if (p.status === 'published') pub++;
    if (p.index_status === 'index') idx++;
    if (p.include_in_sitemap) sit++;
  });
  console.log(`- published/index/sitemap counts = ${pub}/${idx}/${sit}`);
}

run();
