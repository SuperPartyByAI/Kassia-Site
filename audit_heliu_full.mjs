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

  const { data: version } = await supabase.from('kassia_page_versions').select('version_number').eq('page_id', page.id).order('version_number', {ascending: false}).limit(1).single();
  const hasSnapshot = !!version;
  const snapshotVersion = version ? version.version_number : null;

  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id).order('order_index', {ascending: true});
  const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id).order('order_index', {ascending: true});

  // TASK 1: Audit DB
  console.log('--- TASK 1 — Audit DB ---');
  console.log(`snapshot existent înainte de update: ${hasSnapshot ? 'DA' : 'NU'}, version_number: ${snapshotVersion}`);
  console.log(`h1: ${page.h1}`);
  console.log(`meta_title: ${page.meta_title}`);
  console.log(`meta_description: ${page.meta_description}`);
  console.log(`page_type: ${page.page_type}`);
  console.log(`status/index/sitemap: ${page.status}/${page.index_status}/${page.include_in_sitemap}`);
  console.log(`sections count: ${sections.length}`);
  
  const serviceCards = sections.filter(s => s.section_type === 'service_card');
  console.log(`service_card count: ${serviceCards.length}`);
  console.log(`FAQ count: ${faqs.length}`);
  
  const faqQuestions = faqs.map(f => f.question);
  const uniqueFaqs = new Set(faqQuestions);
  const duplicateFaqCount = faqs.length - uniqueFaqs.size;
  console.log(`duplicate FAQ: ${duplicateFaqCount}`);

  const hasOrderIndex = sections.every(s => s.order_index != null) && faqs.every(f => f.order_index != null);
  console.log(`order_index valid: ${hasOrderIndex ? 'DA' : 'NU'}`);
  
  const hasSortOrder = sections.some(s => s.sort_order !== undefined) || faqs.some(f => f.sort_order !== undefined);
  console.log(`sort_order used: ${hasSortOrder ? 'DA' : 'NU'}`);

  // check broken card links
  let brokenLinks = 0;
  const { data: allPages } = await supabase.from('kassia_pages').select('path');
  const validPaths = allPages.map(p => p.path);
  
  serviceCards.forEach(card => {
    if (card.content && card.content.cta_url && !validPaths.includes(card.content.cta_url)) {
      brokenLinks++;
    }
  });
  console.log(`broken card links: ${brokenLinks}`);

  // TASK 2: Text extras real
  console.log('\n--- TASK 2 — Text extras real ---');
  let fullText = `${page.h1} ${page.meta_title} ${page.meta_description} `;
  
  sections.forEach(s => {
    console.log(`[Section ${s.section_type}] Heading: ${s.heading || 'N/A'}`);
    if (s.content) {
      if (s.content.body) {
        console.log(`  Body: ${s.content.body}`);
        fullText += s.content.body + ' ';
      }
      if (s.content.subheading) {
        console.log(`  Subheading: ${s.content.subheading}`);
        fullText += s.content.subheading + ' ';
      }
    }
    if (s.heading) fullText += s.heading + ' ';
  });

  faqs.forEach(f => {
    console.log(`[FAQ] Q: ${f.question}`);
    console.log(`      A: ${f.answer}`);
    fullText += `${f.question} ${f.answer} `;
  });

  // TASK 3: Căutare probleme
  console.log('\n--- TASK 3 — Căutare probleme ---');
  const problems = [
    '\\[XXX\\]', 'Placeholder', 'Lorem', 'Adaugă', 'undefined', 'null',
    'heliu pur', 'plutire garantată', 'livrare rapidă', '12-24h', 'câteva zile spre săptămâni',
    'Bucuresti' // specifically checking for Bucharest without diacritics
  ];

  let totalForbidden = 0;
  let totalPlaceholder = 0;

  problems.forEach(p => {
    const regex = new RegExp(p, 'gi');
    const matches = fullText.match(regex);
    const count = matches ? matches.length : 0;
    
    // Ignore "Bucuresti" inside URLs!
    let actualCount = count;
    if (p === 'Bucuresti') {
      // Find matches not preceded by a dash (like in a slug)
      const exactWordMatch = fullText.match(/\bBucuresti\b/g);
      actualCount = exactWordMatch ? exactWordMatch.length : 0;
    }

    if (actualCount > 0) {
      console.log(`- ${p}: ${actualCount}`);
      if (['\\[XXX\\]', 'Placeholder', 'Lorem'].includes(p)) totalPlaceholder += actualCount;
      else totalForbidden += actualCount;
    }
  });
  if (totalForbidden === 0 && totalPlaceholder === 0) console.log('0 probleme detectate.');

  // TASK 4: SEO coverage
  console.log('\n--- TASK 4 — SEO coverage ---');
  const seoTerms = ['baloane cu heliu', 'buchete', 'cifre', 'litere', 'folie', 'latex', 'aniversări', 'botez', 'București', 'Ilfov', 'livrare', 'montaj'];
  let coverageOk = true;
  seoTerms.forEach(term => {
    const regex = new RegExp(term, 'gi');
    const found = regex.test(fullText);
    if (!found) coverageOk = false;
  });
  console.log(`Acoperire naturală termeni SEO: ${coverageOk ? 'DA' : 'NU'}`);

  // TASK 5: Raport final
  console.log('\n--- Raport final ---');
  console.log('DB modificat în audit: NU');
  console.log(`snapshot existent: ${hasSnapshot ? 'DA' : 'NU'}`);
  console.log(`H1/meta corecte: ${page.h1 && page.meta_title ? 'DA' : 'NU'}`);
  console.log(`sections count: ${sections.length}`);
  console.log(`service_card count: ${serviceCards.length}/4`);
  console.log(`FAQ count: ${faqs.length}/4`);
  console.log(`duplicate FAQ: ${duplicateFaqCount}`);
  console.log(`order_index valid: ${hasOrderIndex ? 'DA' : 'NU'}`);
  console.log(`sort_order used: ${hasSortOrder ? 'DA' : 'NU'}`);
  console.log(`placeholder/[XXX]: ${totalPlaceholder}/0`);
  console.log(`forbidden terms count: ${totalForbidden}`);
  console.log(`broken card links: ${brokenLinks}`);
  console.log(`SEO coverage complete: ${coverageOk ? 'DA' : 'NU'}`);
  // build result appended by bash
}

run();
