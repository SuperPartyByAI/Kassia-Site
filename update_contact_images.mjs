import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('path', '/contact/').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
  
  for (let s of sections) {
    if (s.section_type === 'content') {
      const updatedContent = { ...s.content, image_url: '/images/contact-intro.png' };
      await supabase.from('kassia_page_sections').update({ content: updatedContent }).eq('id', s.id);
    } else if (s.section_type === 'final_cta') {
      const updatedContent = { ...s.content, image_url: '/images/contact-cta.png' };
      await supabase.from('kassia_page_sections').update({ content: updatedContent }).eq('id', s.id);
    }
  }
  console.log('Images attached successfully!');
}
run();
