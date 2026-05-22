import fs from 'fs';

const astroConfig = fs.readFileSync('astro.config.mjs', 'utf8');
const layoutAstro = fs.readFileSync('src/layouts/Layout.astro', 'utf8');

console.log("=== ASTRO CONFIG ===");
console.log(astroConfig);

console.log("\n=== LAYOUT ASTRO (Lines 1-20) ===");
console.log(layoutAstro.split('\n').slice(0, 20).join('\n'));
