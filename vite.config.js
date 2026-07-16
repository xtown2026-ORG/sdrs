import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api/v1/certificates': {
        target: 'https://sdrsapi.sdrsgoldfinance.com',
        changeOrigin: true,
      },
      '/api/v1/rates': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
