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

describe('Visual detail pages', () => {
  const read = (p: string) => readFileSync(resolve(import.meta.dirname, p), 'utf8')

  it('FlowDiagram is accessible (role img + title/desc + text list)', () => {
    const src = read('./components/FlowDiagram.tsx')
    expect(src).toContain('role="img"')
    expect(src).toContain('aria-labelledby')
    expect(src).toContain('<title')
    expect(src).toContain('<desc')
    // redundant visible ordered list so meaning is not SVG-only
    expect(src).toContain('<ol')
  })

  it('FeatureMedia has captions slot, transcript, no autoplay, lazy preload', () => {
    const src = read('./components/FeatureMedia.tsx')
    expect(src).toContain('kind="captions"')
    expect(src).toContain('<details')
    expect(src).toContain('preload="none"')
    expect(src).not.toContain('autoPlay')
    expect(src).toContain('.webm')
    expect(src).toContain('.mp4')
  })
})
