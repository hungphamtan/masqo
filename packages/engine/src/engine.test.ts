import { describe, it, expect } from 'vitest'
import { ReplacementMode } from '@masqo/shared'
import { Engine, createEngine } from './engine.js'
import type { EngineConfig } from './types.js'

describe('Engine', () => {
  describe('createEngine', () => {
    it('should create an engine instance', () => {
      const engine = createEngine()
      expect(engine).toBeInstanceOf(Engine)
    })
  })

  describe('scan', () => {
    it('should accept input and config', () => {
      const engine = new Engine()
      const config: EngineConfig = {
        mode: ReplacementMode.Redact,
      }

      const result = engine.scan('test input', config)

      expect(result).toBeDefined()
      expect(result.original).toBe('test input')
      expect(result.mode).toBe(ReplacementMode.Redact)
    })

    it('should return ScanResult with correct structure', () => {
      const engine = new Engine()
      const config: EngineConfig = {
        mode: ReplacementMode.Tokenize,
      }

      const result = engine.scan('input', config)

      expect(result).toHaveProperty('original')
      expect(result).toHaveProperty('output')
      expect(result).toHaveProperty('detections')
      expect(result).toHaveProperty('mode')
      expect(Array.isArray(result.detections)).toBe(true)
    })

    it('should handle all replacement modes', () => {
      const engine = new Engine()

      const modes = [
        ReplacementMode.Redact,
        ReplacementMode.Tokenize,
        ReplacementMode.Partial,
        ReplacementMode.Warn,
      ]

      for (const mode of modes) {
        const result = engine.scan('test', { mode })
        expect(result.mode).toBe(mode)
      }
    })

    it('should handle optional config fields', () => {
      const engine = new Engine()

      const result = engine.scan('test', {
        mode: ReplacementMode.Redact,
        enabledDetectors: ['aws', 'jwt'],
        minConfidence: 0.8,
      })

      expect(result).toBeDefined()
    })
  })
})
