import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Gera source maps para facilitar debug em produção
    sourcemap: false,
    // Divide o bundle em chunks menores
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    // Avisa se um chunk ultrapassar 500kb
    chunkSizeWarningLimit: 500,
  },
  // Garante que a API do Open Library funcione sem CORS em dev
  server: {
    port: 5173,
    open: true,
  },
})
