import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('id').eq('slug', 'decoratiuni-baloane-bucuresti').single();

  if (!page) {
    console.error('Page not found!');
    return;
  }

  // Insert Sections with order_index
  const sectionsToInsert = [
    {
      page_id: page.id,
      section_type: 'hero',
      heading: 'Decorațiuni cu baloane în București și Ilfov',
      order_index: 1,
      content: {
        body: '<p>Transformăm evenimentele din București și Ilfov în spații memorabile, cu decoruri din baloane create pentru poze, atmosferă și impact vizual. Realizăm arcade organice, baloane cu heliu, panouri foto și decoruri personalizate pentru botezuri, nunți, aniversări și evenimente corporate.</p>',
        cta_text: 'Scrie-ne pe WhatsApp',
        cta_url: 'https://wa.me/40768098268',
        image_url: '/images/home-intro.webp'
      }
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'De ce să alegi Kassia Events?',
      order_index: 2,
      content: {
        body: '<p>Un decor cu baloane reușit trebuie să se potrivească locului, temei și momentului. La Kassia Events, pregătim fiecare decor în funcție de locație, culori, dimensiunea spațiului și tipul evenimentului, astfel încât rezultatul final să arate bine atât în sală, cât și în fotografii.</p><p>Lucrăm cu atenție la detalii, planificăm montajul din timp și adaptăm propunerea în funcție de buget, stil și inspirațiile trimise de client.</p>'
      }
    },
    { page_id: page.id, section_type: 'service_card', heading: 'Arcade din baloane', order_index: 3, content: { cta_text: 'Vezi detalii', cta_url: '/arcada-baloane-bucuresti/', image_url: '/images/arcade.webp', is_active: true } },
    { page_id: page.id, section_type: 'service_card', heading: 'Baloane cu heliu', order_index: 4, content: { cta_text: 'Vezi detalii', cta_url: '/baloane-heliu-bucuresti/', image_url: '/images/heliu.webp', is_active: true } },
    { page_id: page.id, section_type: 'service_card', heading: 'Panouri foto', order_index: 5, content: { cta_text: 'Vezi detalii', cta_url: '/panou-foto-baloane-bucuresti/', image_url: '/images/contact-intro.png', is_active: true } },
    { page_id: page.id, section_type: 'service_card', heading: 'Decor botez', order_index: 6, content: { cta_text: 'Vezi detalii', cta_url: '/decoratiuni-baloane-botez-bucuresti/', image_url: '/images/aranjamente.webp', is_active: true } },
    { page_id: page.id, section_type: 'service_card', heading: 'Decor nuntă', order_index: 7, content: { cta_text: 'Vezi detalii', cta_url: '/decoratiuni-baloane-nunta-bucuresti/', image_url: '/images/home-intro.webp', is_active: true } },
    { page_id: page.id, section_type: 'service_card', heading: 'Prețuri', order_index: 8, content: { cta_text: 'Vezi detalii', cta_url: '/preturi-decoratiuni-baloane/', image_url: '/images/home-pricing.webp', is_active: true } },
    { page_id: page.id, section_type: 'service_card', heading: 'Galerie', order_index: 9, content: { cta_text: 'Vezi detalii', cta_url: '/galerie/', image_url: '/images/ghirlande.webp', is_active: true } },
    { page_id: page.id, section_type: 'service_card', heading: 'Contact', order_index: 10, content: { cta_text: 'Vezi detalii', cta_url: '/contact/', image_url: '/images/contact-cta.png', is_active: true } },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Servicii de decorațiuni cu baloane',
      order_index: 11,
      content: {
        body: '<p>Kassia Events realizează decoruri complete pentru evenimente, de la aranjamente simple până la zone foto complexe. Cele mai cerute servicii includ arcade organice din baloane, baloane cu heliu, panouri foto, buchete de baloane și decoruri tematice pentru evenimente private sau corporate.</p><p>Fiecare serviciu poate fi adaptat în funcție de temă, cromatică, locație și numărul de invitați.</p>'
      }
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Evenimente pentru care realizăm decoruri',
      order_index: 12,
      content: {
        body: '<p>Decorurile cu baloane sunt potrivite pentru botezuri, tăieri de moț, nunți, cununii, aniversări, majorate, petreceri pentru copii, evenimente corporate, deschideri de locații și activări de brand.</p><p>Pentru fiecare tip de eveniment, alegem volumul, culorile și elementele potrivite, astfel încât decorul să completeze atmosfera și să ofere un punct vizual puternic pentru fotografii.</p>'
      }
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Cum lucrăm',
      order_index: 13,
      content: {
        body: '<p>Procesul este simplu: ne trimiți data evenimentului, locația, tipul decorului dorit și câteva poze de inspirație. Pe baza acestor detalii, îți propunem o variantă potrivită pentru spațiul tău.</p><p>După confirmare, stabilim detaliile de montaj, intervalul de livrare și eventualele accesorii necesare. În ziua evenimentului, echipa Kassia Events se ocupă de montaj, astfel încât decorul să fie gata la timp.</p>'
      }
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Zone acoperite: București și Ilfov',
      order_index: 14,
      content: {
        body: '<p>Realizăm decorațiuni cu baloane în București și în zonele apropiate din Ilfov. Ne deplasăm la locații de evenimente, restaurante, saloane, săli private, spații corporate și locuințe.</p><p>Pentru evenimente în afara Bucureștiului, disponibilitatea și transportul se confirmă în funcție de distanță, program și complexitatea decorului.</p>',
        cta_text: 'Scrie-ne pe WhatsApp',
        cta_url: 'https://wa.me/40768098268'
      }
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Hai să discutăm despre decorul evenimentului tău',
      order_index: 15,
      content: {
        body: '<p>Spune-ne ce eveniment pregătești, unde are loc și ce stil de decor îți dorești. Îți răspundem pe WhatsApp cu recomandări clare pentru un decor cu baloane potrivit locației și bugetului tău.</p>',
        cta_text: 'Scrie-ne pe WhatsApp',
        cta_url: 'https://wa.me/40768098268'
      }
    }
  ];

  const { error } = await supabase.from('kassia_page_sections').insert(sectionsToInsert);

  if (error) {
    console.error('Error inserting sections:', error);
  } else {
    console.log('Sections inserted successfully with order_index.');
  }
}

run();
