import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const imageMappings = {
  'Arcade din baloane pentru evenimente memorabile': '/images/arcade.webp',
  'Ce este o arcadă din baloane organică?': '/images/home-intro.webp',
  'Tipuri de arcade din baloane': '/images/ghirlande.webp',
  'Unde se potrivește o arcadă din baloane?': '/images/home-cta.webp'
};

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'arcada-baloane-bucuresti').single();
  
  if (!page) {
    console.error('Page not found');
    return;
  }

  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
  
  let updatedCount = 0;
  for (const section of sections) {
    if (imageMappings[section.heading]) {
      const imgPath = imageMappings[section.heading];
      // verify if file exists on disk
      const diskPath = path.join(process.cwd(), 'public', imgPath);
      if (fs.existsSync(diskPath)) {
        const updatedContent = { ...section.content, image_url: imgPath };
        await supabase.from('kassia_page_sections').update({ content: updatedContent }).eq('id', section.id);
        updatedCount++;
      } else {
        console.log(`Missing image file on disk: ${imgPath}`);
      }
    }
  }

  console.log(`Updated images for ${updatedCount} sections.`);
}

run();
