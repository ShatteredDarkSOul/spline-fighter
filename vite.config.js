import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: '/spline-fighter/',
  plugins: [
    viteStaticCopy({
      targets: [{ src: 'assets', dest: '.' }]
    })
  ],
  build: {
    outDir: 'dist'
  }
})
