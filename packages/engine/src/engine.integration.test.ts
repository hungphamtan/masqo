import { describe, it, expect } from 'vitest'
import { ReplacementMode } from '@masqo/shared'
import { createEngine } from './engine.js'

describe('Engine Integration', () => {
  describe('AWS secrets end-to-end', () => {
    it('redacts AWS access key in output', () => {
      const engine = createEngine()
      const result = engine.scan('AWS key: AKIAIOSFODNN7EXAMPLE', {
        mode: ReplacementMode.Redact,
        enabledDetectors: ['aws'],
      })
      expect(result.output).toBe('AWS key: [REDACTED:aws-access-key]')
      expect(result.output).not.toContain('AKIAIOSFODNN7EXAMPLE')
      expect(result.original).toBe('AWS key: AKIAIOSFODNN7EXAMPLE')
    })

    it('tokenizes AWS access key', () => {
      const engine = createEngine()
      const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
        mode: ReplacementMode.Tokenize,
        enabledDetectors: ['aws'],
      })
      expect(result.output).toMatch(/^TOKEN_[a-f0-9]+$/)
      expect(result.detections).toHaveLength(1)
    })

    it('partially reveals AWS access key', () => {
      const engine = createEngine()
      const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
        mode: ReplacementMode.Partial,
        enabledDetectors: ['aws'],
      })
      expect(result.output).toBe('AKIA...MPLE')
    })

    it('warns but preserves content', () => {
      const engine = createEngine()
      const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
        mode: ReplacementMode.Warn,
        enabledDetectors: ['aws'],
      })
      expect(result.output).toBe('AKIAIOSFODNN7EXAMPLE')
      expect(result.detections.length).toBeGreaterThan(0)
    })

    it('detections include explanation', () => {
      const engine = createEngine()
      const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
        mode: ReplacementMode.Redact,
        enabledDetectors: ['aws'],
      })
      expect(result.detections[0]?.explanation).toBeDefined()
      expect(result.detections[0]?.source).toBe('detector:secrets/aws')
    })

    it('handles empty input', () => {
      const engine = createEngine()
      const result = engine.scan('', {
        mode: ReplacementMode.Redact,
        enabledDetectors: ['aws'],
      })
      expect(result.output).toBe('')
      expect(result.detections).toHaveLength(0)
    })

    it('handles input with no secrets', () => {
      const engine = createEngine()
      const result = engine.scan('hello world', {
        mode: ReplacementMode.Redact,
        enabledDetectors: ['aws'],
      })
      expect(result.output).toBe('hello world')
      expect(result.detections).toHaveLength(0)
    })

    it('respects minConfidence threshold', () => {
      const engine = createEngine()
      const result = engine.scan('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', {
        mode: ReplacementMode.Redact,
        enabledDetectors: ['aws'],
        minConfidence: 0.99, // above secret key's 0.85 confidence
      })
      expect(result.detections).toHaveLength(0)
    })

    it('performance: scans 10KB in under 100ms', () => {
      const engine = createEngine()
      const chunk = 'hello world AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE and some other text\n'
      const input = chunk.repeat(Math.ceil(10240 / chunk.length))

      const start = Date.now()
      engine.scan(input, { mode: ReplacementMode.Redact, enabledDetectors: ['aws'] })
      const elapsed = Date.now() - start

      expect(elapsed).toBeLessThan(100)
    })
  })

  describe('all detectors (no filter)', () => {
    it('runs all registered detectors when enabledDetectors omitted', () => {
      const engine = createEngine()
      const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
        mode: ReplacementMode.Redact,
      })
      expect(result.detections.length).toBeGreaterThan(0)
    })
  })
})
