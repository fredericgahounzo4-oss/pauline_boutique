import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const DJANGO_URL = process.env.VITE_API_URL || 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: DJANGO_URL,
        changeOrigin: true,
      }
    }
  }
})
