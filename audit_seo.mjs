import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PAGE_TYPES = [
  'home', 'service_pillar', 'service', 'event_pillar', 'event',
  'location_pillar', 'location', 'satellite', 'blog_pillar', 'blog',
  'about', 'contact', 'legal'
];

async function run() {
  console.log("Fetching data from Supabase...");
  
  const { data: pages } = await supabase.from('kassia_pages').select('*');
  const { data: seoMap } = await supabase.from('kassia_seo_map').select('*');
  const { data: links } = await supabase.from('kassia_internal_links').select('*');
  const { data: sections } = await supabase.from('kassia_page_sections').select('*');
  
  const contactPage = pages.find(p => p.path === '/contact/');
  const contactId = contactPage ? contactPage.id : null;

  let errors = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [],
    8: [], 9: [], 10: [], 11: [], 12: [], 13: []
  };

  const pathMap = new Map();
  const keywordMap = new Map();
  const incomingLinks = new Map();
  
  links.forEach(l => {
    if (!incomingLinks.has(l.target_page_id)) incomingLinks.set(l.target_page_id, []);
    incomingLinks.get(l.target_page_id).push(l.source_page_id);
  });

  pages.forEach(p => {
    // 1. page_type corect
    if (!PAGE_TYPES.includes(p.page_type)) errors[1].push(`${p.path} has invalid type: ${p.page_type}`);

    // 2. unic in seo_map
    const mapped = seoMap.filter(sm => sm.page_id === p.id);
    if (mapped.length === 0 && !['home', 'contact', 'about', 'legal'].includes(p.page_type)) {
      errors[2].push(`${p.path} missing from kassia_seo_map`);
    } else if (mapped.length > 1) {
      errors[2].push(`${p.path} has multiple entries in kassia_seo_map`);
    }

    if (mapped.length === 1) {
      const kw = mapped[0].main_keyword;
      if (!kw) errors[2].push(`${p.path} has empty main_keyword`);
      else {
        if (keywordMap.has(kw)) keywordMap.get(kw).push(p.path);
        else keywordMap.set(kw, [p.path]);
      }
    }

    // 3. parent corect
    if (['service', 'event', 'location', 'satellite', 'blog'].includes(p.page_type) && !p.parent_id) {
      errors[3].push(`${p.path} missing parent_id`);
    }

    // 4. sectiuni obligatorii
    const pageSections = sections.filter(s => s.page_id === p.id).map(s => s.section_type);
    if (pageSections.length === 0) {
      errors[4].push(`${p.path} has NO sections`);
    }

    // 5. comerciala are link spre contact
    const isCommercial = ['service', 'service_pillar', 'event', 'event_pillar', 'location', 'location_pillar'].includes(p.page_type);
    if (isCommercial && contactId) {
      const linksToContact = links.some(l => l.source_page_id === p.id && l.target_page_id === contactId);
      if (!linksToContact) errors[5].push(`${p.path} missing internal link to /contact/`);
    }

    // 6. satelit are link spre parent/pilon/serviciu relevant
    if (p.page_type === 'satellite') {
      const linksOut = links.filter(l => l.source_page_id === p.id);
      if (linksOut.length === 0) errors[6].push(`${p.path} (satellite) has NO outgoing internal links`);
    }

    // 7. blog trimite spre comercial
    if (p.page_type === 'blog') {
      const linksOut = links.filter(l => l.source_page_id === p.id);
      const targets = linksOut.map(l => pages.find(pg => pg.id === l.target_page_id)).filter(Boolean);
      const hasComLink = targets.some(t => ['service', 'event', 'location'].includes(t.page_type));
      if (!hasComLink) errors[7].push(`${p.path} (blog) missing link to commercial pages`);
    }

    // 8. duplicate paths
    if (pathMap.has(p.path)) pathMap.get(p.path).push(p.id);
    else pathMap.set(p.path, [p.id]);

    // 11. orphan comercial
    if (isCommercial) {
      const inc = incomingLinks.get(p.id) || [];
      if (inc.length === 0 && p.path !== '/') errors[11].push(`${p.path} is an orphan commercial page`);
    }

    // 12. canonical logic
    if (p.canonical_url) {
      if (!p.canonical_url.startsWith('http') || !p.canonical_url.includes(p.path)) {
        errors[12].push(`${p.path} has illogical canonical: ${p.canonical_url}`);
      }
    }

    // 13. sitemap/index oprite
    if (p.status === 'published' || p.index_status === 'index' || p.include_in_sitemap === true) {
      errors[13].push(`${p.path} is published or indexable`);
    }
  });

  // 8. evaluate duplicate paths
  pathMap.forEach((ids, path) => {
    if (ids.length > 1) errors[8].push(`Duplicate path: ${path}`);
  });

  // 9. evaluate duplicate keywords
  keywordMap.forEach((paths, kw) => {
    if (paths.length > 1) errors[9].push(`Duplicate keyword '${kw}' used in: ${paths.join(', ')}`);
  });

  // 10. broken internal links
  links.forEach(l => {
    if (!pages.find(p => p.id === l.target_page_id)) {
      const source = pages.find(p => p.id === l.source_page_id);
      errors[10].push(`Broken link from ${source ? source.path : l.source_page_id} to missing target ${l.target_page_id}`);
    }
  });

  console.log("\n=== AUDIT RESULTS ===");
  Object.keys(errors).forEach(k => {
    console.log(`\nRule ${k} (${errors[k].length} errors):`);
    if (errors[k].length > 0) {
      errors[k].slice(0, 5).forEach(e => console.log(`  - ${e}`));
      if (errors[k].length > 5) console.log(`  ... and ${errors[k].length - 5} more.`);
    } else {
      console.log(`  [OK] Pass`);
    }
  });
}

run();
