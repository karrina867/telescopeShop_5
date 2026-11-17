import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    // xlsx тяжёлый: пре-бандлим заранее, чтобы вкладка импорта не перезагружалась при первом открытии.
    include: ['xlsx'],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    warmup: {
      clientFiles: ['./src/views/*.vue', './src/views/admin/*.vue', './src/components/**/*.vue'],
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
