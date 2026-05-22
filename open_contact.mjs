import { exec } from 'child_process';
const url = `http://localhost:4321/contact/`;
console.log(`Opening URL: ${url}`);
exec(`open "${url}"`);
