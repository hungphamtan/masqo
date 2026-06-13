import { describe, it, expect } from 'vitest'
import { explain } from './index.js'
import type { Detection } from '@masqo/shared'

const makeDetection = (overrides: Partial<Detection> = {}): Detection => ({
  type: 'aws-access-key',
  position: { start: 0, end: 20 },
  confidence: 0.95,
  pattern: 'AKIA[0-9A-Z]{16}',
  source: 'detector:secrets/aws',
  explanation: 'Detected AWS access key pattern (AKIA followed by 16 alphanumeric characters)',
  originalText: 'AKIAIOSFODNN7EXAMPLE',
  ...overrides,
})

describe('Explainer', () => {
  it('returns explanation with pattern name', () => {
    const result = explain(makeDetection())
    expect(result.patternName).toBeDefined()
    expect(typeof result.patternName).toBe('string')
  })

  it('returns confidence score', () => {
    const result = explain(makeDetection())
    expect(result.confidence).toBe(0.95)
  })

  it('returns rule source', () => {
    const result = explain(makeDetection())
    expect(result.ruleSource).toBe('detector:secrets/aws')
  })

  it('returns human-readable message', () => {
    const result = explain(makeDetection())
    expect(result.message).toContain('AWS')
    expect(typeof result.message).toBe('string')
    expect(result.message.length).toBeGreaterThan(10)
  })

  it('includes the detection type', () => {
    const result = explain(makeDetection({ type: 'jwt' }))
    expect(result.patternName).toContain('jwt')
  })

  it('formats confidence as percentage label', () => {
    const highConf = explain(makeDetection({ confidence: 0.95 }))
    expect(highConf.confidenceLabel).toBe('high')

    const medConf = explain(makeDetection({ confidence: 0.6 }))
    expect(medConf.confidenceLabel).toBe('medium')

    const lowConf = explain(makeDetection({ confidence: 0.3 }))
    expect(lowConf.confidenceLabel).toBe('low')
  })

  it('works for any detection type', () => {
    const types = ['aws-access-key', 'jwt', 'bearer-token', 'db-password']
    for (const type of types) {
      const result = explain(makeDetection({ type }))
      expect(result.patternName).toBeDefined()
      expect(result.message).toBeDefined()
    }
  })
})
