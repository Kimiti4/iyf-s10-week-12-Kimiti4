import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    visualizer({ filename: 'dist/stats.html', open: false, gzipSize: true, brotliSize: true }),
    VitePWA({
      registerType: 'autoUpdate',
      // Custom authored SW (src/sw.js). generateSW would overwrite it, so we
      // use injectManifest to keep our offline-draft sync handler.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['icon-192.png', 'offline.html'],
      manifest: {
        name: 'JamiiLink PWA',
        short_name: 'JamiiLink',
        description: 'Community network for connection and impact',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      }
    })
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    // Force HMR for CSS updates
    hmr: {
      overlay: true
    }
  },
  build: {
    // Increase chunk size warning limit to avoid build failures
    chunkSizeWarningLimit: 1000,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'framer-motion': ['framer-motion'],
          'icons': ['react-icons'],
          'socket-io': ['socket.io-client']
        }
      }
    },
    // Add timestamp to assets for cache busting
    assetsDir: 'assets',
    cssCodeSplit: true
  },
  // Clear cache on each dev restart
  optimizeDeps: {
    force: true
  }
})
