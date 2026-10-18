import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for food spot frontend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-charts';
            if (id.includes('ogl')) return 'vendor-ogl';
            if (id.includes('react-icons')) return 'vendor-icons';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('axios') || id.includes('qrcode')) {
              return 'vendor-utils';
            }
          }
        }
      }
    }
  }
});
