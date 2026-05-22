import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page, error: pageErr } = await supabase
    .from('kassia_pages')
    .select('id')
    .eq('path', '/')
    .single();

  if (pageErr) {
    console.error('Error finding home page:', pageErr);
    return;
  }

  const pageId = page.id;
  console.log('Homepage ID:', pageId);

  const sections = [
    {
      page_id: pageId,
      section_type: 'content',
      order_index: 10,
      heading: 'Arcade Baloane',
      content: {
        subheading: 'Intrarea Perfectă pentru Orice Eveniment',
        body: '<p>Întâmpină-ți invitații cu un decor spectaculos! Arcadele noastre din baloane sunt construite personalizat pentru a se potrivi cu tematica evenimentului tău, fie că este vorba despre o nuntă, un botez sau o petrecere corporate.</p>',
        cta_text: 'Află Detalii',
        cta_url: '/arcada-baloane-bucuresti/',
        is_active: true
      }
    },
    {
      page_id: pageId,
      section_type: 'content',
      order_index: 20,
      heading: 'Ghirlande Baloane',
      content: {
        subheading: 'Eleganță Organică și Design Modern',
        body: '<p>Ghirlandele organice sunt cel mai cerut trend al momentului! Le putem monta pe panouri foto, deasupra meselor de candy bar sau pentru a încadra zonele speciale. Culori pastelate, vibrante sau elegante - alegerea este a ta.</p>',
        cta_text: 'Află Detalii',
        cta_url: '/ghirlande-baloane-bucuresti/',
        is_active: true
      }
    },
    {
      page_id: pageId,
      section_type: 'content',
      order_index: 30,
      heading: 'Baloane cu Heliu',
      content: {
        subheading: 'Atmosferă Magică la Înălțime',
        body: '<p>Nimic nu aduce mai multă bucurie și magie la o petrecere decât zeci de baloane plutitoare. Perfecte pentru a decora tavanul, a fi oferite invitaților sau pentru a crea buchete impresionante lângă masa principală.</p>',
        cta_text: 'Află Detalii',
        cta_url: '/baloane-heliu-bucuresti/',
        is_active: true
      }
    },
    {
      page_id: pageId,
      section_type: 'content',
      order_index: 40,
      heading: 'Aranjamente de Masă',
      content: {
        subheading: 'Centrul Atenției pentru Fiecare Masă',
        body: '<p>Fiecare detaliu contează! Aranjamentele de masă din baloane sunt o alternativă modernă, prietenoasă cu bugetul și extrem de vizuală față de clasicele flori. Personalizăm culorile exact pe stilul petrecerii tale.</p>',
        cta_text: 'Află Detalii',
        cta_url: '/aranjamente-baloane-bucuresti/',
        is_active: true
      }
    }
  ];

  const { error: insErr } = await supabase.from('kassia_page_sections').insert(sections);
  if (insErr) {
    console.error('Error inserting:', insErr);
  } else {
    console.log('Successfully inserted 4 sections!');
  }
}

run();
