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

  if (!page) {
    console.error('Homepage not found');
    return;
  }

  // Fetch the current sections to update their JSON content
  const { data: sections } = await supabase
    .from('kassia_page_sections')
    .select('*')
    .eq('page_id', page.id)
    .eq('section_type', 'service_card');

  const images = {
    'Arcade Baloane': 'https://images.unsplash.com/photo-1526487968516-16067fc9b596?q=80&w=800&auto=format&fit=crop',
    'Ghirlande Baloane': 'https://images.unsplash.com/photo-1502631155828-b4b1a473f32d?q=80&w=800&auto=format&fit=crop',
    'Baloane cu Heliu': 'https://images.unsplash.com/photo-1533294455009-a77b7557d2d1?q=80&w=800&auto=format&fit=crop',
    'Aranjamente de Masă': 'https://images.unsplash.com/photo-1530105809594-522db9fb641a?q=80&w=800&auto=format&fit=crop'
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
