import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['react-big-calendar', 'react-dom'],
  },
})
