import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    // Ziel: moderne Browser — kleinere Bundles
    target: 'es2020',

    // CSS Code Splitting
    cssCodeSplit: true,

    // Chunk size warning bei 400KB
    chunkSizeWarningLimit: 400,

    rollupOptions: {
      output: {
        // Manuelles Bundle-Splitting — jede Lib in eigenen Chunk
        manualChunks: {
          // React Core — wird immer gecacht
          'vendor-react': ['react', 'react-dom'],

          // Router — separat
          'vendor-router': ['react-router-dom'],

          // Framer Motion — groß, selten geändert
          'vendor-motion': ['framer-motion'],

          // Icons — tree-shakeable aber groß
          'vendor-icons': ['lucide-react'],

          // Zustand
          'vendor-state': ['zustand'],
        },

        // Chunk Dateinamen mit Hash für Cache-Busting
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Optimiere Deps beim Start
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
})