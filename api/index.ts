// Vercel serverless entry point — re-exports the Express app
// Vercel auto-detects files in /api and serves them as serverless functions
export { default } from '../server/index.js';
