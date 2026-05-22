import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync('/Users/universparty/wa-web-launcher/kassia-site/.env.local', 'utf-8');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
});

async function run() {
  async function queryRest(table, params = '') {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Range-Unit': 'items',
        'Range': '0-0',
        'Prefer': 'count=exact'
      }
    });
    const contentRange = res.headers.get('content-range');
    let count = 0;
    if (contentRange) {
        count = parseInt(contentRange.split('/')[1]);
    }
    const data = await res.json();
    return { count, data };
  }

  const pages = await queryRest('kassia_pages', 'select=*&limit=1');
  const links = await queryRest('kassia_internal_links', 'select=*&limit=1');
  const seoMap = await queryRest('kassia_seo_map', 'select=*&limit=1');
  const published = await queryRest('kassia_pages', 'select=*&status=eq.published&limit=1');
  const indexed = await queryRest('kassia_pages', 'select=*&index_status=eq.index&limit=1');
  const sitemapped = await queryRest('kassia_pages', 'select=*&include_in_sitemap=eq.true&limit=1');

  let output = '';
  output += `kassia_pages total: ${pages.count}\n`;
  output += `kassia_internal_links total: ${links.count}\n`;
  output += `kassia_seo_map total: ${seoMap.count}\n`;
  output += `published pages: ${published.count}\n`;
  output += `index pages: ${indexed.count}\n`;
  output += `include_in_sitemap=true: ${sitemapped.count}\n`;

  const sections = await queryRest('kassia_page_sections', 'select=*&limit=1');
  output += '\nkassia_page_sections sample: ' + JSON.stringify(sections.data[0], null, 2) + '\n';
  output += '\nkassia_pages sample: ' + JSON.stringify(pages.data[0], null, 2) + '\n';
  
  const faqs = await queryRest('kassia_faqs', 'select=*&limit=1');
  output += '\nkassia_faqs sample: ' + JSON.stringify(faqs.data[0], null, 2) + '\n';
  
  const gallery = await queryRest('kassia_gallery_items', 'select=*&limit=1');
  output += '\nkassia_gallery_items sample: ' + JSON.stringify(gallery.data[0], null, 2) + '\n';

  fs.writeFileSync('test_output.txt', output);
}

run().catch(console.error);
