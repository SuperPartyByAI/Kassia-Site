import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
process.env.PORT = '4321';
process.env.HOST = '127.0.0.1';
import('./dist/server/entry.mjs');
