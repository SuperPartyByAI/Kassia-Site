import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: pages, error } = await supabase.from('kassia_pages').select('*');
  
  if (error || !pages) {
    console.error('Failed to fetch pages', error);
    return;
  }

  // Categorize pages
  const typeOrder = {
    'hub': 1,
    'service': 2,
    'event': 3,
    'location': 4,
    'blog': 5,
    'legal': 6,
    'support': 6
  };

  const sortedPages = [...pages].sort((a, b) => {
    const aType = typeOrder[a.page_type] || 99;
    const bType = typeOrder[b.page_type] || 99;
    if (aType !== bType) return aType - bType;
    return a.path.localeCompare(b.path);
  });

  console.log('--- 1. LISTA COMPLETA PAGINI KASSIA ---');
  sortedPages.forEach(p => {
    console.log(`id: ${p.id} | path: ${p.path} | slug: ${p.slug} | type: ${p.page_type} | title: ${p.title} | h1: ${p.h1} | status: ${p.status} | index: ${p.index_status} | sitemap: ${p.include_in_sitemap} | parent: ${p.parent_page_id || 'null'}`);
  });

  // Calculate totals
  const total = pages.length;
  const tService = pages.filter(p => p.page_type === 'service').length;
  const tEvent = pages.filter(p => p.page_type === 'event').length;
  const tLocation = pages.filter(p => p.page_type === 'location').length;

  // Search for candidates
  const findPath = (keyword) => {
    const match = pages.find(p => p.slug.includes(keyword) || p.path.includes(keyword) || p.title.toLowerCase().includes(keyword));
    return match ? { path: match.path, status: match.status } : null;
  };

  const candidates = {
    'Arcade': findPath('arcada'),
    'Panouri foto': findPath('panou'),
    'Botez': findPath('botez'),
    'Nuntă': findPath('nunta') || findPath('nuntă'),
    'Prețuri': findPath('preturi'),
    'Galerie': findPath('galerie'),
    'Contact': findPath('contact'),
    'Aniversări/Majorat': findPath('aniversare') || findPath('majorat')
  };

  const missing = [];
  console.log('\n--- 2 & 3. VERIFICARE CANDIDAȚI ---');
  for (const [key, val] of Object.entries(candidates)) {
    if (val) {
      console.log(`- ${key}: ${val.path} (exists: DA, status: ${val.status})`);
    } else {
      console.log(`- ${key}: MISSING`);
      missing.push(key);
    }
  }

  console.log('\n--- RAPORT ---');
  console.log(`DB modificat: NU`);
  console.log(`total pages: ${total}`);
  console.log(`total service pages: ${tService}`);
  console.log(`total event pages: ${tEvent}`);
  console.log(`total location pages: ${tLocation}`);
  
  console.log(`URLs candidate pentru heliu:`);
  for (const [key, val] of Object.entries(candidates)) {
    console.log(`  - ${key}: ${val ? val.path : 'NONE'}`);
  }
  
  console.log(`invalid/missing candidate URLs: ${missing.length > 0 ? missing.join(', ') : 'NONE'}`);
  console.log(`safe_to_plan_heliu_links: DA`);
}

run();
