import { describe, it, expect } from 'vitest'
import { loadPreset, listPresets } from './presets.js'

describe('Policy Presets', () => {
  describe('listPresets', () => {
    it('returns available preset names', () => {
      const presets = listPresets()
      expect(presets).toContain('developer')
      expect(presets).toContain('general')
    })
  })

  describe('developer preset', () => {
    it('loads without error', () => {
      expect(() => loadPreset('developer')).not.toThrow()
    })

    it('has correct name', () => {
      expect(loadPreset('developer').name).toBe('Developer')
    })

    it('enables secrets detection', () => {
      const p = loadPreset('developer')
      expect(p.detectors['secrets']?.enabled).toBe(true)
    })

    it('disables pii detection', () => {
      const p = loadPreset('developer')
      expect(p.detectors['pii']?.enabled).toBe(false)
    })

    it('uses tokenize mode', () => {
      expect(loadPreset('developer').replacementMode).toBe('tokenize')
    })

    it('is a valid policy (parseable)', () => {
      const p = loadPreset('developer')
      expect(p.version).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  describe('general preset', () => {
    it('loads without error', () => {
      expect(() => loadPreset('general')).not.toThrow()
    })

    it('has correct name', () => {
      expect(loadPreset('general').name).toBe('General')
    })

    it('enables secrets detection', () => {
      const p = loadPreset('general')
      expect(p.detectors['secrets']?.enabled).toBe(true)
    })

    it('enables pii detection', () => {
      const p = loadPreset('general')
      expect(p.detectors['pii']?.enabled).toBe(true)
    })

    it('uses redact mode', () => {
      expect(loadPreset('general').replacementMode).toBe('redact')
    })
  })

  describe('error handling', () => {
    it('throws on unknown preset name', () => {
      expect(() => loadPreset('unknown-preset')).toThrow()
    })
  })
})
