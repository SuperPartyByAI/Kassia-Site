import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('=== 1. CONTACT PAGE AUDIT ===');
  const { data: contactPage } = await supabase.from('kassia_pages').select('*').eq('slug', 'contact').single();
  console.log(`- h1: ${contactPage.h1}`);
  console.log(`- meta_title: ${contactPage.meta_title}`);
  console.log(`- meta_description: ${contactPage.meta_description}`);
  console.log(`- status / index_status / include_in_sitemap: ${contactPage.status} / ${contactPage.index_status} / ${contactPage.include_in_sitemap}`);
  
  const { data: contactHero } = await supabase.from('kassia_page_sections').select('*').eq('page_id', contactPage.id).eq('section_type', 'hero').single();
  let cHeroContent = typeof contactHero.content === 'string' ? JSON.parse(contactHero.content) : contactHero.content;
  console.log(`- hero body: ${cHeroContent.body}`);
  console.log(`- hero cta_text: ${cHeroContent.cta_text}`);
  console.log(`- hero cta_url: ${cHeroContent.cta_url}`);

  const { data: contactFaqs } = await supabase.from('kassia_faqs').select('id').eq('page_id', contactPage.id);
  console.log(`- FAQ count: ${contactFaqs.length}`);

  console.log('\n=== 2. PRETURI PAGE AUDIT ===');
  const { data: preturiPage } = await supabase.from('kassia_pages').select('*').eq('slug', 'preturi-decoratiuni-baloane').single();
  console.log(`- h1: ${preturiPage.h1}`);
  console.log(`- meta_title: ${preturiPage.meta_title}`);
  console.log(`- meta_description: ${preturiPage.meta_description}`);
  console.log(`- page_type: ${preturiPage.page_type}`);
  console.log(`- status / index_status / include_in_sitemap: ${preturiPage.status} / ${preturiPage.index_status} / ${preturiPage.include_in_sitemap}`);

  const { data: preturiSections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', preturiPage.id);
  console.log(`- section headings: ${preturiSections.map(s => s.heading || '[empty]').join(', ')}`);

  const { data: preturiFaqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', preturiPage.id);

  const preturiTextDump = JSON.stringify(preturiPage) + JSON.stringify(preturiSections) + JSON.stringify(preturiFaqs);
  const xxxCount = (preturiTextDump.match(/\[XXX\]/g) || []).length;
  const propunereCount = (preturiTextDump.toLowerCase().match(/propunere/g) || []).length;
  const ofertaCount = (preturiTextDump.toLowerCase().match(/ofertă|oferta/g) || []).length;

  console.log(`- [XXX] count în page + sections + FAQ: ${xxxCount}`);
  console.log(`- "propunere" count pe pagina asta: ${propunereCount}`);
  console.log(`- "ofertă/oferta" count pe pagina asta: ${ofertaCount}`);

  console.log('\n=== 3. GLOBAL SAFETY ===');
  const { data: allPages } = await supabase.from('kassia_pages').select('status, index_status, include_in_sitemap');
  let pub = 0, idx = 0, sit = 0;
  allPages.forEach(p => {
    if (p.status === 'published') pub++;
    if (p.index_status === 'index') idx++;
    if (p.include_in_sitemap) sit++;
  });
  console.log(`- published pages count: ${pub}`);
  console.log(`- index pages count: ${idx}`);
  console.log(`- include_in_sitemap=true count: ${sit}`);
}

run();
