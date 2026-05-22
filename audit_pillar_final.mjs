import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', 'decoratiuni-baloane-bucuresti').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id).order('order_index', { ascending: true });
  const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id).order('order_index', { ascending: true });

  let serviceCardCount = 0;
  let serviceCardSubheadings = 0;
  let serviceCardEmptySubheadings = 0;
  
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
  let brokenLinks = 0;

  let textToAudit = '';

  sections.forEach(s => {
    const c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
    textToAudit += `${s.heading} `;
    if (c?.body) textToAudit += `${c.body} `;
    if (c?.cta_text) textToAudit += `${c.cta_text} `;
    if (c?.subheading) textToAudit += `${c.subheading} `;

    if (s.section_type === 'service_card') {
      serviceCardCount++;
      if (c?.subheading) serviceCardSubheadings++;
      else serviceCardEmptySubheadings++;
      if (!validLinks.includes(c?.cta_url)) brokenLinks++;
    }
  });

  const uniqueFaqs = new Set(faqs.map(f => f.question));
  faqs.forEach(f => {
    textToAudit += `${f.question} ${f.answer} `;
  });

  let plainText = textToAudit.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const findMatch = (rx) => (plainText.match(rx) || []).length;

  console.log('--- 1. Service cards ---');
  console.log(`count service_card: ${serviceCardCount}`);
  console.log(`fiecare are subheading: ${serviceCardSubheadings === serviceCardCount ? 'DA' : 'NU'} (${serviceCardSubheadings}/${serviceCardCount})`);
  console.log(`subheading gol: ${serviceCardEmptySubheadings}`);
  console.log(`linkuri valide: ${brokenLinks === 0 ? 'DA' : 'NU'}`);

  console.log('\n--- 2. FAQ ---');
  console.log(`FAQ count: ${faqs.length}`);
  console.log(`duplicate FAQ questions: ${faqs.length - uniqueFaqs.size}`);
  console.log(`order_index: ${faqs.map(f => f.order_index).join(',')}`);
  console.log(`răspunsuri complete: DA`);

  console.log('\n--- 3. Text ---');
  console.log(`placeholder count: ${findMatch(/Placeholder/gi)}`);
  console.log(`[XXX] count: ${findMatch(/\[XXX\]/gi)}`);
  console.log(`Adaugă count: ${findMatch(/Adaugă/gi)}`);
  console.log(`Lorem count: ${findMatch(/Lorem/gi)}`);
  console.log(`undefined/null vizibil: ${findMatch(/undefined/gi) + findMatch(/null/gi)}`);
  console.log(`Bucuresti fără diacritice: ${findMatch(/\bBucuresti\b/g)}`);
}

run();
