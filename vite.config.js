import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// La API usa cookie SameSite=Strict y rechaza orígenes distintos (403),
// así que el navegador debe hablar siempre con el mismo origen: /api se reenvía al backend.
// No activar changeOrigin: cambiaría el Host y la API rechazaría los POST/PATCH/DELETE.
const proxy = { '/api': { target: 'http://127.0.0.1:3000', changeOrigin: false } }

export default defineConfig({
  plugins: [vue()],
  server: { proxy },
  preview: { proxy },
})
