import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/user-service':      'http://localhost:9191',
      '/catalogue-service': 'http://localhost:9191',
      '/auction-service':   'http://localhost:9191',
      '/payment-service':   'http://localhost:9191',
    },
  },
  build: {
    outDir: '../api-gateway/src/main/resources/static',
    emptyOutDir: true,
  },
})
