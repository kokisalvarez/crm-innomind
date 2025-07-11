// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Usa el PUERTO que Vercel CLI asigne o, si no existe, 5173
    port: Number(process.env.PORT) || 5173,
    // StrictPort evita que Vite suba a otro puerto si el asignado está ocupado
    strictPort: true,
  },
});
