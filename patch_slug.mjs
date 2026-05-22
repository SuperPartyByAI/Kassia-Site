import fs from 'fs';

let content = fs.readFileSync('src/pages/[...slug].astro', 'utf8');

// 1. Add Image import
content = content.replace(
  "import Footer from '../components/Footer.astro';",
  "import Footer from '../components/Footer.astro';\nimport { Image } from 'astro:assets';"
);

// 2. Fetch config & update Schema LocalBusiness
const canonicalSearch = `// Canonical
const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://www.kassia.ro';
const canonical = page.canonical_url || \`\${siteUrl}\${path}\`;`;

const canonicalReplace = `// Canonical
const siteUrl = import.meta.env.PUBLIC_SITE_URL || 'https://www.kassia.ro';
const canonical = page.canonical_url || \`\${siteUrl}\${path}\`;

// Fetch config for Schema
const { data: configRows } = await supabase.from('kassia_site_config').select('*');
const config = Object.fromEntries(configRows?.map(row => [row.key, row.value]) || []);
const phone = config.phone;`;
content = content.replace(canonicalSearch, canonicalReplace);

const schemaSearch = `// 1. Organization / LocalBusiness
schemas.push({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Kassia",
  "url": siteUrl,
  "logo": \`\${siteUrl}/logo.png\`,
  "image": validImages.length > 0 ? validImages[0].url : undefined
});`;

const schemaReplace = `// 1. Organization / LocalBusiness
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Kassia",
  "url": siteUrl,
  "logo": \`\${siteUrl}/logo.png\`,
  "image": validImages.length > 0 ? validImages[0].url : undefined
};
if (phone) {
  localBusinessSchema.telephone = phone;
}
if (config && Object.keys(config).length > 0) {
  localBusinessSchema.address = {
    "@type": "PostalAddress",
    "addressRegion": "București & Ilfov",
    "addressCountry": "RO"
  };
}
schemas.push(localBusinessSchema);`;
content = content.replace(schemaSearch, schemaReplace);

// 3. Update Layout props
const layoutSearch = `<Layout title={page.meta_title} description={page.meta_description} canonical={canonical} robots={robots} schemas={schemas}>`;
const layoutReplace = `const ogImage = validImages.length > 0 ? validImages[0].url : undefined;
---

<Layout title={page.meta_title} description={page.meta_description} canonical={canonical} robots={robots} schemas={schemas} ogImage={ogImage}>`;
content = content.replace(layoutSearch, layoutReplace);

// 4. Update Images
// For service card
content = content.replace(
  `<img src={card.content?.image_url || 'https://placehold.co/600x800/fdf4ff/a855f7?text=Imagine+Serviciu'} alt={card.heading || 'Kassia Servicii'} loading="lazy" />`,
  `{card.content?.image_url ? (
     <Image src={card.content.image_url} alt={card.heading || 'Kassia Servicii'} inferSize={true} />
  ) : (
     <img src="https://placehold.co/600x800/fdf4ff/a855f7?text=Imagine+Serviciu" alt="Placeholder" loading="lazy" />
  )}`
);

// For section placeholder
content = content.replace(
  `<img src={section.content?.image_url || "https://placehold.co/800x600/fdf4ff/a855f7?text=Imagine+Sectiune"} alt={section.heading || 'Kassia Events'} loading="lazy" />`,
  `{section.content?.image_url ? (
     <Image src={section.content.image_url} alt={section.heading || 'Kassia Events'} inferSize={true} />
  ) : (
     <img src="https://placehold.co/800x600/fdf4ff/a855f7?text=Imagine+Sectiune" alt="Placeholder" loading="lazy" />
  )}`
);

// For gallery item
content = content.replace(
  `<img src={img.url || 'https://placehold.co/600x600/fdf4ff/a855f7?text=Foto'} alt={img.alt_text || 'Galerie Kassia'} loading="lazy" />`,
  `{img.url ? (
     <Image src={img.url} alt={img.alt_text || 'Galerie Kassia'} inferSize={true} />
  ) : (
     <img src="https://placehold.co/600x600/fdf4ff/a855f7?text=Foto" alt="Placeholder" loading="lazy" />
  )}`
);

fs.writeFileSync('src/pages/[...slug].astro', content);
console.log("Patched [...slug].astro");
