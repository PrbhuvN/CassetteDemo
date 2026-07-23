import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' emits relative asset paths so the build works under
// https://<user>.github.io/<repo>/ on GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 5177 },
})
