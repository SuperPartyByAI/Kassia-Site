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
  const faqs = await getAll('kassia_faqs');

  // 1. DB status
  const pub = pages.filter(p => p.status === 'published').length;
  const draft = pages.filter(p => p.status === 'draft').length;
  const idx = pages.filter(p => p.index_status === 'index').length;
  const noidx = pages.filter(p => p.index_status === 'noindex').length;
  const sitemap = pages.filter(p => p.include_in_sitemap === true).length;
  
  // 2. Parent
  const missingParent = pages.filter(p => ['service', 'event', 'location', 'satellite', 'blog'].includes(p.page_type) && !p.parent_page_id);
  
  // 3. Sections
  const pageSecs = new Map();
  sections.forEach(s => {
    if (!pageSecs.has(s.page_id)) pageSecs.set(s.page_id, []);
    pageSecs.get(s.page_id).push(s.section_type);
  });
  
  const noSecPages = pages.filter(p => !pageSecs.has(p.id));
  const blogs = pages.filter(p => p.page_type === 'blog' || p.path.startsWith('/blog/')); 
  
  const noSecBlogs = blogs.filter(p => !pageSecs.has(p.id));
  const not9Blogs = blogs.filter(p => pageSecs.has(p.id) && pageSecs.get(p.id).length !== 9);
  
  let duplicateTypes = 0;
  pageSecs.forEach((types, pid) => {
    if (new Set(types).size !== types.length) duplicateTypes++;
  });
  
  // 4. Content safety
  let draftFaq = 0;
  faqs.forEach(f => {
    if (f.question?.includes('Draft FAQ')) draftFaq++;
  });
  
  let placeholder = 0;
  let adauga = 0;
  let emptyImg = 0;
  
  sections.forEach(s => {
    let c = s.content;
    if (typeof c === 'string') {
        try { c = JSON.parse(c); } catch(e){}
    }
    if (c) {
        if (typeof c.body === 'string') {
            if (c.body.includes('Placeholder')) placeholder++;
            if (c.body.includes('Adauga continut aici')) adauga++;
        }
        if (c.image_url === '') emptyImg++;
    }
  });

  // 5. Links
  let brokenLinks = 0;
  let dupLinks = 0;
  const linkPairs = new Set();
  
  links.forEach(l => {
    if (!pages.find(p => p.id === l.target_page_id)) brokenLinks++;
    const pair = `${l.source_page_id}-${l.target_page_id}`;
    if (linkPairs.has(pair)) dupLinks++;
    linkPairs.add(pair);
  });
  
  const contactPage = pages.find(p => p.path === '/contact/');
  let missingContact = 0;
  let orphanCommercial = 0;
  
  const incomingLinks = new Map();
  links.forEach(l => {
    if (!incomingLinks.has(l.target_page_id)) incomingLinks.set(l.target_page_id, []);
    incomingLinks.get(l.target_page_id).push(l.source_page_id);
  });
  
  pages.forEach(p => {
    const isCommercial = ['service', 'service_pillar', 'event', 'event_pillar', 'location', 'location_pillar'].includes(p.page_type);
    if (isCommercial) {
      if (contactPage) {
        const hasContact = links.some(l => l.source_page_id === p.id && l.target_page_id === contactPage.id);
        if (!hasContact) missingContact++;
      }
      const inc = incomingLinks.get(p.id) || [];
      if (inc.length === 0 && p.path !== '/') orphanCommercial++;
    }
  });

  console.log(`[RAPORT]`);
  console.log(`kassia_pages total: ${pages.length}`);
  console.log(`published pages: ${pub}`);
  console.log(`draft pages: ${draft}`);
  console.log(`index pages: ${idx}`);
  console.log(`noindex pages: ${noidx}`);
  console.log(`include_in_sitemap=true: ${sitemap}`);
  console.log(`parent_page_id missing: ${missingParent.length}`);
  console.log(`pages without sections: ${noSecPages.length}`);
  console.log(`blog pages without sections: ${noSecBlogs.length}`);
  console.log(`blog pages with 9 sections: ${blogs.length - not9Blogs.length - noSecBlogs.length}/${blogs.length}`);
  console.log(`duplicate section types per page: ${duplicateTypes}`);
  console.log(`Draft FAQ count: ${draftFaq}`);
  console.log(`Placeholder count: ${placeholder}`);
  console.log(`Adauga continut count: ${adauga}`);
  console.log(`empty image url count: ${emptyImg}`);
  console.log(`broken internal links: ${brokenLinks}`);
  console.log(`duplicate internal links: ${dupLinks}`);
  console.log(`commercial satellite orphans: ${orphanCommercial}`);
  console.log(`commercial pages missing contact link: ${missingContact}`);
}
run();
