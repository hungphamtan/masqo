import { describe, it, expect } from 'vitest'
import { redact } from './redact.js'
import { tokenize, restore } from './tokenize.js'
import { partial } from './partial.js'
import { warn } from './warn.js'
import type { Detection } from '@masqo/shared'

const makeDetection = (overrides: Partial<Detection> = {}): Detection => ({
  type: 'aws-access-key',
  position: { start: 0, end: 20 },
  confidence: 0.95,
  pattern: 'AKIA[0-9A-Z]{16}',
  source: 'detector:secrets/aws',
  explanation: 'AWS access key',
  originalText: 'AKIAIOSFODNN7EXAMPLE',
  ...overrides,
})

describe('Redact replacer', () => {
  it('replaces detection with [REDACTED:type]', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE'
    const detection = makeDetection()
    const result = redact(input, [detection])
    expect(result).toBe('[REDACTED:aws-access-key]')
  })

  it('replaces detection in a sentence', () => {
    const input = 'key: AKIAIOSFODNN7EXAMPLE end'
    const detection = makeDetection({ position: { start: 5, end: 25 } })
    const result = redact(input, [detection])
    expect(result).toBe('key: [REDACTED:aws-access-key] end')
  })

  it('handles multiple detections', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE and AKIAIOSFODNN7EXAMPLE'
    const d1 = makeDetection()
    const d2 = makeDetection({ position: { start: 25, end: 45 } })
    const result = redact(input, [d1, d2])
    expect(result).toBe('[REDACTED:aws-access-key] and [REDACTED:aws-access-key]')
  })

  it('handles overlapping detections (skips later ones)', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE'
    const d1 = makeDetection()
    const d2 = makeDetection({ type: 'other', position: { start: 5, end: 15 } })
    const result = redact(input, [d1, d2])
    expect(result).toBe('[REDACTED:aws-access-key]')
  })

  it('returns original if no detections', () => {
    const result = redact('hello world', [])
    expect(result).toBe('hello world')
  })
})

describe('Tokenize replacer', () => {
  it('replaces detection with a token', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE'
    const detection = makeDetection()
    const result = tokenize(input, [detection])
    expect(result).toMatch(/^TOKEN_[a-f0-9]+$/)
  })

  it('same input produces consistent token within same call context', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE'
    const detection = makeDetection()
    const result1 = tokenize(input, [detection])
    const result2 = tokenize(input, [detection])
    expect(result1).toBe(result2)
  })

  it('token is reversible via restore', () => {
    const input = 'key: AKIAIOSFODNN7EXAMPLE'
    const detection = makeDetection({ position: { start: 5, end: 25 } })
    const tokenized = tokenize(input, [detection])
    const restored = restore(tokenized)
    expect(restored).toBe(input)
  })

  it('returns original if no detections', () => {
    const result = tokenize('hello', [])
    expect(result).toBe('hello')
  })
})

describe('Partial replacer', () => {
  it('shows first 4 and last 4 chars with ellipsis', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE'
    const detection = makeDetection()
    const result = partial(input, [detection])
    expect(result).toBe('AKIA...MPLE')
  })

  it('works in a sentence', () => {
    const input = 'key: AKIAIOSFODNN7EXAMPLE end'
    const detection = makeDetection({ position: { start: 5, end: 25 } })
    const result = partial(input, [detection])
    expect(result).toBe('key: AKIA...MPLE end')
  })

  it('respects custom reveal length', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE'
    const detection = makeDetection()
    const result = partial(input, [detection], { revealChars: 2 })
    expect(result).toBe('AK...LE')
  })

  it('returns original if no detections', () => {
    const result = partial('hello', [])
    expect(result).toBe('hello')
  })
})

describe('Warn replacer', () => {
  it('preserves original content', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE'
    const detection = makeDetection()
    const result = warn(input, [detection])
    expect(result.output).toBe(input)
  })

  it('returns warning flag with detections', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE'
    const detection = makeDetection()
    const result = warn(input, [detection])
    expect(result.hasWarnings).toBe(true)
    expect(result.detections).toHaveLength(1)
  })

  it('no warnings when no detections', () => {
    const result = warn('hello', [])
    expect(result.hasWarnings).toBe(false)
    expect(result.output).toBe('hello')
  })
})
