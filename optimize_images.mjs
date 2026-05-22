import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const imagesDir = path.join(process.cwd(), 'public', 'images');

async function optimizeImages() {
  const files = fs.readdirSync(imagesDir);
  const imageFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));

  console.log(`Found ${imageFiles.length} images to optimize.`);

  for (const file of imageFiles) {
    const filePath = path.join(imagesDir, file);
    const parsedPath = path.parse(filePath);
    const webpPath = path.join(imagesDir, `${parsedPath.name}.webp`);

    try {
      await sharp(filePath)
        .resize(800, null, { withoutEnlargement: true }) // resize width to 800px max
        .webp({ quality: 80 })
        .toFile(webpPath);
      console.log(`Optimized: ${file} -> ${parsedPath.name}.webp`);
    } catch (err) {
      console.error(`Error optimizing ${file}:`, err);
    }
  }

  // Update Supabase records
  console.log('Updating Supabase records to use .webp...');
  
  // 1. Update kassia_page_sections
  const { data: sections } = await supabase.from('kassia_page_sections').select('id, content');
  if (sections) {
    for (const section of sections) {
      if (section.content && section.content.image_url && !section.content.image_url.endsWith('.webp')) {
        const oldUrl = section.content.image_url;
        const newUrl = oldUrl.replace(/\.(png|jpe?g)$/, '.webp');
        section.content.image_url = newUrl;
        await supabase.from('kassia_page_sections').update({ content: section.content }).eq('id', section.id);
        console.log(`Updated section ${section.id} image to ${newUrl}`);
      }
    }
  }

  console.log('Done optimizing and updating!');
}

optimizeImages();
