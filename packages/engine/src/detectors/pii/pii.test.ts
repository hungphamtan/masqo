import { describe, it, expect } from 'vitest'
import { detectPii } from './pii.js'

describe('PII Detector', () => {
  describe('email', () => {
    it('detects plain email', () => {
      const r = detectPii('contact me at user@example.com please')
      expect(r.some((d) => d.type === 'email' && d.originalText === 'user@example.com')).toBe(true)
    })

    it('detects email with subdomain', () => {
      const r = detectPii('user@mail.example.co.uk')
      expect(r.some((d) => d.type === 'email')).toBe(true)
    })

    it('detects email with plus tag', () => {
      const r = detectPii('user+tag@example.com')
      expect(r.some((d) => d.type === 'email')).toBe(true)
    })

    it('does not flag bare domain without @', () => {
      const r = detectPii('visit example.com today')
      expect(r.filter((d) => d.type === 'email')).toHaveLength(0)
    })
  })

  describe('phone number', () => {
    it('detects E.164 format', () => {
      const r = detectPii('call +14155551234')
      expect(r.some((d) => d.type === 'phone-number')).toBe(true)
    })

    it('detects US format with dashes', () => {
      const r = detectPii('phone: 415-555-1234')
      expect(r.some((d) => d.type === 'phone-number')).toBe(true)
    })

    it('detects US format with parens', () => {
      const r = detectPii('(415) 555-1234')
      expect(r.some((d) => d.type === 'phone-number')).toBe(true)
    })

    it('detects dot-separated format', () => {
      const r = detectPii('415.555.1234')
      expect(r.some((d) => d.type === 'phone-number')).toBe(true)
    })

    it('does not flag short number sequences', () => {
      const r = detectPii('error code 123-456')
      expect(r.filter((d) => d.type === 'phone-number')).toHaveLength(0)
    })
  })

  describe('SSN', () => {
    it('detects SSN with dashes', () => {
      const r = detectPii('SSN: 123-45-6789')
      expect(r.some((d) => d.type === 'ssn' && d.originalText === '123-45-6789')).toBe(true)
    })

    it('detects SSN with spaces', () => {
      const r = detectPii('ssn 234 56 7890')
      expect(r.some((d) => d.type === 'ssn')).toBe(true)
    })

    it('does not flag SSN starting with 000', () => {
      const r = detectPii('000-12-3456')
      expect(r.filter((d) => d.type === 'ssn')).toHaveLength(0)
    })

    it('does not flag SSN starting with 666', () => {
      const r = detectPii('666-12-3456')
      expect(r.filter((d) => d.type === 'ssn')).toHaveLength(0)
    })

    it('does not flag SSN starting with 9xx', () => {
      const r = detectPii('999-12-3456')
      expect(r.filter((d) => d.type === 'ssn')).toHaveLength(0)
    })
  })

  describe('credit card', () => {
    it('detects Visa', () => {
      const r = detectPii('card: 4111 1111 1111 1111')
      expect(r.some((d) => d.type === 'credit-card')).toBe(true)
    })

    it('detects Mastercard', () => {
      const r = detectPii('5500-0000-0000-0004')
      expect(r.some((d) => d.type === 'credit-card')).toBe(true)
    })

    it('detects Amex (15 digits starting 3)', () => {
      const r = detectPii('3714 496353 98431')
      expect(r.some((d) => d.type === 'credit-card')).toBe(true)
    })

    it('detects Discover', () => {
      const r = detectPii('6011000990139424')
      expect(r.some((d) => d.type === 'credit-card')).toBe(true)
    })
  })

  describe('IP address', () => {
    it('detects public IPv4', () => {
      const r = detectPii('server at 203.0.113.45')
      expect(r.some((d) => d.type === 'ip-address' && d.originalText === '203.0.113.45')).toBe(true)
    })

    it('does not flag 10.x.x.x (private)', () => {
      const r = detectPii('internal 10.0.0.1')
      expect(r.filter((d) => d.type === 'ip-address')).toHaveLength(0)
    })

    it('does not flag 192.168.x.x (private)', () => {
      const r = detectPii('router 192.168.1.1')
      expect(r.filter((d) => d.type === 'ip-address')).toHaveLength(0)
    })

    it('does not flag 127.0.0.1 (loopback)', () => {
      const r = detectPii('localhost 127.0.0.1')
      expect(r.filter((d) => d.type === 'ip-address')).toHaveLength(0)
    })

    it('does not flag octets > 255', () => {
      const r = detectPii('version 1.256.0.0')
      expect(r.filter((d) => d.type === 'ip-address')).toHaveLength(0)
    })
  })

  describe('multiple PII in one input', () => {
    it('detects all types simultaneously', () => {
      const input = 'Email: john@acme.com, phone: 415-555-9876, SSN: 234-56-7890, IP: 203.0.113.1'
      const r = detectPii(input)
      expect(r.some((d) => d.type === 'email')).toBe(true)
      expect(r.some((d) => d.type === 'phone-number')).toBe(true)
      expect(r.some((d) => d.type === 'ssn')).toBe(true)
      expect(r.some((d) => d.type === 'ip-address')).toBe(true)
    })
  })

  describe('confidence and metadata', () => {
    it('email has confidence >= 0.9', () => {
      const r = detectPii('user@example.com')
      const d = r.find((d) => d.type === 'email')
      expect(d?.confidence).toBeGreaterThanOrEqual(0.9)
    })

    it('all detections include source and explanation', () => {
      const r = detectPii('user@example.com, 415-555-1234, 123-45-6789, 203.0.113.1')
      for (const d of r) {
        expect(d.source).toBeTruthy()
        expect(d.explanation).toBeTruthy()
        expect(d.originalText).toBeTruthy()
      }
    })
  })

  describe('general policy enables PII detector', () => {
    it('pii group maps to pii detector', async () => {
      const { createEngine } = await import('../../engine.js')
      const engine = createEngine()
      const result = engine.scan('contact user@example.com', { mode: 0, presetName: 'general' })
      expect(result.detections.some((d) => d.type === 'email')).toBe(true)
    })

    it('developer policy disables PII detector', async () => {
      const { createEngine } = await import('../../engine.js')
      const engine = createEngine()
      const result = engine.scan('contact user@example.com', { mode: 0, presetName: 'developer' })
      expect(result.detections.filter((d) => d.type === 'email')).toHaveLength(0)
    })
  })
})
