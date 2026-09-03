import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['react-icons/fi', 'react-icons/fa', 'react-icons/md']
        }
      }
    },
    modulePreload: {
      polyfill: true
    }
  },
  plugins: [
    react(),
    {
      name: 'preload-hints',
      transformIndexHtml(html) {
        const preloadPattern = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g;
        let result = html;
        const cssLinks = [...html.matchAll(preloadPattern)];
        if (cssLinks.length > 0 && !result.includes('rel="preload"')) {
          const firstCss = cssLinks[0][1];
          result = result.replace(
            '</title>',
            `</title>\n    <link rel="preload" href="${firstCss}" as="style">`
          );
        }
        return result;
      }
    }
  ]
});
