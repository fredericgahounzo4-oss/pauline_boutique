import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Tout appel à /api/... sera redirigé vers PHP via XAMPP
      // Exemple : fetch('/api/auth/login.php') → http://localhost/pauline-api/auth/login.php
      '/api': {
        target: 'http://localhost/pauline-api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
