import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

const copyManifestPlugin = {
  name: 'copy-manifest',
  closeBundle() {
    mkdirSync('dist', { recursive: true })
    copyFileSync('public/manifest.json', 'dist/manifest.json')
  },
}

export default defineConfig({
  plugins: [react(), copyManifestPlugin],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content_chatgpt: resolve(__dirname, 'src/content/chatgpt.ts'),
        content_claude: resolve(__dirname, 'src/content/claude.ts'),
        content_gemini: resolve(__dirname, 'src/content/gemini.ts'),
        sidebar: resolve(__dirname, 'src/sidebar/index.html'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
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
      // Polyfill Node crypto for browser — use globalThis.crypto
      crypto: 'node:crypto',
    },
  },
})
