import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getAll(table) {
  let all = [];
  let from = 0;
  let to = 999;
  while (true) {
    const { data } = await supabase.from(table).select('*').range(from, to).order('id', { ascending: true });
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    from += 1000;
    to += 1000;
  }
  return all;
}

async function run() {
  const pages = await getAll('kassia_pages');
  const sections = await getAll('kassia_page_sections');
  
  const pub = pages.filter(p => p.status === 'published').length;
  const idx = pages.filter(p => p.index_status === 'index').length;
  const sitemap = pages.filter(p => p.include_in_sitemap === true).length;
  
  const pageSecs = new Map();
  sections.forEach(s => {
    if (!pageSecs.has(s.page_id)) pageSecs.set(s.page_id, []);
    pageSecs.get(s.page_id).push(s.section_type);
  });
  
  const noSecPages = pages.filter(p => !pageSecs.has(p.id)).length;
  const blogs = pages.filter(p => p.page_type === 'blog' || p.path.startsWith('/blog/'));
  const noSecBlogs = blogs.filter(p => !pageSecs.has(p.id)).length;
  
  let dupTypes = 0;
  pageSecs.forEach((types) => {
    if (new Set(types).size !== types.length) dupTypes++;
  });
  
  const batch1 = [
    '/contact/',
    '/preturi-decoratiuni-baloane/',
    '/decoratiuni-baloane-bucuresti/',
    '/arcada-baloane-bucuresti/',
    '/baloane-heliu-bucuresti/',
    '/panou-foto-baloane-bucuresti/',
    '/decoratiuni-baloane-botez-bucuresti/',
    '/decoratiuni-baloane-nunta-bucuresti/',
    '/galerie/',
    '/intrebari-frecvente/'
  ];
  
  console.log(`=== TASK 1 ===`);
  console.log(`kassia_pages total: ${pages.length}`);
  console.log(`kassia_page_sections total: ${sections.length}`);
  console.log(`published pages: ${pub}`);
  console.log(`index pages: ${idx}`);
  console.log(`include_in_sitemap=true: ${sitemap}`);
  console.log(`pages without sections: ${noSecPages}`);
  console.log(`blog pages without sections: ${noSecBlogs}`);
  console.log(`duplicate section_type per page: ${dupTypes}`);
  
  console.log(`\n=== BATCH 1 STATUS ===`);
  batch1.forEach(path => {
    const p = pages.find(pg => pg.path === path);
    if (p) {
      const pSecs = pageSecs.get(p.id) || [];
      console.log(`${path}: ${pSecs.length} sections (${pSecs.length > 0 ? 'OK' : 'MISSING REQUIRED SECTIONS'})`);
    } else {
      console.log(`${path}: PAGE MISSING IN DB`);
    }
  });
}
run();
