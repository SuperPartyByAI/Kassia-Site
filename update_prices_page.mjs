import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Updating /preturi-decoratiuni-baloane/ SEO and Content...');

  const { data: page, error: pageError } = await supabase
    .from('kassia_pages')
    .upsert({
      title: 'Prețuri Decorațiuni',
      slug: 'preturi-decoratiuni-baloane',
      path: '/preturi-decoratiuni-baloane/',
      page_type: 'default',
      h1: 'Prețuri Decorațiuni cu Baloane București și Ilfov | Kassia Events',
      meta_title: 'Prețuri Decorațiuni Baloane București și Ilfov | Oferte Kassia',
      meta_description: 'Descoperă ofertele și prețurile pentru decorațiuni cu baloane în București și Ilfov. Pachete personalizate, panouri foto și arcade organice. Cere o estimare!',
      status: 'draft',
      index_status: 'noindex',
      include_in_sitemap: false
    }, { onConflict: 'slug' })
    .select('id')
    .single();

  if (pageError || !page) {
    console.error('Error with page:', pageError);
    return;
  }
  
  await supabase.from('kassia_page_sections').delete().eq('page_id', page.id);

  await supabase.from('kassia_page_sections').insert({
    page_id: page.id,
    section_type: 'hero',
    order_index: 10,
    heading: 'Prețuri și Pachete Decorațiuni cu Baloane',
    content: {
      body: '<p>La Kassia Events știm că fiecare eveniment este unic, de aceea îți oferim flexibilitate totală. Prețurile noastre sunt calculate în funcție de complexitatea decorului, volumul de baloane necesar și distanța de deplasare (București și Ilfov). Mai jos găsești estimări de pornire orientative pentru cele mai căutate servicii.</p>',
      cta_text: 'Cere ofertă personalizată',
      cta_url: 'https://wa.me/40768098268',
      image_url: ''
    }
  });

  await supabase.from('kassia_page_sections').insert({
    page_id: page.id,
    section_type: 'content',
    order_index: 20,
    heading: 'Cât costă un decor cu baloane?',
    content: {
      body: `<ul>
  <li><strong>Arcade organice din baloane:</strong> de la <strong>[XXX]</strong> lei / metru liniar</li>
  <li><strong>Panou foto (Photo Corner complet):</strong> de la <strong>[XXX]</strong> lei</li>
  <li><strong>Pachete standard Botez / Majorat:</strong> de la <strong>[XXX]</strong> lei</li>
  <li><strong>Baloane cu heliu (latex / folie):</strong> de la <strong>[XXX]</strong> lei / bucată</li>
</ul>
<p><em>* Notă: Toate prețurile includ TVA (dacă se aplică). Pentru o ofertă finală care include transportul și montajul la locația ta (București și zonele limitrofe), te rugăm să ne contactezi pe WhatsApp cu detaliile evenimentului.</em></p>`,
      image_url: ''
    }
  });

  await supabase.from('kassia_page_sections').insert({
    page_id: page.id,
    section_type: 'content',
    order_index: 30,
    heading: 'Întrebări frecvente despre prețuri',
    content: {
      body: `<h3>Ce este inclus în prețul final?</h3>
<p>În oferta personalizată pe care ți-o trimitem pe WhatsApp includem costul baloanelor, accesoriilor (dacă e cazul), manopera pentru realizarea structurii, precum și costurile logistice de transport și montaj/demontaj în București și Ilfov.</p>
<h3>Se percepe avans pentru rezervare?</h3>
<p>Da, pentru rezervarea fermă a datei evenimentului tău în calendarul nostru, percepem un avans de <strong>[XXX]%</strong>. Diferența se va achita în ziua montajului, la predarea lucrării.</p>`,
      image_url: ''
    }
  });

  console.log('Done populating /preturi-decoratiuni-baloane/ sections with placeholders!');
}

run();
