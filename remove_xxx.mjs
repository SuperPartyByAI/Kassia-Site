import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'preturi-decoratiuni-baloane').single();
  if (!page) return;

  // Update hero
  const { data: heroSections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id).eq('section_type', 'hero');
  if (heroSections && heroSections.length > 0) {
    await supabase.from('kassia_page_sections').update({
      content: {
        body: '<p>La Kassia Events știm că fiecare eveniment este unic, de aceea îți oferim flexibilitate totală. Prețurile noastre sunt calculate în funcție de complexitatea decorului, volumul de baloane necesar și distanța de deplasare. Mai jos găsești detalii despre cum calculăm estimările pentru cele mai căutate servicii.</p>',
        cta_text: 'Cere ofertă personalizată',
        cta_url: 'https://wa.me/40768098268',
        image_url: ''
      }
    }).eq('id', heroSections[0].id);
  }

  // Update content
  const { data: contentSections } = await supabase.from('kassia_page_sections').select('*').eq('page_id', page.id).eq('section_type', 'content');
  for (const sec of (contentSections || [])) {
    if (sec.heading === 'Cât costă un decor cu baloane?') {
      await supabase.from('kassia_page_sections').update({
        heading: 'Cum se calculează prețul unui decor cu baloane?',
        content: {
          body: `<p>Prețul unui decor cu baloane se stabilește în funcție de dimensiune, complexitate, locație, tipul baloanelor, accesoriile folosite și timpul necesar pentru montaj.</p>
<ul>
  <li><strong>Arcade organice din baloane:</strong> prețul se calculează în funcție de lungime, volum și complexitatea compoziției.</li>
  <li><strong>Panou foto cu baloane:</strong> oferta depinde de tipul panoului, dimensiune, decorul ales și accesoriile incluse.</li>
  <li><strong>Pachete pentru botez, majorat sau aniversare:</strong> costul se stabilește în funcție de temă, culori, numărul zonelor decorate și timpul de montaj.</li>
  <li><strong>Baloane cu heliu:</strong> prețul variază în funcție de tipul balonului, cantitate și modul de livrare sau montaj.</li>
</ul>
<p>Pentru o estimare corectă, trimite-ne data evenimentului, locația, tipul decorului dorit și câteva poze de inspirație.</p>`,
          image_url: ''
        }
      }).eq('id', sec.id);
    }

    if (sec.heading === 'Întrebări frecvente despre prețuri') {
      await supabase.from('kassia_page_sections').update({
        content: {
          body: `<h3>Ce este inclus în oferta finală?</h3>
<p>Oferta finală poate include baloanele, accesoriile, manopera, transportul, montajul și, unde este cazul, demontajul. Toate detaliile sunt confirmate înainte de rezervarea evenimentului.</p>
<h3>Se percepe avans pentru rezervare?</h3>
<p>Pentru rezervarea fermă a datei, poate fi necesar un avans. Condițiile exacte se confirmă în momentul ofertei, în funcție de tipul decorului, data evenimentului și complexitatea montajului.</p>`,
          image_url: ''
        }
      }).eq('id', sec.id);
    }
  }

  console.log('Prices page updated, removed [XXX]');
}

run();
