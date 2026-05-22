import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: page } = await supabase
    .from('kassia_pages')
    .select('id')
    .eq('path', '/')
    .single();

  const sectionsData = {
    intro: {
      heading: 'De ce să alegi Kassia Events?',
      content: {
        subheading: 'Expertiză & Eleganță',
        body: '<p>Cu o experiență bogată în organizarea și decorarea evenimentelor de top din București și Ilfov, transformăm orice locație într-o poveste vizuală. Folosim doar baloane premium, care își mențin culoarea și forma impecabilă pe toată durata petrecerii, iar atenția noastră la detalii face diferența între un decor obișnuit și unul spectaculos.</p>',
        image_url: '/images/home-intro.png',
        cta_text: 'Vezi Galeria',
        cta_url: '/galerie/',
        is_active: true
      }
    },
    pricing: {
      heading: 'Decoruri Personalizate Pentru Orice Buget',
      content: {
        subheading: 'Design Unic, La Comandă',
        body: '<p>Înțelegem că fiecare eveniment este absolut unic – la fel trebuie să fie și decorațiunile. Indiferent că planifici o petrecere restrânsă de botez sau un eveniment corporate impresionant, echipa Kassia creează aranjamente și pachete adaptate stilului, locației și bugetului tău, fără a face vreun compromis la calitate.</p>',
        image_url: '/images/home-pricing.png',
        cta_text: 'Cere o Ofertă',
        cta_url: '/contact/',
        is_active: true
      }
    },
    final_cta: {
      heading: 'Să Începem Petrecerea!',
      content: {
        subheading: 'Rezervă-ți data din timp',
        body: '<p>Calendarul nostru se ocupă rapid în plin sezon de evenimente! Nu lăsa cele mai frumoase detalii pe ultima sută de metri. Scrie-ne chiar acum pe WhatsApp sau dă-ne un telefon pentru a stabili detaliile și a-ți rezerva data evenimentului tău de vis.</p>',
        image_url: '/images/home-cta.png',
        cta_text: 'Contactează-ne',
        cta_url: '/contact/',
        is_active: true
      }
    }
  };

  for (const [type, data] of Object.entries(sectionsData)) {
    await supabase
      .from('kassia_page_sections')
      .update({
        heading: data.heading,
        content: data.content
      })
      .eq('page_id', page.id)
      .eq('section_type', type);
      
    console.log(`Updated section ${type}`);
  }
}

run();
