import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Updating /contact/ SEO and Hero...');

  // 1. Update kassia_pages
  const { data: page, error: pageError } = await supabase
    .from('kassia_pages')
    .update({
      h1: 'Contact Kassia Events pentru decorațiuni cu baloane în București și Ilfov',
      meta_title: 'Contact Kassia Events | Decorațiuni cu baloane București și Ilfov',
      meta_description: 'Contactează Kassia Events pentru decorațiuni cu baloane în București și Ilfov. Cere ofertă pentru arcade, baloane cu heliu, panouri foto și decoruri pentru evenimente.'
    })
    .eq('slug', 'contact')
    .select('id')
    .single();

  if (pageError || !page) {
    console.error('Error updating page:', pageError);
    return;
  }
  console.log('Updated page metadata.');

  // 2. Update kassia_page_sections (Hero)
  const { data: heroSections, error: heroError } = await supabase
    .from('kassia_page_sections')
    .select('*')
    .eq('page_id', page.id)
    .eq('section_type', 'hero');

  if (heroError || !heroSections || heroSections.length === 0) {
    console.error('Hero section not found or error:', heroError);
    return;
  }

  const heroSec = heroSections[0];
  const newContent = {
    ...heroSec.content,
    body: '<p>Pregătești un eveniment în București sau Ilfov și vrei un decor cu baloane personalizat? Scrie-ne pe WhatsApp cu data, locația și tipul evenimentului, iar echipa Kassia Events îți răspunde cu o propunere adaptată stilului tău.</p>',
    cta_text: 'Cere ofertă pe WhatsApp'
  };

  const { error: updateHeroError } = await supabase
    .from('kassia_page_sections')
    .update({ content: newContent })
    .eq('id', heroSec.id);

  if (updateHeroError) {
    console.error('Error updating hero section:', updateHeroError);
  } else {
    console.log('Updated hero section.');
  }

  console.log('Done!');
}

run();
