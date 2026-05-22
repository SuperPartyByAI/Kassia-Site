import fs from 'fs';

let content = fs.readFileSync('scripts/generate_kassia_skeleton_seed_v5_4.mjs', 'utf-8');

// Replace v5_3 with v5_4 in strings
content = content.replace(/v5_3/g, 'v5_4');
content = content.replace(/V5\.3/g, 'V5.4');

// Modify the SQL generation logic to split into 04a and 04b
let schemaBlockStart = content.indexOf(`let sqlOut = \`-- SEED SKELETON PREVIEW`);
let sqlGenEnd = content.indexOf(`fs.writeFileSync(path.join(dbDir, '04_seed_kassia_skeleton_preview_v5_4.sql'), sqlOut);`);

let newLogic = `
let sqlSchema = \`-- KASSIA SCHEMA SYNC V5.4\\n\`;
sqlSchema += \`-- PREPARES LIVE DB COLUMNS FOR SEEDING.\\n\\n\`;
sqlSchema += \`BEGIN;\\n\\n\`;
sqlSchema += \`DO $$\\nBEGIN\\n\`;
sqlSchema += \`    -- kassia_pages columns\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kassia_pages' AND column_name='main_keyword') THEN\\n\`;
sqlSchema += \`        ALTER TABLE kassia_pages ADD COLUMN main_keyword VARCHAR(255);\\n\`;
sqlSchema += \`    END IF;\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kassia_pages' AND column_name='search_intent') THEN\\n\`;
sqlSchema += \`        ALTER TABLE kassia_pages ADD COLUMN search_intent VARCHAR(50);\\n\`;
sqlSchema += \`    END IF;\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kassia_pages' AND column_name='parent_page_id') THEN\\n\`;
sqlSchema += \`        ALTER TABLE kassia_pages ADD COLUMN parent_page_id UUID REFERENCES kassia_pages(id) ON DELETE SET NULL;\\n\`;
sqlSchema += \`    END IF;\\n\\n\`;
sqlSchema += \`    -- kassia_faqs columns\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kassia_faqs' AND column_name='include_in_schema') THEN\\n\`;
sqlSchema += \`        ALTER TABLE kassia_faqs ADD COLUMN include_in_schema BOOLEAN DEFAULT true;\\n\`;
sqlSchema += \`    END IF;\\n\\n\`;
sqlSchema += \`    -- kassia_gallery_items columns\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kassia_gallery_items' AND column_name='slot_key') THEN\\n\`;
sqlSchema += \`        ALTER TABLE kassia_gallery_items ADD COLUMN slot_key VARCHAR(50);\\n\`;
sqlSchema += \`    END IF;\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kassia_gallery_items' AND column_name='label_owner') THEN\\n\`;
sqlSchema += \`        ALTER TABLE kassia_gallery_items ADD COLUMN label_owner VARCHAR(50);\\n\`;
sqlSchema += \`    END IF;\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kassia_gallery_items' AND column_name='is_required') THEN\\n\`;
sqlSchema += \`        ALTER TABLE kassia_gallery_items ADD COLUMN is_required BOOLEAN DEFAULT false;\\n\`;
sqlSchema += \`    END IF;\\n\\n\`;
sqlSchema += \`    -- kassia_internal_links columns\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kassia_internal_links' AND column_name='link_type') THEN\\n\`;
sqlSchema += \`        ALTER TABLE kassia_internal_links ADD COLUMN link_type VARCHAR(50) DEFAULT 'contextual';\\n\`;
sqlSchema += \`    END IF;\\n\\n\`;
sqlSchema += \`    -- PREFLIGHT UNIQUE CONSTRAINTS\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_kassia_pages_path' OR conname = 'kassia_pages_path_key') THEN\\n\`;
sqlSchema += \`        IF EXISTS (SELECT path FROM kassia_pages GROUP BY path HAVING COUNT(*) > 1) THEN\\n\`;
sqlSchema += \`            RAISE EXCEPTION 'Duplicates found in kassia_pages(path). Cannot add constraint.';\\n\`;
sqlSchema += \`        END IF;\\n\`;
sqlSchema += \`        ALTER TABLE kassia_pages ADD CONSTRAINT unique_kassia_pages_path UNIQUE(path);\\n\`;
sqlSchema += \`    END IF;\\n\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_page_section') THEN\\n\`;
sqlSchema += \`        IF EXISTS (SELECT page_id, section_type FROM kassia_page_sections GROUP BY page_id, section_type HAVING COUNT(*) > 1) THEN\\n\`;
sqlSchema += \`            RAISE EXCEPTION 'Duplicates found in kassia_page_sections. Cannot add constraint.';\\n\`;
sqlSchema += \`        END IF;\\n\`;
sqlSchema += \`        ALTER TABLE kassia_page_sections ADD CONSTRAINT unique_page_section UNIQUE(page_id, section_type);\\n\`;
sqlSchema += \`    END IF;\\n\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_page_faq') THEN\\n\`;
sqlSchema += \`        IF EXISTS (SELECT page_id, order_index FROM kassia_faqs GROUP BY page_id, order_index HAVING COUNT(*) > 1) THEN\\n\`;
sqlSchema += \`            RAISE EXCEPTION 'Duplicates found in kassia_faqs. Cannot add constraint.';\\n\`;
sqlSchema += \`        END IF;\\n\`;
sqlSchema += \`        ALTER TABLE kassia_faqs ADD CONSTRAINT unique_page_faq UNIQUE(page_id, order_index);\\n\`;
sqlSchema += \`    END IF;\\n\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_page_slot') THEN\\n\`;
sqlSchema += \`        IF EXISTS (SELECT page_id, slot_key FROM kassia_gallery_items GROUP BY page_id, slot_key HAVING COUNT(*) > 1) THEN\\n\`;
sqlSchema += \`            RAISE EXCEPTION 'Duplicates found in kassia_gallery_items. Cannot add constraint.';\\n\`;
sqlSchema += \`        END IF;\\n\`;
sqlSchema += \`        ALTER TABLE kassia_gallery_items ADD CONSTRAINT unique_page_slot UNIQUE(page_id, slot_key);\\n\`;
sqlSchema += \`    END IF;\\n\\n\`;
sqlSchema += \`    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_internal_links' OR conname = 'kassia_internal_links_source_page_id_target_page_id_anchor__key') THEN\\n\`;
sqlSchema += \`        IF EXISTS (SELECT source_page_id, target_page_id, anchor_text FROM kassia_internal_links GROUP BY source_page_id, target_page_id, anchor_text HAVING COUNT(*) > 1) THEN\\n\`;
sqlSchema += \`            RAISE EXCEPTION 'Duplicates found in kassia_internal_links. Cannot add constraint.';\\n\`;
sqlSchema += \`        END IF;\\n\`;
sqlSchema += \`        ALTER TABLE kassia_internal_links ADD CONSTRAINT unique_internal_links UNIQUE(source_page_id, target_page_id, anchor_text);\\n\`;
sqlSchema += \`    END IF;\\n\`;
sqlSchema += \`END $$;\\n\\n\`;
sqlSchema += \`COMMIT;\\n\`;

let sqlOut = \`-- SEED SKELETON PREVIEW PENTRU KASSIA V5.4 (169 PAGES)\\n\`;
sqlOut += \`-- GENERATED VIA SCRIPT.\\n\\n\`;
sqlOut += \`BEGIN;\\n\\n\`;
sqlOut += \`DO $$\\nDECLARE\\n    v_page_id UUID;\\nBEGIN\\n\\n\`;

pages.forEach(p => {
  sqlOut += \`    -- PAGE: \${p.path}\\n\`;
  let slug = p.path === '/' ? 'home' : p.path.replace(/^\\/+||\\/+$/g, '').replace(/\\//g, '-');
  if (p.page_type === 'guide' && slug.startsWith('blog-')) slug = slug.replace(/^blog-/, '');
  
  let title = p.path === '/' ? 'Homepage' : toTitleCase(slug);
  if (p.page_type === 'guide') title = formatTitleFromPrimaryKeyword(p.main_keyword);
  
  sqlOut += \`    INSERT INTO kassia_pages (slug, path, page_type, title, h1, meta_title, meta_description, canonical_url, priority, status, index_status, include_in_sitemap, main_keyword, search_intent)\\n\`;
  sqlOut += \`    VALUES ('\${slug}', '\${p.path}', '\${p.page_type}', '\${title.replace(/'/g, "''")}', '\${title.replace(/'/g, "''")}', '\${title.replace(/'/g, "''")} - Kassia', '', NULL, 0.5, 'draft', 'noindex', false, '\${p.main_keyword.replace(/'/g, "''")}', '\${p.search_intent}')\\n\`;
  sqlOut += \`    ON CONFLICT (path) DO UPDATE SET\\n\`;
  sqlOut += \`        slug = EXCLUDED.slug,\\n\`;
  sqlOut += \`        page_type = EXCLUDED.page_type,\\n\`;
  sqlOut += \`        title = EXCLUDED.title,\\n\`;
  sqlOut += \`        h1 = EXCLUDED.h1,\\n\`;
  sqlOut += \`        meta_title = EXCLUDED.meta_title,\\n\`;
  sqlOut += \`        main_keyword = EXCLUDED.main_keyword,\\n\`;
  sqlOut += \`        search_intent = EXCLUDED.search_intent,\\n\`;
  sqlOut += \`        canonical_url = EXCLUDED.canonical_url,\\n\`;
  sqlOut += \`        priority = EXCLUDED.priority,\\n\`;
  sqlOut += \`        status = CASE WHEN kassia_pages.status = 'published' THEN kassia_pages.status ELSE EXCLUDED.status END,\\n\`;
  sqlOut += \`        index_status = CASE WHEN kassia_pages.status = 'published' THEN kassia_pages.index_status ELSE EXCLUDED.index_status END\\n\`;
  sqlOut += \`    RETURNING id INTO v_page_id;\\n\\n\`;
  
  p.sections_to_create.forEach((sec, idx) => {
    sqlOut += \`    INSERT INTO kassia_page_sections (page_id, section_type, content, order_index)\\n\`;
    sqlOut += \`    VALUES (v_page_id, '\${sec}', '', \${idx + 1})\\n\`;
    sqlOut += \`    ON CONFLICT ON CONSTRAINT unique_page_section DO NOTHING;\\n\`; 
  });
  
  for(let i=1; i<=p.faq_slots_to_create; i++) {
    sqlOut += \`    INSERT INTO kassia_faqs (page_id, question, answer, order_index, include_in_schema)\\n\`;
    sqlOut += \`    VALUES (v_page_id, 'Draft FAQ \${i} for \${slug}', 'Placeholder', \${i}, false)\\n\`;
    sqlOut += \`    ON CONFLICT ON CONSTRAINT unique_page_faq DO NOTHING;\\n\`;
  }
  
  p.media_slots_to_create.forEach((slot, idx) => {
    sqlOut += \`    INSERT INTO kassia_gallery_items (page_id, slot_key, label_owner, is_required, url, order_index)\\n\`;
    sqlOut += \`    VALUES (v_page_id, '\${slot}', '\${getLabelOwner(slot)}', \${slot === 'hero_image' ? 'true' : 'false'}, '', \${idx + 1})\\n\`;
    sqlOut += \`    ON CONFLICT ON CONSTRAINT unique_page_slot DO NOTHING;\\n\`;
  });
  
  sqlOut += \`\\n\`;
});
sqlOut += \`END $$;\\n\\n\`;

// Map Parent IDs
sqlOut += \`DO $$\\nBEGIN\\n\\n\`;
sqlOut += \`    -- Update parent_page_id mapping\\n\`;
pages.forEach(p => {
  if (p.parent_path) {
    sqlOut += \`    UPDATE kassia_pages p1\\n\`;
    sqlOut += \`    SET parent_page_id = p2.id\\n\`;
    sqlOut += \`    FROM kassia_pages p2\\n\`;
    sqlOut += \`    WHERE p1.path = '\${p.path}' AND p2.path = '\${p.parent_path}';\\n\\n\`;
  }
});
sqlOut += \`END $$;\\n\\n\`;

sqlOut += \`DO $$\\nBEGIN\\n\\n\`;
links.forEach(l => {
  sqlOut += \`    INSERT INTO kassia_internal_links (source_page_id, target_page_id, anchor_text, link_type)\\n\`;
  sqlOut += \`    SELECT p1.id, p2.id, '\${l.anchor.replace(/'/g, "''")}', '\${l.reason}'\\n\`;
  sqlOut += \`    FROM kassia_pages p1, kassia_pages p2\\n\`;
  sqlOut += \`    WHERE p1.path = '\${l.source}' AND p2.path = '\${l.target}'\\n\`;
  sqlOut += \`    ON CONFLICT (source_page_id, target_page_id, anchor_text) DO NOTHING;\\n\\n\`;
});
sqlOut += \`END $$;\\n\\n\`;

sqlOut += \`COMMIT;\\n\`;

fs.writeFileSync(path.join(dbDir, '04a_kassia_schema_sync_v5_4.sql'), sqlSchema);
fs.writeFileSync(path.join(dbDir, '04b_seed_kassia_skeleton_preview_v5_4.sql'), sqlOut);
`;

content = content.substring(0, schemaBlockStart) + newLogic + content.substring(sqlGenEnd + `fs.writeFileSync(path.join(dbDir, '04_seed_kassia_skeleton_preview_v5_4.sql'), sqlOut);`.length);

fs.writeFileSync('scripts/generate_kassia_skeleton_seed_v5_4.mjs', content);
