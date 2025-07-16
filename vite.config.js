// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Cualquier define/optimizeDeps que necesites...
  optimizeDeps: {
    exclude: [
      'firebase-admin',
      'google-auth-library',
      'gcp-metadata',
      '@google-cloud/firestore',
      'lucide-react'
    ]
  },
  define: {
    'process.env': {}
  },

  server: {
    host: 'localhost',   // no 0.0.0.0
    port: 5173,
    strictPort: true,    // si 5173 está ocupado fallará en vez de cambiar
    proxy: {
      // Todo lo que empiece con /api/ lo reenviamos a tu API local
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
