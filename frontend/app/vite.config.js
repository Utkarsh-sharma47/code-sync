import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config tuned for Express static serving
export default defineConfig({
  // Use relative asset paths so Express static can serve from /dist
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
