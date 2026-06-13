import { describe, it, expect } from 'vitest'
import { ReplacementMode, type Detection, type PolicyConfig, type Position } from './types.js'

describe('Shared Types', () => {
  describe('Position', () => {
    it('should define position with start and end', () => {
      const position: Position = { start: 0, end: 10 }
      expect(position.start).toBe(0)
      expect(position.end).toBe(10)
    })
  })

  describe('ReplacementMode', () => {
    it('should have all 4 modes', () => {
      expect(ReplacementMode.Redact).toBe('redact')
      expect(ReplacementMode.Tokenize).toBe('tokenize')
      expect(ReplacementMode.Partial).toBe('partial')
      expect(ReplacementMode.Warn).toBe('warn')
    })
  })

  describe('Detection', () => {
    it('should define detection with all required fields', () => {
      const detection: Detection = {
        type: 'aws-access-key',
        position: { start: 10, end: 30 },
        confidence: 0.95,
        pattern: 'AKIA[0-9A-Z]{16}',
        source: 'detector:secrets/aws',
        explanation: 'Detected AWS access key pattern',
      }

      expect(detection.type).toBe('aws-access-key')
      expect(detection.confidence).toBe(0.95)
      expect(detection.position.start).toBe(10)
    })

    it('should allow optional originalText field', () => {
      const detection: Detection = {
        type: 'test',
        position: { start: 0, end: 5 },
        confidence: 1.0,
        pattern: 'test',
        source: 'test',
        explanation: 'test',
        originalText: 'secret',
      }

      expect(detection.originalText).toBe('secret')
    })
  })

  describe('PolicyConfig', () => {
    it('should define policy with all required fields', () => {
      const policy: PolicyConfig = {
        name: 'Developer',
        version: '1.0.0',
        detectors: {
          secrets: { enabled: true, confidence: 'high' },
          pii: { enabled: false },
        },
        customRules: [],
        replacementMode: ReplacementMode.Tokenize,
      }

      expect(policy.name).toBe('Developer')
      expect(policy.version).toBe('1.0.0')
      expect(policy.detectors.secrets.enabled).toBe(true)
      expect(policy.replacementMode).toBe('tokenize')
    })

    it('should allow custom rules', () => {
      const policy: PolicyConfig = {
        name: 'Custom',
        version: '1.0.0',
        detectors: {},
        customRules: [
          {
            pattern: 'SECRET_[A-Z]+',
            type: 'custom-secret',
            name: 'Custom Secret Pattern',
          },
        ],
        replacementMode: ReplacementMode.Redact,
      }

      expect(policy.customRules).toHaveLength(1)
      expect(policy.customRules[0]?.pattern).toBe('SECRET_[A-Z]+')
    })
  })
})
