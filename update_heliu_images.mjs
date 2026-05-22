import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const imageMappings = {
  'Baloane cu heliu pentru evenimente în București și Ilfov': '/images/heliu.webp',
  'Tipuri de baloane cu heliu': '/images/aranjamente.webp',
  'Unde se potrivesc baloanele cu heliu?': '/images/home-intro.webp',
  'Livrare și montaj în București și Ilfov': '/images/contact-intro.png'
};

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'baloane-heliu-bucuresti').single();
  
  if (!page) {
    console.error('Page not found');
    return;
  }

  const { data: sections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id);
  
  let updatedCount = 0;
  for (const section of sections) {
    if (imageMappings[section.heading]) {
      const imgPath = imageMappings[section.heading];
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
