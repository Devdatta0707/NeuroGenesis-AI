import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    // Only expose VITE_ prefixed vars to the client bundle — never raw API keys
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
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
