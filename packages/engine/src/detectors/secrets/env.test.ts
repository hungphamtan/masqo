import { describe, it, expect } from 'vitest'
import { detectEnvSecrets } from './env.js'

describe('Environment Variable Detector', () => {
  it('detects API_KEY assignment', () => {
    const input = 'API_KEY=sk_live_123456'
    const result = detectEnvSecrets(input)
    expect(result.some((d) => d.type === 'env-secret')).toBe(true)
  })

  it('detects SECRET assignment', () => {
    const input = 'MY_SECRET=hunter2'
    const result = detectEnvSecrets(input)
    expect(result.some((d) => d.type === 'env-secret')).toBe(true)
  })

  it('detects PASSWORD assignment', () => {
    const input = 'DATABASE_PASSWORD=hunter2'
    const result = detectEnvSecrets(input)
    expect(result.some((d) => d.type === 'env-secret')).toBe(true)
  })

  it('detects TOKEN assignment', () => {
    const input = 'ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9'
    const result = detectEnvSecrets(input)
    expect(result.some((d) => d.type === 'env-secret')).toBe(true)
  })

  it('is case-insensitive for key names', () => {
    const input = 'api_key=abc123'
    const result = detectEnvSecrets(input)
    expect(result.some((d) => d.type === 'env-secret')).toBe(true)
  })

  it('detects PRIVATE_KEY assignment', () => {
    const input = 'PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----'
    const result = detectEnvSecrets(input)
    expect(result.some((d) => d.type === 'env-secret')).toBe(true)
  })

  it('does not flag empty values', () => {
    const input = 'API_KEY='
    const result = detectEnvSecrets(input)
    expect(result).toHaveLength(0)
  })

  it('does not flag innocent env vars', () => {
    const input = 'NODE_ENV=production\nPORT=3000\nHOST=localhost'
    const result = detectEnvSecrets(input)
    expect(result).toHaveLength(0)
  })

  it('detects multiple env secrets in .env file', () => {
    const input = `
API_KEY=sk_live_123456
DATABASE_PASSWORD=hunter2
STRIPE_SECRET=sk_test_abc123
`
    const result = detectEnvSecrets(input)
    expect(result.length).toBeGreaterThanOrEqual(3)
  })

  it('includes source attribution', () => {
    const result = detectEnvSecrets('API_KEY=abc123')
    expect(result[0]?.source).toBe('detector:secrets/env')
  })
})
