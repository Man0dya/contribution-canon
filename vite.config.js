import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure correct base path for GitHub Pages project site
  // If you publish to https://<username>.github.io/Readme-Contribution-Graph-Generator/
  // the base must be '/Readme-Contribution-Graph-Generator/'
  base: '/Readme-Contribution-Graph-Generator/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true
  }
})