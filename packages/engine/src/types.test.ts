import { describe, it, expect } from 'vitest'
import { ReplacementMode } from '@masqo/shared'
import type { Detector, Replacer, EngineConfig } from './types.js'

describe('Engine Types', () => {
  describe('Detector interface', () => {
    it('should be implementable', () => {
      const mockDetector: Detector = {
        name: 'test',
        detect: (input: string) => [],
      }

      expect(mockDetector.name).toBe('test')
      expect(typeof mockDetector.detect).toBe('function')
      expect(mockDetector.detect('test')).toEqual([])
    })
  })

  describe('Replacer interface', () => {
    it('should be implementable with required methods', () => {
      const mockReplacer: Replacer = {
        replace: (input: string, detections) => input,
      }

      expect(typeof mockReplacer.replace).toBe('function')
      expect(mockReplacer.replace('test', [])).toBe('test')
    })

    it('should support optional restore method', () => {
      const mockReplacer: Replacer = {
        replace: (input: string, detections) => input,
        restore: (output: string) => output,
      }

      expect(typeof mockReplacer.restore).toBe('function')
      expect(mockReplacer.restore?.('test')).toBe('test')
    })
  })

  describe('EngineConfig type', () => {
    it('should allow minimal config', () => {
      const config: EngineConfig = {
        mode: ReplacementMode.Redact,
      }

      expect(config.mode).toBe(ReplacementMode.Redact)
    })

    it('should allow full config', () => {
      const config: EngineConfig = {
        mode: ReplacementMode.Tokenize,
        enabledDetectors: ['aws', 'jwt'],
        minConfidence: 0.9,
      }

      expect(config.enabledDetectors).toHaveLength(2)
      expect(config.minConfidence).toBe(0.9)
    })
  })
})
