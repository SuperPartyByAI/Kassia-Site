import fs from 'fs';

// Citim credențialele din mediul proiectului
const envContent = fs.readFileSync('/Users/universparty/wa-web-launcher/kassia-site/.env.local', 'utf-8');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('PUBLIC_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) SUPABASE_KEY = line.split('=')[1].trim();
});

async function fetchRealData(table) {
  console.log(`\n--- INTEROGARE SUPABASE: SELECT * FROM ${table} LIMIT 1 ---`);
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`;
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  
  if (!res.ok) {
    console.log(`[EROARE BAZĂ DE DATE] Nu s-a putut accesa tabelul ${table}`);
    return;
  }

  const data = await res.json();
  if (data.length > 0) {
    console.log(`[SUCCES] Date reale extrase din ${table}:`);
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log(`[SUCCES] Tabelul ${table} există, dar este gol.`);
  }
}

async function run() {
  console.log('Conectare la Supabase Kassya via API oficial...\n');
  const tables = ['kassia_pages', 'kassia_internal_links', 'kassia_seo_map', 'kassia_page_sections'];
  
  for (const t of tables) {
    await fetchRealData(t);
  }
  
  console.log('\n--- Interogare finalizată! ---');
}

run();
