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

  // Update the 4 sections we just inserted
  const headings = ['Arcade Baloane', 'Ghirlande Baloane', 'Baloane cu Heliu', 'Aranjamente de Masă'];
  
  const { error } = await supabase
    .from('kassia_page_sections')
    .update({ section_type: 'service_card' })
    .eq('page_id', page.id)
    .in('heading', headings);

  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Successfully updated to service_card');
  }
}

run();
