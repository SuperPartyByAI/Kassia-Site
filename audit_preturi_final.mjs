import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', 'preturi-decoratiuni-baloane').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
  const { data: faqs } = await supabase.from('kassia_faqs').select('*').eq('page_id', page.id);

  console.log('--- PAGE INFO ---');
  console.log('H1:', page.h1);
  console.log('Meta Title:', page.meta_title);
  console.log('Meta Desc:', page.meta_description);
  console.log('Page Type:', page.page_type);
  console.log('Status:', page.status, page.index_status, page.include_in_sitemap);

  console.log('--- SECTIONS INFO ---');
  let placeholderCount = 0;
  let textCounts = {
    '[XXX]': 0, 'Aici vei putea': 0, 'Adaugă': 0, 'Placeholder': 0, 'ofertăa': 0,
    'ofertă finală': 0, 'în ofertă finală': 0
  };

  const jumpLinks = [];
  const sectionIds = [];

  sections.forEach(s => {
    let text = JSON.stringify(s.content).toLowerCase();
    textCounts['[XXX]'] += (text.match(/\[xxx\]/g) || []).length;
    textCounts['Aici vei putea'] += (text.match(/aici vei putea/g) || []).length;
    textCounts['Adaugă'] += (text.match(/adaugă/g) || []).length;
    textCounts['Placeholder'] += (text.match(/placeholder/g) || []).length;
    textCounts['ofertăa'] += (text.match(/ofertăa/g) || []).length;
    
    // Check capitalization of "Oferta finală poate include" in body
    if (s.content && typeof s.content === 'object' && s.content.body) {
      if (s.content.body.includes('oferta finală poate include')) {
         textCounts['ofertă finală']++;
      }
    }

    if (s.section_type === 'service_card') {
      let c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
      jumpLinks.push({ title: s.heading, link: c.cta_url });
    }
    if (s.section_type === 'content' && s.heading) {
      let id = 'preturi-' + s.heading.replace('Prețuri ', '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      sectionIds.push({ title: s.heading, id: id });
    }
  });

  console.log('Counts:', textCounts);
  console.log('Jump Links from Cards:');
  jumpLinks.forEach(j => console.log('  ', j.title, '->', j.link));
  console.log('Target Sections IDs:');
  sectionIds.forEach(s => console.log('  ', s.title, '->', s.id));

  console.log('--- FAQs INFO ---');
  console.log('FAQ Count:', faqs ? faqs.length : 0);
  if (faqs) {
    faqs.forEach(f => console.log('  Q:', f.question, 'A:', f.answer));
  }
}

run();
