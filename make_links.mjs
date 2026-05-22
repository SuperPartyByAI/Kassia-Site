import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'contact').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id).eq('heading', 'Date de contact');
  const section = sections[0];
  const oldBody = section.content.body;
  
  let newBody = oldBody.replace(
    /<a href="tel:\+40768098268" class="[^"]*">0768 098 268<\/a>/g, 
    '<a href="tel:+40768098268" style="color: inherit; text-decoration: underline;"><strong>0768 098 268</strong></a>'
  );
  
  newBody = newBody.replace(
    /<a href="mailto:contact@kassia\.ro" class="[^"]*">contact@kassia\.ro<\/a>/g,
    '<a href="mailto:contact@kassia.ro" style="color: inherit; text-decoration: underline;"><strong>contact@kassia.ro</strong></a>'
  );

  await supabase.from('kassia_page_sections').update({
    content: { ...section.content, body: newBody }
  }).eq('id', section.id);

  console.log('Updated body to:', newBody);
}

run();
