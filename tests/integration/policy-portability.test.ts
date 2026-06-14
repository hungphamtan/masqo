/**
 * Cross-package integration: Policy portability across surfaces.
 * Same policy JSON produces same behavior via engine API, CLI, and web engine instance.
 */
import { describe, it, expect } from 'vitest'
import { createEngine, createPolicyManager, loadPreset } from '@masqo/engine'
import { ReplacementMode } from '@masqo/shared'

describe('Policy portability', () => {
  it('developer preset tokenizes secrets', () => {
    const engine = createEngine()
    const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
      mode: ReplacementMode.Redact,
      presetName: 'developer',
    })
    expect(result.output).toMatch(/TOKEN_/)
    expect(result.mode).toBe('tokenize')
  })

  it('general preset redacts secrets', () => {
    const engine = createEngine()
    const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
      mode: ReplacementMode.Tokenize,
      presetName: 'general',
    })
    expect(result.output).toContain('[REDACTED:aws-access-key]')
    expect(result.mode).toBe('redact')
  })

  it('policy round-trips through manager save/load', () => {
    const manager = createPolicyManager()
    const original = loadPreset('developer')
    const json = manager.savePolicy(original)
    const loaded = manager.loadPolicy(json)
    expect(loaded.name).toBe(original.name)
    expect(loaded.replacementMode).toBe(original.replacementMode)
    expect(loaded.detectors).toEqual(original.detectors)
  })

  it('custom rule in policy is applied by engine', () => {
    const engine = createEngine()
    const policy = loadPreset('developer')
    policy.customRules.push({ pattern: 'CORP_SECRET_[A-Z0-9]+', type: 'corp-secret', name: 'Corp' })
    const result = engine.scan('token: CORP_SECRET_ABC123', {
      mode: ReplacementMode.Redact,
      policy,
    })
    expect(result.detections.some((d) => d.type === 'corp-secret')).toBe(true)
  })

  it('same input gives same detection count across two engine instances', () => {
    const e1 = createEngine()
    const e2 = createEngine()
    const input = 'AKIAIOSFODNN7EXAMPLE postgresql://admin:pass@localhost/db'
    const r1 = e1.scan(input, { mode: ReplacementMode.Redact })
    const r2 = e2.scan(input, { mode: ReplacementMode.Redact })
    expect(r1.detections.length).toBe(r2.detections.length)
    expect(r1.output).toBe(r2.output)
  })
})
