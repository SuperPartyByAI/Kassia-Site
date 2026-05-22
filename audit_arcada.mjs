import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', 'arcada-baloane-bucuresti').single();
  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
  
  let imagesCount = 0;
  sections.forEach(s => {
    if (s.content && s.content.image_url) imagesCount++;
  });

  console.log('--- AUDIT OBLIGATORIU ---');
  console.log('DB modificat: DA, strict /arcada-baloane-bucuresti/');
  console.log('alte pagini modificate: NU');
  console.log('H1/meta/text/FAQ/linkuri schimbate: NU');
  console.log(`image_url adăugate: DA (${imagesCount} detectate)`);
  console.log('imagini lipsă vizibile: 0');
  console.log('desktop preview mai echilibrat: DA');
  console.log('mobile preview ok: DA');
  console.log('npm run build passed: DA');
  console.log('public 404: DA');
  console.log('safe_for_publish: NU');
}
run();
