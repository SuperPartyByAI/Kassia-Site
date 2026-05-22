import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', 'decoratiuni-baloane-bucuresti').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id).order('order_index', { ascending: true });
  const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id).order('order_index', { ascending: true });

  console.log('--- PAGE INFO ---');
  console.log(`H1: ${page.h1}`);
  console.log(`Meta Title: ${page.meta_title}`);
  console.log(`Meta Description: ${page.meta_description}`);
  console.log(`Page Type: ${page.page_type}`);
  console.log(`Status: ${page.status} / Index: ${page.index_status} / Sitemap: ${page.include_in_sitemap}`);

  console.log('\n--- SECTIONS DB ---');
  console.log(`Total sections: ${sections.length}`);
  
  let serviceCardCount = 0;
  let textToAudit = `${page.h1} ${page.meta_title} ${page.meta_description} `;
  let brokenLinks = 0;

  const validLinks = [
    '/arcada-baloane-bucuresti/',
    '/baloane-heliu-bucuresti/',
    '/panou-foto-baloane-bucuresti/',
    '/decoratiuni-baloane-botez-bucuresti/',
    '/decoratiuni-baloane-nunta-bucuresti/',
    '/preturi-decoratiuni-baloane/',
    '/galerie/',
    '/contact/'
  ];

  sections.forEach(s => {
    console.log(`- Type: ${s.section_type} | Order: ${s.order_index} | Heading: ${s.heading || 'N/A'}`);
    const c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
    console.log(`  CTA: ${c?.cta_text || 'N/A'} | URL: ${c?.cta_url || 'N/A'} | IMG: ${c?.image_url || 'N/A'}`);
    
    textToAudit += `${s.heading} `;
    if (c?.body) textToAudit += `${c.body} `;
    if (c?.cta_text) textToAudit += `${c.cta_text} `;
    if (c?.subheading) textToAudit += `${c.subheading} `;

    if (s.section_type === 'service_card') {
      serviceCardCount++;
      if (!validLinks.includes(c?.cta_url)) {
         brokenLinks++;
         console.log(`  BROKEN LINK FOUND: ${c?.cta_url}`);
      }
    }
  });

  console.log('\n--- FAQs DB ---');
  console.log(`Total FAQs: ${faqs.length}`);
  faqs.forEach(f => {
    console.log(`- Q (${f.order_index}): ${f.question}`);
    console.log(`  A: ${f.answer}`);
    textToAudit += `${f.question} ${f.answer} `;
  });

  console.log('\n--- TEXT EXTRAS BRUT ---');
  // Strip HTML for basic text extraction reading
  let plainText = textToAudit.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(plainText);

  console.log('\n--- TEXT AUDIT ---');
  const findMatch = (rx) => (plainText.match(rx) || []).length;
  console.log(`[XXX]:`, findMatch(/\[XXX\]/gi));
  console.log(`Aici vei putea:`, findMatch(/Aici vei putea/gi));
  console.log(`Adaugă:`, findMatch(/Adaugă/gi));
  console.log(`Placeholder:`, findMatch(/Placeholder/gi));
  console.log(`Lorem:`, findMatch(/Lorem/gi));
  console.log(`undefined:`, findMatch(/undefined/gi));
  console.log(`null:`, findMatch(/null/gi));
  console.log(`ofertăa:`, findMatch(/ofertăa/gi));
  console.log(`Bucuresti (fără diacritice):`, findMatch(/\bBucuresti\b/g));
  
  console.log('\n--- SEO COVERAGE ---');
  const seoCheck = (word) => plainText.toLowerCase().includes(word.toLowerCase());
  console.log(`decorațiuni cu baloane București: ${seoCheck('decorațiuni cu baloane în București') || seoCheck('decorațiuni cu baloane București')}`);
  console.log(`decorațiuni cu baloane Ilfov: ${seoCheck('decorațiuni cu baloane în București și Ilfov') || seoCheck('decorațiuni cu baloane Ilfov')}`);
  console.log(`arcade din baloane: ${seoCheck('arcade din baloane') || seoCheck('arcade organice din baloane')}`);
  console.log(`baloane cu heliu: ${seoCheck('baloane cu heliu')}`);
  console.log(`panouri foto: ${seoCheck('panouri foto')}`);
  console.log(`botez: ${seoCheck('botez')}`);
  console.log(`nuntă: ${seoCheck('nuntă') || seoCheck('nunți')}`);
  console.log(`aniversări/majorat: ${seoCheck('aniversări') && seoCheck('majorate')}`);
  console.log(`corporate: ${seoCheck('corporate')}`);
  console.log(`montaj: ${seoCheck('montaj')}`);
  console.log(`transport: ${seoCheck('transport')}`);
  
  console.log('\n--- FINAL COUNTS ---');
  console.log(`Broken links: ${brokenLinks}/${serviceCardCount}`);
}

run();
