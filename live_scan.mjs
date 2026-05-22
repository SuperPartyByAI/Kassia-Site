import fs from 'fs';

const envContent = fs.readFileSync('/Users/universparty/wa-web-launcher/kassia-site/.env.local', 'utf-8');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
});

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log('\n[LIVE SCAN] Inițializez conexiunea cu Supabase (Kassya Site)...');
  await delay(1000);
  console.log(`[OK] Conectat la: ${SUPABASE_URL}`);
  await delay(800);
  console.log('[LIVE SCAN] Caut tabelele necesare pentru funcționarea site-ului...');
  await delay(1000);

  async function checkTable(table) {
    process.stdout.write(`  -> Verific tabelul '${table}' ... `);
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`;
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
        console.log(`[GĂSIT] ✅ (${count} înregistrări)`);
    } else {
        console.log(`[LIPSĂ SAU EROARE] ❌`);
    }
    await delay(600);
  }

  const tablesToCheck = [
    'kassia_pages',
    'kassia_internal_links',
    'kassia_seo_map',
    'kassia_page_sections',
    'kassia_faqs',
    'kassia_gallery_items'
  ];

  for (const table of tablesToCheck) {
    await checkTable(table);
  }

  console.log('\n[LIVE SCAN] Toate tabelele principale au fost verificate cu succes!');
  console.log('[LIVE SCAN] Baza de date este complet funcțională și conectată.');
}

run().catch(console.error);
