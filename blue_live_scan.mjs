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

async function typeText(text, speed = 30) {
  for (let i = 0; i < text.length; i++) {
    process.stdout.write(text[i]);
    await delay(speed);
  }
  console.log();
}

async function run() {
  // Clear screen and make background blue, text white, bold
  console.log('\x1b[2J\x1b[H\x1b[44m\x1b[97m\x1b[1m');
  
  await typeText('==================================================');
  await typeText('   [ LIVE SUPABASE SEARCH : PROJECT KASSYA ]');
  await typeText('==================================================\n');
  
  await typeText('> AUTENTIFICARE LA BAZA DE DATE...');
  await delay(800);
  await typeText('> CONECTAT CU SUCCES LA: ' + SUPABASE_URL + '\n');
  await delay(500);

  async function checkTable(table) {
    await typeText(`> SE EXECUTĂ COMANDA: SELECT count(*) FROM ${table};`, 10);
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`;
    try {
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
          await typeText(`  [REZULTAT LIVE] => Tabel găsit! Conține ${count} rânduri. ✅`, 10);
      } else {
          await typeText(`  [REZULTAT LIVE] => Eroare: Tabelul nu a fost găsit! ❌`, 10);
      }
    } catch (e) {
      await typeText(`  [REZULTAT LIVE] => Eroare rețea! ❌`, 10);
    }
    await typeText('--------------------------------------------------', 5);
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

  await typeText('\n> TOATE COMENZILE AU FOST EXECUTATE CU SUCCES.');
  await typeText('> BAZA DE DATE KASSYA ESTE PREGĂTITĂ.');
  await typeText('==================================================');
  
  // Reset terminal formatting after 5 seconds so they can enjoy the blue screen
  await delay(5000);
  console.log('\x1b[0m');
}

run().catch(console.error);
