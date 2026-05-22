import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', 'baloane-heliu-bucuresti').single();
  
  if (!page) {
    console.error('Page not found!');
    return;
  }

  console.log('--- Cleaning up existing data safely ---');
  await supabase.from('kassia_page_sections').delete().eq('page_id', page.id);
  await supabase.from('kassia_faqs').delete().eq('page_id', page.id);

  console.log('--- Updating Meta/H1 ---');
  await supabase.from('kassia_pages').update({
    h1: 'Baloane cu heliu în București și Ilfov',
    meta_title: 'Baloane cu Heliu București și Ilfov | Kassia Events',
    meta_description: 'Baloane cu heliu pentru aniversări, botezuri și evenimente în București și Ilfov. Buchete, cifre, litere și baloane folie, cu recomandări în funcție de eveniment.',
    status: 'draft',
    index_status: 'noindex',
    include_in_sitemap: false
  }).eq('id', page.id);

  const sectionsToInsert = [
    {
      page_id: page.id,
      section_type: 'hero',
      heading: 'Baloane cu heliu pentru evenimente în București și Ilfov',
      content: {
        body: '<p>Fie că pregătești o aniversare surpriză, un decor de botez complet, o petrecere de majorat sau un eveniment corporate de amploare, baloanele cu heliu adaugă un impact vizual imediat. Alegem paleta cromatică potrivită și adaptăm decorul pentru a scoate în evidență stilul unic al evenimentului tău.</p>',
        cta_text: 'Scrie-ne pe WhatsApp',
        cta_url: 'https://wa.me/40768098268',
        image_url: '/images/heliu.webp' // fallback placeholder for hero
      },
      order_index: 1
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Tipuri de baloane cu heliu',
      content: {
        body: '<p>Dispunem de o colecție diversificată pentru a răspunde oricărei tematici. De la elegantele baloane din latex în nuanțe pastel sau cromate, ideale pentru buchete voluminoase, până la cifre supradimensionate, litere și baloane din folie în forme spectaculoase, integrăm fiecare element pentru un decor fluid și captivant.</p>'
      },
      order_index: 2
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Cât rezistă baloanele cu heliu?',
      content: {
        body: '<p>Durata de zbor a baloanelor umflate variază în funcție de material, temperatură și condițiile de ambient. Baloanele din latex au un timp natural de plutire mai scurt, însă putem aplica un tratament profesional intern pentru a-l prelungi semnificativ acolo unde este posibil. Baloanele din folie sunt mult mai durabile. Discutăm aceste detalii de la început pentru a ne asigura că decorul arată impecabil la sosirea invitaților.</p>'
      },
      order_index: 3
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Unde se potrivesc baloanele cu heliu?',
      content: {
        body: '<p>Buchetele de baloane cu heliu sunt extrem de versatile. Sunt perfecte ca aranjamente de masă, pentru flancarea intrării principale, încadrând o zonă de candy bar spectaculoasă sau un panou foto. De asemenea, pot fi lăsate libere pe tavan pentru un efect vizual imersiv care schimbă complet atmosfera oricărei săli de evenimente.</p>'
      },
      order_index: 4
    },
    {
      page_id: page.id,
      section_type: 'service_card',
      heading: 'Arcade din baloane',
      content: {
        subheading: 'Completează decorul cu o arcadă organică pentru intrare sau zonă foto.',
        cta_text: 'Vezi detalii',
        cta_url: '/arcada-baloane-bucuresti/',
        image_url: '/images/arcade.webp'
      },
      order_index: 5
    },
    {
      page_id: page.id,
      section_type: 'service_card',
      heading: 'Panou foto baloane',
      content: {
        subheading: 'Creează un fundal foto complet pentru invitați și poze memorabile.',
        cta_text: 'Vezi detalii',
        cta_url: '/panou-foto-baloane-bucuresti/',
        image_url: '/images/contact-intro.png'
      },
      order_index: 6
    },
    {
      page_id: page.id,
      section_type: 'service_card',
      heading: 'Decor botez',
      content: {
        subheading: 'Decor complet pentru botez, tăiere de moț și petreceri de copii.',
        cta_text: 'Vezi detalii',
        cta_url: '/decoratiuni-baloane-botez-bucuresti/',
        image_url: '/images/home-pricing.webp'
      },
      order_index: 7
    },
    {
      page_id: page.id,
      section_type: 'service_card',
      heading: 'Baloane aniversare',
      content: {
        subheading: 'Buchete, cifre și baloane folie pentru aniversări și surprize.',
        cta_text: 'Vezi detalii',
        cta_url: '/baloane-heliu-aniversare-bucuresti/',
        image_url: '/images/ghirlande.webp'
      },
      order_index: 8
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Livrare și montaj în București și Ilfov',
      content: {
        body: '<p>Logistica decorurilor este esențială. Baloanele cu heliu umflate necesită spațiu și manipulare atentă pentru a ajunge în siguranță. Oferim opțiuni personalizate de livrare și montaj în funcție de volumul comenzii tale și distanța locației din București sau Ilfov. Ne asigurăm că aranjamentele ajung intacte și sunt poziționate perfect.</p>'
      },
      order_index: 9
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Hai să pregătim baloanele pentru evenimentul tău',
      content: {
        body: '<p>Nu lăsa decorul pe ultima sută de metri. Împreună putem alege cele mai frumoase nuanțe, texturi și dimensiuni pentru buchetele tale de baloane. Contactează-ne acum pentru a contura soluția ideală și a bloca data evenimentului tău.</p>',
        cta_text: 'Scrie-ne pe WhatsApp',
        cta_url: 'https://wa.me/40768098268'
      },
      order_index: 10
    }
  ];

  await supabase.from('kassia_page_sections').insert(sectionsToInsert);

  const faqsToInsert = [
    {
      page_id: page.id,
      question: 'Cât timp plutesc baloanele cu heliu?',
      answer: 'Durata de plutire depinde de tipul balonului, material, dimensiune, temperatură și condițiile de păstrare. Baloanele din folie rezistă de obicei mai mult decât cele din latex, iar pentru latex se pot folosi tratamente speciale acolo unde este potrivit.',
      order_index: 1
    },
    {
      page_id: page.id,
      question: 'Livrați baloane cu heliu în București și Ilfov?',
      answer: 'În funcție de comandă, disponibilitate și volum, putem stabili livrare sau montaj în București și în zone apropiate din Ilfov. Baloanele umflate ocupă mult spațiu, de aceea discutăm detaliile înainte.',
      order_index: 2
    },
    {
      page_id: page.id,
      question: 'Există o comandă minimă pentru baloane cu heliu?',
      answer: 'Comanda minimă poate varia în funcție de tipul baloanelor, volum, distanță și disponibilitate. Cel mai simplu este să ne scrii pe WhatsApp cu data evenimentului și ce ai nevoie, iar noi îți spunem ce variantă se potrivește.',
      order_index: 3
    },
    {
      page_id: page.id,
      question: 'Pot comanda cifre, litere sau baloane personalizate?',
      answer: 'Da. Putem include cifre, litere, baloane folie, baloane latex, nuanțe pastel, cromate sau combinații personalizate, în funcție de stoc, temă și stilul evenimentului.',
      order_index: 4
    }
  ];

  await supabase.from('kassia_faqs').insert(faqsToInsert);

  console.log('--- Database populated successfully ---');
}

run();
