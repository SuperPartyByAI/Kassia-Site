import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase.from('kassia_pages').select('*').eq('slug', 'arcada-baloane-bucuresti').single();
  
  if (!page) {
    console.error('Page not found!');
    return;
  }

  console.log('--- Cleaning up existing data safely ---');
  await supabase.from('kassia_page_sections').delete().eq('page_id', page.id);
  await supabase.from('kassia_faqs').delete().eq('page_id', page.id);

  console.log('--- Updating Meta/H1 ---');
  await supabase.from('kassia_pages').update({
    h1: 'Arcade din baloane în București și Ilfov',
    meta_title: 'Arcade din Baloane București și Ilfov | Kassia Events',
    meta_description: 'Arcade din baloane organice pentru evenimente în București și Ilfov. Decoruri pentru intrări, candy bar, panouri foto și zone de întâmpinare, cu montaj la locație.'
  }).eq('id', page.id);

  const sectionsToInsert = [
    {
      page_id: page.id,
      section_type: 'hero',
      heading: 'Arcade din baloane pentru evenimente memorabile',
      content: {
        body: '<p>Realizăm arcade din baloane pentru evenimente în București și Ilfov, potrivite pentru intrări, candy bar, panouri foto, mese festive și zone de întâmpinare. Decorul poate fi adaptat în funcție de temă, culori, locație și stilul evenimentului.</p>',
        cta_text: 'Scrie-ne pe WhatsApp',
        cta_url: 'https://wa.me/40768098268',
        image_url: '/images/arcade.webp'
      },
      order_index: 1
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Ce este o arcadă din baloane organică?',
      content: {
        body: '<p>Spre deosebire de arcadele clasice, o arcadă organică folosește baloane de dimensiuni diferite (de la foarte mici la jumbo), combinate pentru a crea un efect natural, fluid și luxuriant. Putem adăuga flori, frunze, baloane cromate sau personalizate pentru a se potrivi perfect cu tematica evenimentului tău.</p>'
      },
      order_index: 2
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Tipuri de arcade din baloane',
      content: {
        body: '<p>În funcție de spațiu și de efectul vizual dorit, putem realiza arcade organice complete, semi-arcade, ghirlande de baloane, arcade pentru candy bar, arcade pentru panouri foto sau decoruri asimetrice pentru intrări și zone de întâmpinare.</p><p>Fiecare variantă poate fi personalizată prin culori, volume, baloane cromate, accente florale sau elemente tematice.</p>'
      },
      order_index: 3
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Unde se potrivește o arcadă din baloane?',
      content: {
        body: '<p>O arcadă din baloane se potrivește foarte bine la intrarea în restaurant sau salon, în zona de candy bar, lângă un panou foto, în spatele mesei principale sau în zona în care invitații fac fotografii.</p><p>Este o alegere potrivită pentru botezuri, nunți, cununii, aniversări, majorate, petreceri pentru copii, evenimente corporate și deschideri de locații.</p>'
      },
      order_index: 4
    },
    {
      page_id: page.id,
      section_type: 'service_card',
      heading: 'Baloane cu heliu',
      content: {
        subheading: 'Completează decorul cu buchete, cifre și baloane plutitoare.',
        cta_text: 'Vezi detalii',
        cta_url: '/baloane-heliu-bucuresti/',
        image_url: '/images/heliu.webp'
      },
      order_index: 5
    },
    {
      page_id: page.id,
      section_type: 'service_card',
      heading: 'Panouri foto',
      content: {
        subheading: 'Creează o zonă foto completă cu fundal și decor din baloane.',
        cta_text: 'Vezi detalii',
        cta_url: '/panou-foto-baloane-bucuresti/',
        image_url: '/images/contact-intro.png'
      },
      order_index: 6
    },
    {
      page_id: page.id,
      section_type: 'service_card',
      heading: 'Prețuri',
      content: {
        subheading: 'Vezi cum se calculează costul pentru arcade și decoruri cu baloane.',
        cta_text: 'Vezi detalii',
        cta_url: '/preturi-decoratiuni-baloane/',
        image_url: '/images/home-pricing.webp'
      },
      order_index: 7
    },
    {
      page_id: page.id,
      section_type: 'service_card',
      heading: 'Galerie',
      content: {
        subheading: 'Inspiră-te din decoruri și arcade realizate pentru evenimente.',
        cta_text: 'Vezi detalii',
        cta_url: '/galerie/',
        image_url: '/images/ghirlande.webp'
      },
      order_index: 8
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Montaj și structură de susținere',
      content: {
        body: '<p>Pentru arcadele mai mari sau pentru decorurile care trebuie să stea stabil mai multe ore, putem folosi cadre metalice, suporți sau structuri dedicate, în funcție de locație și de tipul evenimentului.</p><p>Detaliile despre montaj, transport, structură și eventuală recuperare a suporturilor se stabilesc înainte de eveniment, astfel încât decorul să fie sigur, stabil și pregătit la timp.</p>'
      },
      order_index: 9
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Hai să discutăm despre decorul tău',
      content: {
        body: '<p>Ai nevoie de o arcadă spectaculoasă? Spune-ne data, locația și trimite-ne eventuale poze de inspirație, iar noi îți răspundem cu recomandări potrivite pentru spațiul și stilul evenimentului.</p>',
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
      question: 'Cât rezistă o arcadă din baloane?',
      answer: 'În interior, o arcadă din baloane poate rezista foarte bine pe durata evenimentului și, în multe cazuri, chiar mai mult. În exterior, rezistența depinde de soare, vânt, temperatură și amplasare, motiv pentru care alegem soluția de montaj în funcție de locație.',
      order_index: 1
    },
    {
      page_id: page.id,
      question: 'Aveți și semi-arcade sau ghirlande de baloane?',
      answer: 'Da. Putem realiza arcade complete, semi-arcade, ghirlande organice și decoruri asimetrice pentru panouri foto, candy bar, intrări sau zone de întâmpinare.',
      order_index: 2
    },
    {
      page_id: page.id,
      question: 'Trebuie returnată structura folosită pentru arcadă?',
      answer: 'Dacă decorul folosește cadre, suporți sau structuri închiriate, acestea se recuperează conform detaliilor stabilite înainte de eveniment. Detaliile despre ce rămâne la locație și ce trebuie recuperat se stabilesc clar înainte de eveniment.',
      order_index: 3
    },
    {
      page_id: page.id,
      question: 'Cu cât timp înainte trebuie să vă contactez pentru o arcadă?',
      answer: 'Recomandăm să ne contactezi cât mai devreme, mai ales pentru weekenduri și perioade aglomerate. Dacă evenimentul este aproape, ne poți scrie pe WhatsApp și verificăm rapid disponibilitatea.',
      order_index: 4
    }
  ];

  await supabase.from('kassia_faqs').insert(faqsToInsert);

  console.log('--- Database populated successfully ---');
}

run();
