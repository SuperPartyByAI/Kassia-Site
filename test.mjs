import fs from 'fs';
const content = fs.readFileSync('.env.local', 'utf-8');
const env = {};
content.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
});
const SUPABASE_URL = env.PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

fetch(`${SUPABASE_URL}/rest/v1/kassia_pages?select=id`, {
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`
  }
}).then(r => r.json()).then(d => console.log(d.length)).catch(console.error);
