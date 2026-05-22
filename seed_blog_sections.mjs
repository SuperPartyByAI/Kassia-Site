import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: blogPages } = await supabase.from('kassia_pages').select('id, path').eq('page_type', 'blog');
  const blogIds = blogPages.map(p => p.id);
  const { data: sections } = await supabase.from('kassia_page_sections').select('page_id').in('page_id', blogIds);
  
  const pagesWithSections = new Set(sections.map(s => s.page_id));
  const pagesWithoutSections = blogPages.filter(p => !pagesWithSections.has(p.id));
  
  console.log(`Found ${pagesWithoutSections.length} blog pages without sections.`);
  
  if (pagesWithoutSections.length > 0) {
    const sectionTypes = [
      'hero', 'intro', 'toc', 'main_answer', 'examples', 
      'mistakes_to_avoid', 'recommended_services', 'faq', 'final_cta'
    ];
    
    let toInsert = [];
    pagesWithoutSections.forEach(page => {
      sectionTypes.forEach((type, index) => {
        toInsert.push({
          page_id: page.id,
          section_type: type,
          order_index: (index + 1) * 10,
          heading: type === 'hero' ? '' : `Subtitlu H2 pentru ${type}`,
          content: {
            subheading: type === 'hero' ? '' : `Subtitlu H3 pentru ${type}`,
            body: `<p>Adauga continut aici pentru sectiunea ${type}...</p>`,
            cta_text: type.includes('cta') || type === 'hero' ? 'Text Buton CTA' : '',
            cta_url: type.includes('cta') || type === 'hero' ? '/link-buton/' : '',
            image_url: type === 'hero' || type === 'examples' ? '' : undefined,
            is_active: true
          }
        });
      });
    });
    
    const { error } = await supabase.from('kassia_page_sections').insert(toInsert);
    if (error) {
      console.error("Error inserting sections:", error);
    } else {
      console.log(`Successfully inserted ${toInsert.length} sections for ${pagesWithoutSections.length} blogs.`);
    }
  }
}
run();
