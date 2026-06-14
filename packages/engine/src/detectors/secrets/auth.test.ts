import { describe, it, expect } from 'vitest'
import { detectJwt } from './jwt.js'
import { detectBearerTokens } from './bearer.js'
import { detectCookies } from './cookies.js'

const REAL_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

describe('JWT Detector', () => {
  it('detects a valid JWT', () => {
    const result = detectJwt(REAL_JWT)
    expect(result.some((d) => d.type === 'jwt')).toBe(true)
  })

  it('detects JWT in Authorization header', () => {
    const input = `Authorization: Bearer ${REAL_JWT}`
    const result = detectJwt(input)
    expect(result.some((d) => d.type === 'jwt')).toBe(true)
  })

  it('does not flag two-segment base64', () => {
    const input = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3OCJ9'
    const result = detectJwt(input)
    // 2 segments is not a valid JWT
    expect(result).toHaveLength(0)
  })

  it('returns correct position', () => {
    const prefix = 'token='
    const input = `${prefix}${REAL_JWT}`
    const result = detectJwt(input)
    expect(result[0]?.position.start).toBe(prefix.length)
  })

  it('includes source attribution', () => {
    const result = detectJwt(REAL_JWT)
    expect(result[0]?.source).toBe('detector:secrets/jwt')
  })
})

describe('Bearer Token Detector', () => {
  it('detects Bearer token in Authorization header', () => {
    const input = 'Authorization: Bearer abc123XYZ456def789'
    const result = detectBearerTokens(input)
    expect(result.some((d) => d.type === 'bearer-token')).toBe(true)
  })

  it('detects Bearer token case-insensitively', () => {
    const input = 'authorization: bearer abc123XYZ456def789'
    const result = detectBearerTokens(input)
    expect(result.some((d) => d.type === 'bearer-token')).toBe(true)
  })

  it('does not flag very short tokens', () => {
    const input = 'Authorization: Bearer abc'
    const result = detectBearerTokens(input)
    expect(result).toHaveLength(0)
  })

  it('includes source attribution', () => {
    const input = 'Authorization: Bearer abc123XYZ456def789GHI'
    const result = detectBearerTokens(input)
    expect(result[0]?.source).toBe('detector:secrets/bearer')
  })
})

describe('Cookie Detector', () => {
  it('detects session cookie', () => {
    const input = 'Cookie: session=abc123def456ghi789jkl012mno345pqr678'
    const result = detectCookies(input)
    expect(result.some((d) => d.type === 'session-cookie')).toBe(true)
  })

  it('detects auth cookie', () => {
    const input = 'Cookie: auth_token=abc123def456ghi789jkl012mno345pqr678'
    const result = detectCookies(input)
    expect(result.some((d) => d.type === 'auth-cookie')).toBe(true)
  })

  it('detects Set-Cookie response header', () => {
    const input = 'Set-Cookie: session=abc123def456ghi789jkl012; Path=/; HttpOnly'
    const result = detectCookies(input)
    expect(result.some((d) => d.type === 'session-cookie')).toBe(true)
  })

  it('does not flag innocuous cookies', () => {
    const input = 'Cookie: theme=dark; locale=en-US'
    const result = detectCookies(input)
    expect(result).toHaveLength(0)
  })

  it('includes source attribution', () => {
    const input = 'Cookie: session=abc123def456ghi789jkl012mno345pqr678'
    const result = detectCookies(input)
    expect(result[0]?.source).toBe('detector:secrets/cookies')
  })
})
