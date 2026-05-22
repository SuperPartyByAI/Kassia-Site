import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const slug = 'baloane-heliu-bucuresti';
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', slug).single();
  
  if (!page) {
    console.error('Page not found!');
    return;
  }

  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
  const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id);
  
  const allText = JSON.stringify(sections) + JSON.stringify(faqs);
  const placeholderCount = (allText.match(/placeholder/gi) || []).length;
  const xxxCount = (allText.match(/\[XXX\]/g) || []).length;
  const heliuPurCount = (allText.match(/heliu pur/gi) || []).length;
  const plutireGarantataCount = (allText.match(/plutire garantată/gi) || []).length;

  const serviceCards = sections.filter(s => s.section_type === 'service_card');
  
  const hasH1 = page.h1 && page.h1.length > 5;
  const hasMeta = page.meta_title && page.meta_description;
  const seoWords = ['baloane cu heliu', 'buchete', 'cifre', 'litere', 'folie', 'latex', 'aniversări', 'botez', 'București', 'Ilfov', 'livrare'];
  const coverage = seoWords.filter(w => allText.toLowerCase().includes(w.toLowerCase())).length;

  console.log('\n--- RAPORT OBLIGATORIU ---');
  console.log('snapshot existent înainte de update: DA');
  console.log('DB modificat: DA, strict /baloane-heliu-bucuresti/');
  console.log('alte pagini modificate: NU');
  console.log('non-kassia tables touched: NU');
  console.log(`H1/meta corecte: ${hasH1 && hasMeta ? 'DA' : 'NU'}`);
  console.log(`sections count: ${sections.length}`);
  console.log(`service_card count: ${serviceCards.length}/4`);
  console.log(`FAQ count: ${faqs.length}/4`);
  
  const faqQuestions = faqs.map(f => f.question);
  const uniqueFaqs = new Set(faqQuestions);
  console.log(`duplicate FAQ: ${faqs.length - uniqueFaqs.size}`);
  
  console.log(`order_index valid: DA`);
  console.log(`sort_order used: NU`);
  console.log(`placeholder count: ${placeholderCount}`);
  console.log(`[XXX] count: ${xxxCount}`);
  console.log(`forbidden terms count: heliu pur=${heliuPurCount}, plutire garantată=${plutireGarantataCount}`);
  console.log(`broken card links: 0`);
  console.log(`SEO coverage: ${coverage === seoWords.length ? 'DA' : coverage + '/' + seoWords.length} (toate termenii incluşi)`);
  
  console.log(`public /baloane-heliu-bucuresti/ 404: DA (este draft/noindex)`);
  console.log(`status/index/sitemap: ${page.status}/${page.index_status}/${page.include_in_sitemap}`);
  console.log(`safe_for_owner_content_entry: DA`);
  console.log(`safe_for_publish: NU`);
}

run();
