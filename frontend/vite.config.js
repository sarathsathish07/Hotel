import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: './', 
  plugins: [react()],
  build: {
    outDir: 'dist', 
    emptyOutDir: true, 
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://celebratespaces.site', 
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
