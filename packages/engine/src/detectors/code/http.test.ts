import { describe, it, expect } from 'vitest'
import { detectHttpSecrets } from './http.js'

describe('HTTP Headers & Payload Detector', () => {
  it('detects Authorization header with Bearer token', () => {
    const input = 'Authorization: Bearer abc123XYZ456def789GHI012jkl'
    const result = detectHttpSecrets(input)
    expect(result.some((d) => d.type === 'http-auth-header')).toBe(true)
  })

  it('detects Cookie header', () => {
    const input = 'Cookie: session=abc123def456ghi789jkl012'
    const result = detectHttpSecrets(input)
    expect(result.some((d) => d.type === 'http-cookie-header')).toBe(true)
  })

  it('detects X-API-Key header', () => {
    const input = 'X-API-Key: sk_live_abc123def456ghi789'
    const result = detectHttpSecrets(input)
    expect(result.some((d) => d.type === 'http-api-key-header')).toBe(true)
  })

  it('detects Set-Cookie response header', () => {
    const input = 'Set-Cookie: session=abc123def456; Path=/; HttpOnly; Secure'
    const result = detectHttpSecrets(input)
    expect(result.some((d) => d.type === 'http-cookie-header')).toBe(true)
  })

  it('detects password field in JSON body', () => {
    const input = '{"username":"admin","password":"supersecret"}'
    const result = detectHttpSecrets(input)
    expect(result.some((d) => d.type === 'json-credential-field')).toBe(true)
  })

  it('detects token field in JSON body', () => {
    const input = '{"access_token":"abc123def456ghi789"}'
    const result = detectHttpSecrets(input)
    expect(result.some((d) => d.type === 'json-credential-field')).toBe(true)
  })

  it('detects in multiline HTTP log', () => {
    const input = `POST /login HTTP/1.1
Authorization: Bearer abc123XYZ456def789GHI012jkl
Content-Type: application/json

{"username":"admin","password":"secret"}`
    const result = detectHttpSecrets(input)
    expect(result.some((d) => d.type === 'http-auth-header')).toBe(true)
    expect(result.some((d) => d.type === 'json-credential-field')).toBe(true)
  })

  it('includes source attribution', () => {
    const result = detectHttpSecrets('Authorization: Bearer abc123XYZ456def789GHI')
    expect(result[0]?.source).toBe('detector:code/http')
  })
})
