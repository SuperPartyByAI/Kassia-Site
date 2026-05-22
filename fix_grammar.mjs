import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: sections } = await supabase.from('kassia_page_sections').select('*, kassia_pages!inner(slug)');

  for (const s of sections) {
    let c = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
    let changed = false;

    // Task 3: Fix grammar
    const fixes = [
      { from: /ofertă depinde/g, to: 'oferta depinde' },
      { from: /Ofertă depinde/g, to: 'Oferta depinde' },
      { from: /în ofertă finală/g, to: 'în oferta finală' },
      { from: /ofertă finală poate/g, to: 'oferta finală poate' },
      { from: /Ofertă finală poate/g, to: 'Oferta finală poate' },
      { from: /în ofertă/g, to: 'în ofertă' } // No change needed if it's correct, but they said "în ofertă" -> let's check context.
    ];

    if (c.body) {
      fixes.forEach(f => {
        if (f.from.test(c.body)) {
          c.body = c.body.replace(f.from, f.to);
          changed = true;
        }
      });
    }

    // Task 4: Shorten CTA on prices page
    if (s.kassia_pages.slug === 'preturi-decoratiuni-baloane' && s.section_type === 'content') {
      if (c.cta_text && c.cta_text.includes('Cere o ofertă exactă')) {
        c.cta_text = 'Scrie-ne pe WhatsApp';
        changed = true;
      }
    }

    if (changed) {
      await supabase.from('kassia_page_sections').update({ content: c }).eq('id', s.id);
    }
  }

  console.log('Grammar and CTA fixes applied.');
}

run();
