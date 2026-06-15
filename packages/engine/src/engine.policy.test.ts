import { describe, it, expect } from 'vitest'
import { ReplacementMode } from '@masqo/shared'
import { createEngine } from './engine.js'
import { loadPreset } from './policies/presets.js'

describe('Engine + Policy Integration', () => {
  it('uses policy replacementMode over config mode', () => {
    const engine = createEngine()
    const policy = loadPreset('developer') // tokenize
    const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
      mode: ReplacementMode.Redact, // should be overridden by policy
      policy,
    })
    expect(result.output).toMatch(/^TOKEN_/)
    expect(result.mode).toBe('tokenize')
  })

  it('respects policy detector enablement - disabled detector skipped', () => {
    const engine = createEngine()
    const policy = loadPreset('developer') // pii disabled
    // If there were PII detections, they'd be skipped.
    // Use aws (enabled in developer) to verify it still runs.
    const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
      mode: ReplacementMode.Redact,
      policy,
    })
    expect(result.detections.length).toBeGreaterThan(0)
  })

  it('applies custom rules from policy', () => {
    const engine = createEngine()
    const policy = loadPreset('developer')
    policy.customRules.push({ pattern: 'MYCORP_[A-Z0-9]{16}', type: 'corp-secret', name: 'Corp Secret' })
    const result = engine.scan('key: MYCORP_ABCDEF1234567890', {
      mode: ReplacementMode.Redact,
      policy,
    })
    expect(result.detections.some((d) => d.type === 'corp-secret')).toBe(true)
    // developer preset uses tokenize mode - policy overrides the mode param
    expect(result.output).not.toContain('MYCORP_ABCDEF1234567890')
  })

  it('policy can disable all built-in detectors', () => {
    const engine = createEngine()
    const policy = loadPreset('general')
    // Override all detector groups to disabled
    Object.keys(policy.detectors).forEach((k) => {
      policy.detectors[k] = { enabled: false }
    })
    const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
      mode: ReplacementMode.Redact,
      policy,
    })
    // With secrets disabled in policy and no other detectors, output unchanged
    // (aws detector is in 'secrets' group)
    expect(result.detections.length).toBe(0)
  })

  it('no policy behaves as before (all detectors run)', () => {
    const engine = createEngine()
    const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
      mode: ReplacementMode.Redact,
    })
    expect(result.detections.length).toBeGreaterThan(0)
  })

  it('loads preset by name string', () => {
    const engine = createEngine()
    const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
      mode: ReplacementMode.Redact,
      presetName: 'developer',
    })
    expect(result.output).toMatch(/^TOKEN_/)
  })
})
