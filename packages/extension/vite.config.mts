import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync } from 'fs'

const copyManifestPlugin = {
  name: 'copy-manifest',
  closeBundle() {
    mkdirSync('dist/icons', { recursive: true })
    copyFileSync('public/manifest.json', 'dist/manifest.json')
    for (const file of readdirSync('public/icons')) {
      copyFileSync(`public/icons/${file}`, `dist/icons/${file}`)
    }
  },
}

export default defineConfig({
  base: './',
  plugins: [react(), copyManifestPlugin],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        sidebar: resolve(__dirname, 'src/sidebar/index.html'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'globalThis',
  },
  resolve: {
    alias: {
      crypto: 'node:crypto',
    },
  },
})
