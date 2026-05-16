import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
