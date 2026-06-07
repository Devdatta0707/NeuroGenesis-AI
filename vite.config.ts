import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Merge .env file vars with actual process.env (Render/Vercel set these at build time)
  const VITE_CLERK_PUBLISHABLE_KEY = process.env.VITE_CLERK_PUBLISHABLE_KEY || env.VITE_CLERK_PUBLISHABLE_KEY || '';
  const VITE_API_BASE_URL = process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || '';
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      // Explicitly bake build-time env vars so they're available on all platforms
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(VITE_CLERK_PUBLISHABLE_KEY),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(VITE_API_BASE_URL),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: `http://localhost:${env.PORT || 3000}`,
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2022',
      // Disable source maps in production — prevents reverse engineering
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            three: ['three'],
            charts: ['recharts', 'chart.js'],
            motion: ['framer-motion'],
          },
        },
      },
    },
  };
});
