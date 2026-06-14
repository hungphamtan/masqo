import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('Web app', () => {
  it('index.html exists and references main entry', () => {
    const html = readFileSync(resolve(import.meta.dirname, '../index.html'), 'utf8')
    expect(html).toContain('/src/main.tsx')
    expect(html).toContain('Masqo')
  })

  it('vite config exists', () => {
    const cfg = readFileSync(resolve(import.meta.dirname, '../vite.config.ts'), 'utf8')
    expect(cfg).toContain('vite')
    expect(cfg).toContain('react')
  })

  it('engine integration works headlessly', async () => {
    const { createEngine } = await import('@masqo/engine')
    const { ReplacementMode } = await import('@masqo/shared')
    const engine = createEngine()
    const result = engine.scan('AKIAIOSFODNN7EXAMPLE', { mode: ReplacementMode.Redact })
    expect(result.output).toContain('[REDACTED:aws-access-key]')
    expect(result.detections.length).toBeGreaterThan(0)
  })
})
