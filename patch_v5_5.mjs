import fs from 'fs';

let content = fs.readFileSync('scripts/generate_kassia_skeleton_seed_v5_5.mjs', 'utf-8');

// Replace v5_3 with v5_5 in strings
content = content.replace(/v5_3/g, 'v5_5');
content = content.replace(/V5\.3/g, 'V5.5');

// Extract the part before the SQL generation and the part after the ALTER TABLE block
let splitStart = content.indexOf(`let sqlOut = \`-- SEED SKELETON PREVIEW`);
let splitEnd = content.indexOf(`sqlOut += \`DO $$\\nDECLARE\\n    v_page_id UUID;\\nBEGIN\\n\\n\`;`);

if (splitStart !== -1 && splitEnd !== -1) {
  content = content.substring(0, splitStart) + 
    `let sqlOut = \`-- SEED SKELETON PREVIEW PENTRU KASSIA V5.5 (169 PAGES)\\n\`;\n` +
    `sqlOut += \`-- GENERATED VIA SCRIPT.\\n\\n\`;\n` +
    `sqlOut += \`BEGIN;\\n\\n\`;\n` +
    `sqlOut += \`CREATE TABLE IF NOT EXISTS kassia_seo_map (\\n\`;\n` +
    `sqlOut += \`  page_id UUID PRIMARY KEY REFERENCES kassia_pages(id) ON DELETE CASCADE,\\n\`;\n` +
    `sqlOut += \`  main_keyword VARCHAR(255),\\n\`;\n` +
    `sqlOut += \`  search_intent VARCHAR(50),\\n\`;\n` +
    `sqlOut += \`  parent_path VARCHAR(255)\\n\`;\n` +
    `sqlOut += \`);\\n\\n\`;\n` +
    content.substring(splitEnd);
}

// kassia_pages INSERT: remove main_keyword and search_intent
const pagesRegex = /INSERT INTO kassia_pages \\\(slug, path, page_type, title, h1, meta_title, meta_description, canonical_url, priority, status, index_status, include_in_sitemap, main_keyword, search_intent\\\)\\n.*?VALUES \\\('\$\{slug\}', '\$\{p\.path\}', '\$\{p\.page_type\}', '\$\{title\.replace\(\/'\/g, "''"\)\}', '\$\{title\.replace\(\/'\/g, "''"\)\}', '\$\{title\.replace\(\/'\/g, "''"\)\} - Kassia', '', NULL, 0\.5, 'draft', 'noindex', false, '\$\{p\.main_keyword\.replace\(\/'\/g, "''"\)\}', '\$\{p\.search_intent\}'\\\)\\n/s;
content = content.replace(pagesRegex, 
  "INSERT INTO kassia_pages (slug, path, page_type, title, h1, meta_title, meta_description, canonical_url, priority, status, index_status, include_in_sitemap)\\n\` +\n" +
  "  \`    VALUES ('${slug}', '${p.path}', '${p.page_type}', '${title.replace(/'/g, \"''\")}', '${title.replace(/'/g, \"''\")}', '${title.replace(/'/g, \"''\")} - Kassia', '', NULL, 0.5, 'draft', 'noindex', false)\\n"
);

// kassia_pages ON CONFLICT UPDATE: remove main_keyword and search_intent
content = content.replace(
  /        main_keyword = EXCLUDED\.main_keyword,\\n\s+search_intent = EXCLUDED\.search_intent,\\n/g,
  ''
);

// Insert into kassia_seo_map after RETURNING id INTO v_page_id;
content = content.replace(
  /    RETURNING id INTO v_page_id;\\n\\n/g,
  "    RETURNING id INTO v_page_id;\n\n" +
  "  sqlOut += `    INSERT INTO kassia_seo_map (page_id, main_keyword, search_intent, parent_path)\\n`;\n" +
  "  sqlOut += `    VALUES (v_page_id, '${p.main_keyword.replace(/'/g, \"''\")}', '${p.search_intent}', ${p.parent_path ? `'${p.parent_path}'` : 'NULL'})\\n`;\n" +
  "  sqlOut += `    ON CONFLICT (page_id) DO UPDATE SET\\n`;\n" +
  "  sqlOut += `        main_keyword = EXCLUDED.main_keyword,\\n`;\n" +
  "  sqlOut += `        search_intent = EXCLUDED.search_intent,\\n`;\n" +
  "  sqlOut += `        parent_path = EXCLUDED.parent_path;\\n\\n`;\n\n"
);

// kassia_page_sections INSERT
content = content.replace(
  /INSERT INTO kassia_page_sections \(page_id, section_key, sort_order\)\\n.*?VALUES \(v_page_id, '\$\{sec\}', \$\{idx \+ 1\}\)\\n.*?ON CONFLICT ON CONSTRAINT unique_page_section DO NOTHING;\\n/gs,
  "INSERT INTO kassia_page_sections (page_id, section_type, content, order_index)\\n` +\n" +
  "    `    VALUES (v_page_id, '${sec}', '{}'::jsonb, ${idx + 1})\\n` +\n" +
  "    `    ON CONFLICT (page_id, section_type) DO NOTHING;\\n"
);

// kassia_faqs INSERT
content = content.replace(
  /INSERT INTO kassia_faqs \(page_id, question, answer, sort_order, include_in_schema\)\\n.*?VALUES \(v_page_id, 'Draft FAQ \$\{i\} for \$\{slug\}', 'Placeholder', \$\{i\}, false\)\\n.*?ON CONFLICT ON CONSTRAINT unique_page_faq DO NOTHING;\\n/gs,
  "INSERT INTO kassia_faqs (page_id, question, answer, order_index)\\n` +\n" +
  "    `    VALUES (v_page_id, 'Draft FAQ ${i} for ${slug}', 'Placeholder', ${i})\\n` +\n" +
  "    `    ON CONFLICT (page_id, order_index) DO NOTHING;\\n"
);

// kassia_gallery_items INSERT
content = content.replace(
  /INSERT INTO kassia_gallery_items \(page_id, slot_key, label_owner, is_required, sort_order\)\\n.*?VALUES \(v_page_id, '\$\{slot\}', '\$\{getLabelOwner\(slot\)\}', \$\{slot === 'hero_image' \? 'true' : 'false'\}, \$\{idx \+ 1\}\)\\n.*?ON CONFLICT ON CONSTRAINT unique_page_slot DO NOTHING;\\n/gs,
  "INSERT INTO kassia_gallery_items (page_id, url, alt_text, order_index)\\n` +\n" +
  "    `    VALUES (v_page_id, '', '', ${idx + 1})\\n` +\n" +
  "    `    ON CONFLICT (page_id, order_index) DO NOTHING;\\n"
);

// kassia_internal_links INSERT
content = content.replace(
  /INSERT INTO kassia_internal_links \(source_page_id, target_page_id, anchor_text, link_type\)\\n.*?SELECT p1\.id, p2\.id, '\$\{l\.anchor\.replace\(\/'\/g, "''"\)\}', '\$\{l\.reason\}'\\n/gs,
  "INSERT INTO kassia_internal_links (source_page_id, target_page_id, anchor_text)\\n` +\n" +
  "  `    SELECT p1.id, p2.id, '${l.anchor.replace(/'/g, \"''\")}'\\n"
);

fs.writeFileSync('scripts/generate_kassia_skeleton_seed_v5_5.mjs', content);
