import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This tells Vite: "If a request starts with /api, send it to the Render backend"
      '/api': {
        target: 'https://exam-backend-tm1n.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})