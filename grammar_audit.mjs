import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'preturi-decoratiuni-baloane').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);

  let ctaShortCount = 0;
  let ofertaTypoCount = 0;
  let textCounts = {
    'ofertă depinde': 0,
    'ofertă finală': 0,
    'în ofertă': 0
  };

  sections.forEach(s => {
    const text = JSON.stringify(s.content).toLowerCase();
    ofertaTypoCount += (text.match(/ofertăa/g) || []).length;
    textCounts['ofertă depinde'] += (text.match(/ofertă depinde/g) || []).length;
    textCounts['ofertă finală'] += (text.match(/ofertă finală/g) || []).length;

    let c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
    if (s.section_type === 'content' && c.cta_text === 'Scrie-ne pe WhatsApp') {
      ctaShortCount++;
    }
  });

  console.log(`- „ofertă depinde” count: ${textCounts['ofertă depinde']}`);
  console.log(`- „ofertă finală” greșit count: ${textCounts['ofertă finală']}`);
  console.log(`- „ofertăa” count: ${ofertaTypoCount}`);
  console.log(`- CTA-uri scurtate (Scrie-ne pe WhatsApp): ${ctaShortCount}`);
}

run();
