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

  it('DetailPage links back to /how-it-works and renders one h1', () => {
    const src = read('./components/DetailPage.tsx')
    expect(src).toContain('/how-it-works')
    expect(src).toContain('<h1')
    expect(src).toContain('FlowDiagram')
    expect(src).toContain('FeatureMedia')
  })

  it('WebApp + Extension detail pages exist and use DetailPage', () => {
    const web = read('./pages/how-it-works/WebApp.tsx')
    const ext = read('./pages/how-it-works/Extension.tsx')
    expect(web).toContain('DetailPage')
    expect(web).toContain('export function WebAppDetail')
    expect(ext).toContain('DetailPage')
    expect(ext).toContain('export function ExtensionDetail')
    expect(ext).toContain('chromewebstore.google.com')
  })

  it('Cli + Engine detail pages exist and use DetailPage', () => {
    const cli = read('./pages/how-it-works/Cli.tsx')
    const eng = read('./pages/how-it-works/Engine.tsx')
    expect(cli).toContain('export function CliDetail')
    expect(cli).toContain('install-hook claude-code')
    expect(cli).toContain('npmjs.com/package/@masqo/cli')
    expect(eng).toContain('export function EngineDetail')
    expect(eng).toContain('createEngine')
    expect(eng).toContain('npmjs.com/package/@masqo/engine')
  })

  it('routes are wired and overview links to detail pages', () => {
    const main = read('./main.tsx')
    expect(main).toContain('/how-it-works/web-app')
    expect(main).toContain('/how-it-works/extension')
    expect(main).toContain('/how-it-works/cli')
    expect(main).toContain('/how-it-works/engine')
    const hiw = read('./pages/HowItWorks.tsx')
    expect(hiw).toContain('/how-it-works/extension')
    expect(hiw).toContain('/how-it-works/cli')
  })
})
