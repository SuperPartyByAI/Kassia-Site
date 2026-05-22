import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getAll(table) {
  let all = [];
  let from = 0;
  let to = 999;
  while (true) {
    const { data } = await supabase.from(table).select('*').range(from, to);
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
  const links = await getAll('kassia_internal_links');
  const seoMap = await getAll('kassia_seo_map');
  
  console.log("=== 1. Duplicate Section Types ===");
  const pageSecs = new Map();
  sections.forEach(s => {
    if (!pageSecs.has(s.page_id)) pageSecs.set(s.page_id, []);
    pageSecs.get(s.page_id).push(s);
  });
  
  let duplicateCount = 0;
  pageSecs.forEach((secs, pid) => {
    const types = secs.map(s => s.section_type);
    const uniqueTypes = new Set(types);
    if (uniqueTypes.size !== types.length) {
      duplicateCount++;
      const p = pages.find(pg => pg.id === pid);
      if (duplicateCount <= 3) {
        const counts = {};
        types.forEach(t => counts[t] = (counts[t] || 0) + 1);
        const dups = Object.keys(counts).filter(k => counts[k] > 1);
        console.log(`Page ${p?.path} has duplicates: ${dups.join(', ')}`);
      }
    }
  });
  console.log(`Total pages with duplicate sections: ${duplicateCount}`);
  
  console.log("\n=== 3. Internal Link Anchors ===");
  const badAnchors = ['click aici', 'vezi mai mult', 'detalii', 'aici', 'citeste mai mult'];
  const suspiciousLinks = links.filter(l => badAnchors.includes(l.anchor_text?.toLowerCase().trim()));
  console.log(`Suspicious anchors found: ${suspiciousLinks.length}`);
  if (suspiciousLinks.length > 0) {
    suspiciousLinks.slice(0, 3).forEach(l => console.log(`  - ${l.anchor_text} (from ${l.source_page_id} to ${l.target_page_id})`));
  }
  
  console.log("\n=== 4. Hub Pages ===");
  const hubs = ['/decoratiuni-baloane-bucuresti/', '/blog/', '/galerie/', '/preturi-decoratiuni-baloane/', '/intrebari-frecvente/'];
  hubs.forEach(h => {
    const exists = pages.find(p => p.path === h);
    console.log(`Hub ${h}: ${exists ? 'EXISTS' : 'MISSING'} (Type: ${exists?.page_type})`);
  });
  
  console.log("\n=== 5. SEO Map Columns ===");
  if (seoMap.length > 0) {
    console.log("Columns:", Object.keys(seoMap[0]).join(', '));
  }
}
run();
