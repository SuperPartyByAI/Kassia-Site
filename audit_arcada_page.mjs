import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', 'arcada-baloane-bucuresti').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id).order('order_index', { ascending: true });
  const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id).order('order_index', { ascending: true });

  let textToAudit = `${page.h1} ${page.meta_title} ${page.meta_description} `;
  let serviceCardCount = 0;
  let brokenLinks = 0;
  let hasSortOrder = false;
  let orderIndexValid = true;

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

  sections.forEach((s, i) => {
    if (s.order_index !== i + 1) orderIndexValid = false;
    if (s.sort_order !== null && s.sort_order !== undefined) hasSortOrder = true;

    const c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
    textToAudit += `${s.heading} `;
    if (c?.body) textToAudit += `${c.body} `;
    if (c?.cta_text) textToAudit += `${c.cta_text} `;
    if (c?.subheading) textToAudit += `${c.subheading} `;

    if (s.section_type === 'service_card') {
      serviceCardCount++;
      if (!validLinks.includes(c?.cta_url)) brokenLinks++;
    }
  });

  const uniqueFaqs = new Set(faqs.map(f => f.question));
  faqs.forEach(f => {
    textToAudit += `${f.question} ${f.answer} `;
  });

  let plainText = textToAudit.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const findMatch = (rx) => (plainText.match(rx) || []).length;
  const seoCheck = (word) => plainText.toLowerCase().includes(word.toLowerCase());

  console.log('--- AUDIT REPORT ---');
  console.log(`H1/meta corecte: ${page.h1 === 'Arcade din baloane în București și Ilfov' ? 'DA' : 'NU'}`);
  console.log(`sections count: ${sections.length}`);
  console.log(`service_card count: ${serviceCardCount}/4`);
  console.log(`FAQ count: ${faqs.length}/4`);
  console.log(`duplicate FAQ: ${faqs.length - uniqueFaqs.size}`);
  console.log(`order_index valid: ${orderIndexValid ? 'DA' : 'NU'}`);
  console.log(`sort_order used: ${hasSortOrder ? 'DA' : 'NU'}`);
  console.log(`placeholder count: ${findMatch(/Placeholder/gi)}`);
  console.log(`[XXX] count: ${findMatch(/\[XXX\]/gi)}`);
  console.log(`broken card links: ${brokenLinks}`);
  
  const seoTerms = ['arcade', 'semi-arcade', 'ghirlande', 'candy bar', 'panou foto', 'București', 'Ilfov', 'montaj'];
  const allSeoPresent = seoTerms.every(t => seoCheck(t));
  console.log(`SEO coverage: ${allSeoPresent ? 'DA' : 'NU'} (${seoTerms.filter(t => seoCheck(t)).join(', ')})`);
}

run();
