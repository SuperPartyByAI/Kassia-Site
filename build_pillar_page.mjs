import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // 1. Update Page Metadata
  const { data: page, error: pageError } = await supabase.from('kassia_pages').update({
    h1: 'Decorațiuni cu baloane în București și Ilfov',
    title: 'Decorațiuni cu Baloane București și Ilfov | Kassia Events',
    meta_title: 'Decorațiuni cu Baloane București și Ilfov | Kassia Events',
    meta_description: 'Cauți decorațiuni cu baloane în București sau Ilfov? Kassia Events creează arcade, panouri foto și baloane cu heliu pentru botezuri, nunți, aniversări și evenimente corporate.',
    status: 'draft',
    index_status: 'noindex',
    include_in_sitemap: false,
    page_type: 'service_pillar'
  }).eq('slug', 'decoratiuni-baloane-bucuresti').select().single();

  if (!page) {
    console.error('Page not found!', pageError);
    return;
  }

  // Clear existing sections and faqs
  await supabase.from('kassia_page_sections').delete().eq('page_id', page.id);
  await supabase.from('kassia_faqs').delete().eq('page_id', page.id);

  // 2. Insert Sections
  const sectionsToInsert = [
    {
      page_id: page.id,
      section_type: 'hero',
      heading: 'Decorațiuni cu baloane în București și Ilfov',
      sort_order: 1,
      content: {
        body: '<p>Transformăm orice eveniment într-o amintire de neuitat printr-un decor spectaculos. De la arcade organice la panouri foto elegante, îți aducem magia la locația ta.</p>',
        cta_text: 'Scrie-ne pe WhatsApp',
        cta_url: 'https://wa.me/40768098268',
        image_url: '/images/home-intro.webp'
      }
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'De ce să alegi Kassia Events?',
      sort_order: 2,
      content: {
        body: '<p>Știm cât de important este evenimentul tău. De aceea, punem pe primul loc calitatea materialelor, punctualitatea și un design care să atragă toate privirile. Fie că organizezi un botez restrâns, o nuntă elegantă sau o petrecere corporate, ne adaptăm spațiului și dorințelor tale pentru un decor impecabil.</p>',
        image_url: '/images/aranjamente.webp'
      }
    },
    // Cards
    { page_id: page.id, section_type: 'service_card', heading: 'Arcade din baloane', sort_order: 3, content: { cta_text: 'Vezi detalii', cta_url: '/arcada-baloane-bucuresti/', image_url: '/images/arcade.webp' } },
    { page_id: page.id, section_type: 'service_card', heading: 'Baloane cu heliu', sort_order: 4, content: { cta_text: 'Vezi detalii', cta_url: '/baloane-heliu-bucuresti/', image_url: '/images/heliu.webp' } },
    { page_id: page.id, section_type: 'service_card', heading: 'Panouri foto', sort_order: 5, content: { cta_text: 'Vezi detalii', cta_url: '/panou-foto-baloane-bucuresti/', image_url: '/images/contact-intro.png' } },
    { page_id: page.id, section_type: 'service_card', heading: 'Decor botez', sort_order: 6, content: { cta_text: 'Vezi detalii', cta_url: '/decoratiuni-baloane-botez-bucuresti/', image_url: '/images/aranjamente.webp' } },
    { page_id: page.id, section_type: 'service_card', heading: 'Decor nuntă', sort_order: 7, content: { cta_text: 'Vezi detalii', cta_url: '/decoratiuni-baloane-nunta-bucuresti/', image_url: '/images/home-intro.webp' } },
    { page_id: page.id, section_type: 'service_card', heading: 'Prețuri', sort_order: 8, content: { cta_text: 'Vezi detalii', cta_url: '/preturi-decoratiuni-baloane/', image_url: '/images/home-pricing.webp' } },
    { page_id: page.id, section_type: 'service_card', heading: 'Galerie', sort_order: 9, content: { cta_text: 'Vezi detalii', cta_url: '/galerie/', image_url: '/images/ghirlande.webp' } },
    { page_id: page.id, section_type: 'service_card', heading: 'Contact', sort_order: 10, content: { cta_text: 'Vezi detalii', cta_url: '/contact/', image_url: '/images/contact-cta.png' } },
    
    // Additional Content Sections
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Evenimente pentru care realizăm decoruri',
      sort_order: 11,
      content: {
        body: '<p>Ne place să creăm atmosfere magice pentru orice ocazie. Decorăm cu pasiune: botezuri și tăieri de moț, nunți și cununii, petreceri de majorat, aniversări surpriză, dar și evenimente corporate, deschideri de magazine sau activări de brand. Orice tematică ai în minte, noi o transformăm în realitate.</p>'
      }
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Cum lucrăm',
      sort_order: 12,
      content: {
        body: '<p>Procesul nostru este simplu și transparent: 1. Ne contactezi și ne spui ce idee ai. 2. Îți facem o recomandare de design și îți trimitem o estimare de cost. 3. Rezervăm data evenimentului tău. 4. Venim la locație și ne ocupăm de tot montajul, la ora stabilită. Tu doar te bucuri de petrecere!</p>'
      }
    },
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Zone acoperite: București și Ilfov',
      sort_order: 13,
      content: {
        body: '<p>Ne deplasăm la locația evenimentului tău oriunde în București (toate sectoarele) și în localitățile din județul Ilfov. Dacă ai un eveniment în altă zonă limitrofă, scrie-ne și vom găsi o soluție pentru tine.</p>',
        cta_text: 'Scrie-ne pe WhatsApp',
        cta_url: 'https://wa.me/40768098268'
      }
    },
    // The CTA final
    {
      page_id: page.id,
      section_type: 'content',
      heading: 'Ai un eveniment curând?',
      sort_order: 14,
      content: {
        body: '<p>Dă-ne de veste și hai să construim un decor memorabil pentru invitații tăi. Răspundem rapid pe WhatsApp!</p>',
        cta_text: 'Scrie-ne pe WhatsApp',
        cta_url: 'https://wa.me/40768098268'
      }
    }
  ];

  await supabase.from('kassia_page_sections').insert(sectionsToInsert);

  // 3. Insert FAQs
  const faqsToInsert = [
    {
      page_id: page.id,
      question: 'Cât timp durează montajul unui decor cu baloane?',
      answer: 'Timpul de montaj variază între 1 și 3 ore, în funcție de complexitatea și dimensiunea decorului. Discutăm aceste detalii în prealabil pentru a ajunge la locație la momentul oportun.',
      sort_order: 1
    },
    {
      page_id: page.id,
      question: 'Vă ocupați și de demontarea decorului după eveniment?',
      answer: 'În general, baloanele rămân la tine! În cazul panourilor foto cu cadru metalic închiriate, stabilim de comun acord ridicarea recuzitei după terminarea petrecerii sau a doua zi.',
      sort_order: 2
    },
    {
      page_id: page.id,
      question: 'Oferiți decorațiuni și în Ilfov?',
      answer: 'Da, asigurăm transport și montaj oriunde în București și Ilfov. Costurile de transport se calculează în funcție de distanța exactă până la locație.',
      sort_order: 3
    }
  ];

  await supabase.from('kassia_faqs').insert(faqsToInsert);

  console.log('Pillar page populated successfully.');
}

run();
