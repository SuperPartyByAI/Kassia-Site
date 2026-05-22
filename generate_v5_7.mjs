import fs from 'fs';

let content = fs.readFileSync('scripts/generate_kassia_skeleton_seed_v5_5.mjs', 'utf-8');

// Replace v5_5 with v5_7 in strings
content = content.replace(/v5_5/g, 'v5_7');
content = content.replace(/V5\.5/g, 'V5.7');

// Rewrite the SQL generator section starting from the output init
let splitStart = content.indexOf(`let sqlOut = \`-- SEED SKELETON PREVIEW`);
let endSqlBlock = content.indexOf(`fs.writeFileSync(path.join(dbDir, '04_seed_kassia_skeleton_preview_v5_7.sql'), sqlOut);`);

let newLogic = `
let sqlOut = \`-- SEED SKELETON PREVIEW PENTRU KASSIA V5.7 (169 PAGES)\\n\`;
sqlOut += \`-- GENERATED VIA SCRIPT. FARA ON CONFLICT. SIGURANTA MAXIMA.\\n\\n\`;
sqlOut += \`BEGIN;\\n\\n\`;

// Create the SEO map table
sqlOut += \`CREATE TABLE IF NOT EXISTS kassia_seo_map (\\n\`;
sqlOut += \`  page_id UUID PRIMARY KEY REFERENCES kassia_pages(id) ON DELETE CASCADE,\\n\`;
sqlOut += \`  main_keyword VARCHAR(255),\\n\`;
sqlOut += \`  search_intent VARCHAR(50),\\n\`;
sqlOut += \`  parent_path VARCHAR(255),\\n\`;
sqlOut += \`  commercial_target VARCHAR(255),\\n\`;
sqlOut += \`  forbidden_primary_keywords TEXT,\\n\`;
sqlOut += \`  canonical_strategy VARCHAR(50)\\n\`;
sqlOut += \`);\\n\\n\`;

sqlOut += \`DO $$\\nDECLARE\\n    v_page_id UUID;\\nBEGIN\\n\\n\`;

pages.forEach(p => {
  sqlOut += \`    -- PAGE: \${p.path}\\n\`;
  let slug = p.path === '/' ? 'home' : p.path.replace(/^\\/+||\\/+$/g, '').replace(/\\//g, '-');
  if (p.page_type === 'guide' && slug.startsWith('blog-')) slug = slug.replace(/^blog-/, '');
  
  let title = p.path === '/' ? 'Homepage' : toTitleCase(slug);
  if (p.page_type === 'guide') title = formatTitleFromPrimaryKeyword(p.main_keyword);
  
  sqlOut += \`    v_page_id := NULL;\\n\`;
  sqlOut += \`    UPDATE kassia_pages SET\\n\`;
  sqlOut += \`        slug = '\${slug}',\\n\`;
  sqlOut += \`        page_type = '\${p.page_type}',\\n\`;
  sqlOut += \`        title = '\${title.replace(/'/g, "''")}',\\n\`;
  sqlOut += \`        h1 = '\${title.replace(/'/g, "''")}',\\n\`;
  sqlOut += \`        meta_title = '\${title.replace(/'/g, "''")} - Kassia',\\n\`;
  sqlOut += \`        canonical_url = NULL,\\n\`;
  sqlOut += \`        priority = 0.5,\\n\`;
  sqlOut += \`        status = CASE WHEN status = 'published' THEN status ELSE 'draft' END,\\n\`;
  sqlOut += \`        index_status = CASE WHEN status = 'published' THEN index_status ELSE 'noindex' END\\n\`;
  sqlOut += \`    WHERE path = '\${p.path}' RETURNING id INTO v_page_id;\\n\\n\`;
  
  sqlOut += \`    IF v_page_id IS NULL THEN\\n\`;
  sqlOut += \`        INSERT INTO kassia_pages (slug, path, page_type, title, h1, meta_title, meta_description, canonical_url, priority, status, index_status, include_in_sitemap)\\n\`;
  sqlOut += \`        VALUES ('\${slug}', '\${p.path}', '\${p.page_type}', '\${title.replace(/'/g, "''")}', '\${title.replace(/'/g, "''")}', '\${title.replace(/'/g, "''")} - Kassia', '', NULL, 0.5, 'draft', 'noindex', false)\\n\`;
  sqlOut += \`        RETURNING id INTO v_page_id;\\n\`;
  sqlOut += \`    END IF;\\n\\n\`;
  
  sqlOut += \`    IF EXISTS (SELECT 1 FROM kassia_seo_map WHERE page_id = v_page_id) THEN\\n\`;
  sqlOut += \`        UPDATE kassia_seo_map SET main_keyword = '\${p.main_keyword.replace(/'/g, "''")}', search_intent = '\${p.search_intent}', parent_path = \${p.parent_path ? \`'\${p.parent_path}'\` : 'NULL'} WHERE page_id = v_page_id;\\n\`;
  sqlOut += \`    ELSE\\n\`;
  sqlOut += \`        INSERT INTO kassia_seo_map (page_id, main_keyword, search_intent, parent_path) VALUES (v_page_id, '\${p.main_keyword.replace(/'/g, "''")}', '\${p.search_intent}', \${p.parent_path ? \`'\${p.parent_path}'\` : 'NULL'});\\n\`;
  sqlOut += \`    END IF;\\n\\n\`;
  
  p.sections_to_create.forEach((sec, idx) => {
    sqlOut += \`    IF NOT EXISTS (SELECT 1 FROM kassia_page_sections WHERE page_id = v_page_id AND section_type = '\${sec}') THEN\\n\`;
    sqlOut += \`        INSERT INTO kassia_page_sections (page_id, section_type, content, order_index)\\n\`;
    sqlOut += \`        VALUES (v_page_id, '\${sec}', '{}'::jsonb, \${idx + 1});\\n\`;
    sqlOut += \`    END IF;\\n\`;
  });
  
  for(let i=1; i<=p.faq_slots_to_create; i++) {
    sqlOut += \`    IF NOT EXISTS (SELECT 1 FROM kassia_faqs WHERE page_id = v_page_id AND order_index = \${i}) THEN\\n\`;
    sqlOut += \`        INSERT INTO kassia_faqs (page_id, question, answer, order_index)\\n\`;
    sqlOut += \`        VALUES (v_page_id, 'Draft FAQ \${i} for \${slug}', 'Placeholder', \${i});\\n\`;
    sqlOut += \`    END IF;\\n\`;
  }
  
  p.media_slots_to_create.forEach((slot, idx) => {
    sqlOut += \`    IF NOT EXISTS (SELECT 1 FROM kassia_gallery_items WHERE page_id = v_page_id AND order_index = \${idx + 1}) THEN\\n\`;
    sqlOut += \`        INSERT INTO kassia_gallery_items (page_id, url, alt_text, order_index)\\n\`;
    sqlOut += \`        VALUES (v_page_id, '', '', \${idx + 1});\\n\`;
    sqlOut += \`    END IF;\\n\`;
  });
  
  sqlOut += \`\\n\`;
});
sqlOut += \`END $$;\\n\\n\`;

// Map Parent IDs and Links
sqlOut += \`DO $$\\nDECLARE\\n  v_src UUID;\\n  v_tgt UUID;\\nBEGIN\\n\\n\`;

sqlOut += \`    -- Update parent_page_id mapping\\n\`;
pages.forEach(p => {
  if (p.parent_path) {
    sqlOut += \`    UPDATE kassia_pages p1\\n\`;
    sqlOut += \`    SET parent_page_id = p2.id\\n\`;
    sqlOut += \`    FROM kassia_pages p2\\n\`;
    sqlOut += \`    WHERE p1.path = '\${p.path}' AND p2.path = '\${p.parent_path}';\\n\\n\`;
  }
});

links.forEach(l => {
  sqlOut += \`    SELECT id INTO v_src FROM kassia_pages WHERE path = '\${l.source}';\\n\`;
  sqlOut += \`    SELECT id INTO v_tgt FROM kassia_pages WHERE path = '\${l.target}';\\n\`;
  sqlOut += \`    IF v_src IS NOT NULL AND v_tgt IS NOT NULL THEN\\n\`;
  sqlOut += \`        IF NOT EXISTS (SELECT 1 FROM kassia_internal_links WHERE source_page_id = v_src AND target_page_id = v_tgt AND anchor_text = '\${l.anchor.replace(/'/g, "''")}') THEN\\n\`;
  sqlOut += \`            INSERT INTO kassia_internal_links (source_page_id, target_page_id, anchor_text)\\n\`;
  sqlOut += \`            VALUES (v_src, v_tgt, '\${l.anchor.replace(/'/g, "''")}');\\n\`;
  sqlOut += \`        END IF;\\n\`;
  sqlOut += \`    END IF;\\n\\n\`;
});
sqlOut += \`END $$;\\n\\n\`;

sqlOut += \`COMMIT;\\n\`;

fs.writeFileSync(path.join(dbDir, '04_seed_kassia_skeleton_preview_v5_7.sql'), sqlOut);
`;

content = content.substring(0, splitStart) + newLogic + content.substring(endSqlBlock + `fs.writeFileSync(path.join(dbDir, '04_seed_kassia_skeleton_preview_v5_7.sql'), sqlOut);`.length);

// Ensure safe_for_seed_run is FALSE
content = content.replace(/safe_for_seed_run: true/g, 'safe_for_seed_run: false');

fs.writeFileSync('scripts/generate_kassia_skeleton_seed_v5_7.mjs', content);
