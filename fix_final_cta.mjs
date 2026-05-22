import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'contact').single();
  if (!page) return;

  const { data: finalCta } = await supabase.from('kassia_page_sections')
    .select('id, content')
    .eq('page_id', page.id)
    .eq('section_type', 'final_cta')
    .single();

  if (finalCta) {
    const c = typeof finalCta.content === 'string' ? JSON.parse(finalCta.content) : finalCta.content;
    const bodyText = c.body || '';
    
    // Check if it already has the H2 in body
    if (!bodyText.includes('<h2>Vrei o ofertă pentru evenimentul tău?</h2>')) {
      c.body = `<h2>Vrei o ofertă pentru evenimentul tău?</h2>\n` + bodyText;
    }

    await supabase.from('kassia_page_sections')
      .update({ 
        heading: '', 
        content: c
      })
      .eq('id', finalCta.id);
  }

  console.log('Fixed final_cta!');
}

run();
