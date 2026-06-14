import { describe, it, expect } from 'vitest'
import { parsePolicy, PolicyParseError } from './parser.js'

const VALID_POLICY = {
  name: 'Developer',
  version: '1.0.0',
  detectors: {
    secrets: { enabled: true },
    pii: { enabled: false },
  },
  customRules: [],
  replacementMode: 'tokenize',
}

describe('Policy Parser', () => {
  it('parses a valid policy', () => {
    const result = parsePolicy(JSON.stringify(VALID_POLICY))
    expect(result.name).toBe('Developer')
    expect(result.version).toBe('1.0.0')
    expect(result.replacementMode).toBe('tokenize')
  })

  it('parses all replacement modes', () => {
    for (const mode of ['redact', 'tokenize', 'partial', 'warn']) {
      const json = JSON.stringify({ ...VALID_POLICY, replacementMode: mode })
      expect(parsePolicy(json).replacementMode).toBe(mode)
    }
  })

  it('rejects invalid JSON', () => {
    expect(() => parsePolicy('not json')).toThrow(PolicyParseError)
  })

  it('rejects missing required field: name', () => {
    const { name: _, ...noName } = VALID_POLICY
    expect(() => parsePolicy(JSON.stringify(noName))).toThrow(PolicyParseError)
  })

  it('rejects missing required field: version', () => {
    const { version: _, ...noVersion } = VALID_POLICY
    expect(() => parsePolicy(JSON.stringify(noVersion))).toThrow(PolicyParseError)
  })

  it('rejects invalid replacementMode', () => {
    const bad = { ...VALID_POLICY, replacementMode: 'destroy' }
    expect(() => parsePolicy(JSON.stringify(bad))).toThrow(PolicyParseError)
  })

  it('rejects invalid version format (non-semver)', () => {
    const bad = { ...VALID_POLICY, version: 'not-a-version' }
    expect(() => parsePolicy(JSON.stringify(bad))).toThrow(PolicyParseError)
  })

  it('accepts missing optional detectors field (defaults to empty)', () => {
    const { detectors: _, ...noDetectors } = VALID_POLICY
    const result = parsePolicy(JSON.stringify(noDetectors))
    expect(result.detectors).toEqual({})
  })

  it('accepts missing optional customRules field (defaults to empty array)', () => {
    const { customRules: _, ...noRules } = VALID_POLICY
    const result = parsePolicy(JSON.stringify(noRules))
    expect(result.customRules).toEqual([])
  })

  it('validates custom rule requires pattern, type, name', () => {
    const bad = {
      ...VALID_POLICY,
      customRules: [{ pattern: 'foo' }], // missing type and name
    }
    expect(() => parsePolicy(JSON.stringify(bad))).toThrow(PolicyParseError)
  })

  it('validates custom rule regex pattern compiles', () => {
    const bad = {
      ...VALID_POLICY,
      customRules: [{ pattern: '[invalid(regex', type: 'custom', name: 'bad' }],
    }
    expect(() => parsePolicy(JSON.stringify(bad))).toThrow(PolicyParseError)
  })

  it('accepts valid custom rule', () => {
    const good = {
      ...VALID_POLICY,
      customRules: [{ pattern: 'MY_SECRET_[A-Z]+', type: 'custom-secret', name: 'My Secret' }],
    }
    const result = parsePolicy(JSON.stringify(good))
    expect(result.customRules).toHaveLength(1)
    expect(result.customRules[0]?.pattern).toBe('MY_SECRET_[A-Z]+')
  })

  it('error message identifies the failing field', () => {
    const bad = { ...VALID_POLICY, replacementMode: 'destroy' }
    try {
      parsePolicy(JSON.stringify(bad))
      expect.fail('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(PolicyParseError)
      expect((e as PolicyParseError).message).toContain('replacementMode')
    }
  })
})
