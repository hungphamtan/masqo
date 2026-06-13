import { describe, it, expect } from 'vitest'
import { detectAwsSecrets } from './aws.js'

describe('AWS Secret Detector', () => {
  describe('AWS Access Key ID', () => {
    it('should detect valid AWS access key', () => {
      const input = 'AKIAIOSFODNN7EXAMPLE'
      const detections = detectAwsSecrets(input)

      expect(detections).toHaveLength(1)
      expect(detections[0]?.type).toBe('aws-access-key')
      expect(detections[0]?.position).toEqual({ start: 0, end: 20 })
      expect(detections[0]?.confidence).toBeGreaterThan(0.9)
    })

    it('should detect AWS access key in sentence', () => {
      const input = 'My key is AKIAIOSFODNN7EXAMPLE for production'
      const detections = detectAwsSecrets(input)

      expect(detections).toHaveLength(1)
      expect(detections[0]?.type).toBe('aws-access-key')
      expect(detections[0]?.position).toEqual({ start: 10, end: 30 })
    })

    it('should ignore AWS access key in comments', () => {
      const input = '// Example: AKIAIOSFODNN7EXAMPLE'
      const detections = detectAwsSecrets(input)

      expect(detections).toHaveLength(0)
    })

    it('should ignore AWS access key in comments with hash', () => {
      const input = '# Example: AKIAIOSFODNN7EXAMPLE'
      const detections = detectAwsSecrets(input)

      expect(detections).toHaveLength(0)
    })

    it('should detect multiple AWS access keys', () => {
      const input = 'Key1: AKIAIOSFODNN7EXAMPLE\\nKey2: AKIAJ7S6XYZ1ABCDEFGH'
      const detections = detectAwsSecrets(input)

      expect(detections).toHaveLength(2)
      expect(detections[0]?.type).toBe('aws-access-key')
      expect(detections[1]?.type).toBe('aws-access-key')
    })
  })

  describe('AWS Secret Access Key', () => {
    it('should detect valid AWS secret key', () => {
      const input = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      const detections = detectAwsSecrets(input)

      expect(detections).toHaveLength(1)
      expect(detections[0]?.type).toBe('aws-secret-key')
      expect(detections[0]?.confidence).toBeGreaterThan(0.8)
    })

    it('should detect AWS secret key in environment variable', () => {
      const input = 'AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
      const detections = detectAwsSecrets(input)

      expect(detections).toHaveLength(1)
      expect(detections[0]?.type).toBe('aws-secret-key')
    })

    it('should not flag short base64-like strings', () => {
      const input = 'short/string+here='
      const detections = detectAwsSecrets(input)

      expect(detections).toHaveLength(0)
    })
  })

  describe('AWS Session Token', () => {
    it('should detect AWS session token', () => {
      const input = 'FwoGZXIvYXdzEBQaDJd8v7Zxy3xKZ2xSSSKwAR1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const detections = detectAwsSecrets(input)

      expect(detections.length).toBeGreaterThan(0)
      const sessionToken = detections.find((d) => d.type === 'aws-session-token')
      expect(sessionToken).toBeDefined()
    })
  })

  describe('Combined detection', () => {
    it('should detect access key and secret key together', () => {
      const input = `
        AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
        AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
      `
      const detections = detectAwsSecrets(input)

      expect(detections.length).toBeGreaterThanOrEqual(2)
      expect(detections.some((d) => d.type === 'aws-access-key')).toBe(true)
      expect(detections.some((d) => d.type === 'aws-secret-key')).toBe(true)
    })
  })

  describe('Position accuracy', () => {
    it('should return correct positions for matches', () => {
      const input = 'prefix AKIAIOSFODNN7EXAMPLE suffix'
      const detections = detectAwsSecrets(input)

      expect(detections).toHaveLength(1)
      expect(input.substring(
        detections[0]!.position.start,
        detections[0]!.position.end
      )).toBe('AKIAIOSFODNN7EXAMPLE')
    })
  })

  describe('Explanation', () => {
    it('should provide explanation for detections', () => {
      const input = 'AKIAIOSFODNN7EXAMPLE'
      const detections = detectAwsSecrets(input)

      expect(detections[0]?.explanation).toBeDefined()
      expect(detections[0]?.explanation).toContain('AWS')
      expect(detections[0]?.source).toBe('detector:secrets/aws')
    })
  })
})
