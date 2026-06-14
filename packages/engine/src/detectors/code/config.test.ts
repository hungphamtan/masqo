import { describe, it, expect } from 'vitest'
import { detectConfigSecrets } from './config.js'

describe('Config Blob Detector', () => {
  it('detects password in JSON', () => {
    const input = JSON.stringify({ database: { password: 'hunter2' } })
    const result = detectConfigSecrets(input)
    expect(result.some((d) => d.type === 'config-secret')).toBe(true)
  })

  it('detects apiKey in JSON', () => {
    const input = JSON.stringify({ api: { apiKey: 'abc123secret' } })
    const result = detectConfigSecrets(input)
    expect(result.some((d) => d.type === 'config-secret')).toBe(true)
  })

  it('detects secretKey in JSON', () => {
    const input = JSON.stringify({ secretKey: 'verysecret123' })
    const result = detectConfigSecrets(input)
    expect(result.some((d) => d.type === 'config-secret')).toBe(true)
  })

  it('detects nested secrets', () => {
    const input = JSON.stringify({
      database: { password: 'hunter2' },
      api: { secretKey: 'abc123' },
    })
    const result = detectConfigSecrets(input)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('detects YAML-style secrets', () => {
    const input = `
database:
  password: hunter2
api:
  secret_key: mysecret123
`
    const result = detectConfigSecrets(input)
    expect(result.some((d) => d.type === 'config-secret')).toBe(true)
  })

  it('does not flag empty values', () => {
    const input = JSON.stringify({ password: '' })
    const result = detectConfigSecrets(input)
    expect(result).toHaveLength(0)
  })

  it('does not flag keys without sensitive terms', () => {
    const input = JSON.stringify({ host: 'localhost', port: 5432, name: 'mydb' })
    const result = detectConfigSecrets(input)
    expect(result).toHaveLength(0)
  })

  it('includes source attribution', () => {
    const result = detectConfigSecrets('{"password":"hunter2"}')
    expect(result[0]?.source).toBe('detector:code/config')
  })

  it('returns position covering the key-value pair', () => {
    const input = '{"password":"hunter2"}'
    const result = detectConfigSecrets(input)
    expect(result[0]?.position.start).toBeGreaterThanOrEqual(0)
    expect(input.slice(result[0]!.position.start, result[0]!.position.end)).toContain('password')
  })
})
