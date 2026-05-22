import fs from 'fs';

let content = fs.readFileSync('scripts/generate_kassia_skeleton_seed_v5_7.mjs', 'utf-8');

// Replace v5_7 with v5_8 in strings
content = content.replace(/v5_7/g, 'v5_8');
content = content.replace(/V5\.7/g, 'V5.8');

// Fix slug trailing dashes: slug = p.path === '/' ? 'home' : p.path.replace(/^\/+|\/+$/g, '').replace(/\//g, '-');
// This logic is already in v5_7, let's look at how it works.
// '/contact/'.replace(/^\/+|\/+$/g, '') -> 'contact'
// then replace(/\//g, '-') -> 'contact'. No trailing dash.
// But wait! If the string was '/despre-noi/', it becomes 'despre-noi'.
// Why did the user see 'despre-noi-' ? Because they had the OLD V5.5 file from their clipboard!
// Let me just ensure the slug and title logic is perfect.

// I will overwrite the JS entirely just to be 100% sure the logic is pristine and there's no V5.5 leftovers in it.
