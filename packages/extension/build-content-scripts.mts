import { build } from 'vite'
import { resolve } from 'path'

const __dirname = new URL('.', import.meta.url).pathname

await build({
  configFile: false,
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/content/index.ts'),
      name: 'content',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    global: 'globalThis',
  },
  resolve: {
    alias: { crypto: 'node:crypto' },
  },
})
