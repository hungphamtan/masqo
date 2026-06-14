// Builds ONE content script at a time as IIFE.
// Called three times from build script with CONTENT_ENTRY env var.
import { defineConfig } from 'vite'
import { resolve } from 'path'

const entry = process.env.CONTENT_ENTRY
if (!entry) throw new Error('CONTENT_ENTRY env var required')

const nameMap: Record<string, string> = {
  chatgpt: 'content_chatgpt',
  claude: 'content_claude',
  gemini: 'content_gemini',
}

const name = nameMap[entry]
if (!name) throw new Error(`Unknown CONTENT_ENTRY: ${entry}`)

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, `src/content/${entry}.ts`),
      name,
      formats: ['iife'],
      fileName: () => `${name}.js`,
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
