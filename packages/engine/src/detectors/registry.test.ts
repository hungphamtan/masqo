import { describe, it, expect } from 'vitest'
import { createRegistry } from './index.js'
import type { Detector } from '../types.js'
import type { Detection } from '@masqo/shared'

const makeDetector = (name: string): Detector => ({
  name,
  detect: (_input: string): Detection[] => [],
})

describe('Detector Registry', () => {
  it('creates an empty registry', () => {
    const registry = createRegistry()
    expect(registry.list()).toHaveLength(0)
  })

  it('registers a detector', () => {
    const registry = createRegistry()
    registry.register('test', makeDetector('test'))
    expect(registry.list()).toContain('test')
  })

  it('retrieves a registered detector', () => {
    const registry = createRegistry()
    const detector = makeDetector('test')
    registry.register('test', detector)
    expect(registry.get('test')).toBe(detector)
  })

  it('throws when retrieving unknown detector', () => {
    const registry = createRegistry()
    expect(() => registry.get('unknown')).toThrow()
  })

  it('lists all registered detectors', () => {
    const registry = createRegistry()
    registry.register('a', makeDetector('a'))
    registry.register('b', makeDetector('b'))
    registry.register('c', makeDetector('c'))
    expect(registry.list()).toEqual(expect.arrayContaining(['a', 'b', 'c']))
    expect(registry.list()).toHaveLength(3)
  })

  it('throws on duplicate registration', () => {
    const registry = createRegistry()
    registry.register('test', makeDetector('test'))
    expect(() => registry.register('test', makeDetector('test'))).toThrow()
  })

  it('auto-registers built-in detectors', () => {
    const registry = createRegistry({ builtins: true })
    expect(registry.list()).toContain('aws')
  })

  it('built-in aws detector can detect keys', () => {
    const registry = createRegistry({ builtins: true })
    const aws = registry.get('aws')
    const detections = aws.detect('AKIAIOSFODNN7EXAMPLE')
    expect(detections.length).toBeGreaterThan(0)
    expect(detections[0]?.type).toBe('aws-access-key')
  })
})
