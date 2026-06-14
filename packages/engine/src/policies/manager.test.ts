import { describe, it, expect } from 'vitest'
import { createPolicyManager } from './manager.js'

const BASE_JSON = JSON.stringify({
  name: 'Base',
  version: '1.0.0',
  detectors: { aws: { enabled: true } },
  customRules: [],
  replacementMode: 'redact',
})

describe('Policy Manager', () => {
  describe('loadPolicy', () => {
    it('loads valid policy from JSON string', () => {
      const manager = createPolicyManager()
      const policy = manager.loadPolicy(BASE_JSON)
      expect(policy.name).toBe('Base')
    })

    it('throws on invalid policy JSON', () => {
      const manager = createPolicyManager()
      expect(() => manager.loadPolicy('bad json')).toThrow()
    })

    it('returns error result with validatePolicy on invalid', () => {
      const manager = createPolicyManager()
      const result = manager.validatePolicy('bad json')
      expect(result.ok).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('returns ok result with validatePolicy on valid', () => {
      const manager = createPolicyManager()
      const result = manager.validatePolicy(BASE_JSON)
      expect(result.ok).toBe(true)
    })
  })

  describe('savePolicy', () => {
    it('serializes policy to JSON string', () => {
      const manager = createPolicyManager()
      const policy = manager.loadPolicy(BASE_JSON)
      const json = manager.savePolicy(policy)
      const reparsed = JSON.parse(json)
      expect(reparsed.name).toBe('Base')
      expect(reparsed.replacementMode).toBe('redact')
    })

    it('round-trips without data loss', () => {
      const manager = createPolicyManager()
      const policy = manager.loadPolicy(BASE_JSON)
      const json = manager.savePolicy(policy)
      const policy2 = manager.loadPolicy(json)
      expect(policy2).toEqual(policy)
    })
  })

  describe('mergeRules', () => {
    it('merges custom rules into base policy', () => {
      const manager = createPolicyManager()
      const base = manager.loadPolicy(BASE_JSON)
      const custom = [{ pattern: 'MY_TOKEN_[A-Z]+', type: 'custom', name: 'My Token' }]
      const merged = manager.mergeRules(base, custom)
      expect(merged.customRules).toHaveLength(1)
      expect(merged.customRules[0]?.pattern).toBe('MY_TOKEN_[A-Z]+')
    })

    it('appends to existing custom rules', () => {
      const manager = createPolicyManager()
      const withRule = JSON.stringify({
        name: 'Base',
        version: '1.0.0',
        detectors: {},
        customRules: [{ pattern: 'EXISTING', type: 'x', name: 'Existing' }],
        replacementMode: 'redact',
      })
      const base = manager.loadPolicy(withRule)
      const merged = manager.mergeRules(base, [{ pattern: 'NEW', type: 'y', name: 'New' }])
      expect(merged.customRules).toHaveLength(2)
    })

    it('does not mutate the base policy', () => {
      const manager = createPolicyManager()
      const base = manager.loadPolicy(BASE_JSON)
      manager.mergeRules(base, [{ pattern: 'X', type: 'x', name: 'X' }])
      expect(base.customRules).toHaveLength(0)
    })

    it('merges detector overrides', () => {
      const manager = createPolicyManager()
      const base = manager.loadPolicy(BASE_JSON)
      const merged = manager.mergeRules(base, [], { gcp: { enabled: true } })
      expect(merged.detectors['gcp']?.enabled).toBe(true)
      expect(merged.detectors['aws']?.enabled).toBe(true)
    })
  })
})
