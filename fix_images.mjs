import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase
    .from('kassia_pages')
    .select('id')
    .eq('path', '/')
    .single();

  const { data: sections } = await supabase
    .from('kassia_page_sections')
    .select('*')
    .eq('page_id', page.id)
    .eq('section_type', 'service_card');

  const images = {
    'Arcade Baloane': 'https://placehold.co/600x800/fdf4ff/a855f7?text=Arcade+Baloane',
    'Ghirlande Baloane': 'https://placehold.co/600x800/fdf4ff/a855f7?text=Ghirlande+Organice',
    'Baloane cu Heliu': 'https://placehold.co/600x800/fdf4ff/a855f7?text=Baloane+Heliu',
    'Aranjamente de Masă': 'https://placehold.co/600x800/fdf4ff/a855f7?text=Aranjamente+Masa'
  };

  for (const sec of sections) {
    if (images[sec.heading]) {
      const updatedContent = typeof sec.content === 'string' ? JSON.parse(sec.content) : sec.content;
      updatedContent.image_url = images[sec.heading];

      await supabase
        .from('kassia_page_sections')
        .update({ content: updatedContent })
        .eq('id', sec.id);
      
      console.log(`Updated image for ${sec.heading}`);
    }
  }
}

run();
