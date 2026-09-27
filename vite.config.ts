import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Se publica en abelg02.github.io/portfolio (repositorio 'portfolio')
  base: '/portfolio/',
  plugins: [react()],
})
