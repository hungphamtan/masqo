import { describe, it, expect } from 'vitest'
import { detectGcpSecrets } from './gcp.js'
import { detectGithubSecrets } from './github.js'
import { detectStripeSecrets } from './stripe.js'

describe('GCP Secret Detector', () => {
  it('detects GCP API key', () => {
    const input = 'AIzaSyDdI0hCZtE6vySjMm_WMCthHpBxRCFjFh8'
    const result = detectGcpSecrets(input)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]?.type).toBe('gcp-api-key')
  })

  it('detects GCP API key in context', () => {
    const input = 'GOOGLE_API_KEY=AIzaSyDdI0hCZtE6vySjMm_WMCthHpBxRCFjFh8'
    const result = detectGcpSecrets(input)
    expect(result.some((d) => d.type === 'gcp-api-key')).toBe(true)
  })

  it('detects service account JSON key', () => {
    const input = JSON.stringify({
      type: 'service_account',
      private_key: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----\n',
      client_email: 'my-service-account@my-project.iam.gserviceaccount.com',
    })
    const result = detectGcpSecrets(input)
    expect(result.some((d) => d.type === 'gcp-service-account')).toBe(true)
  })

  it('does not flag random strings that start with AIza', () => {
    // Must be exactly 39 chars after AIza
    const input = 'AIzashort'
    const result = detectGcpSecrets(input)
    expect(result.length).toBe(0)
  })

  it('includes source attribution', () => {
    const input = 'AIzaSyDdI0hCZtE6vySjMm_WMCthHpBxRCFjFh8'
    const result = detectGcpSecrets(input)
    expect(result[0]?.source).toBe('detector:secrets/gcp')
  })
})

describe('GitHub Secret Detector', () => {
  it('detects GitHub personal access token (classic)', () => {
    const input = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz'
    const result = detectGithubSecrets(input)
    expect(result.some((d) => d.type === 'github-pat')).toBe(true)
  })

  it('detects GitHub OAuth token', () => {
    const input = 'gho_1234567890abcdefghijklmnopqrstuvwxyz'
    const result = detectGithubSecrets(input)
    expect(result.some((d) => d.type === 'github-oauth')).toBe(true)
  })

  it('detects GitHub Actions token', () => {
    const input = 'ghs_1234567890abcdefghijklmnopqrstuvwxyz'
    const result = detectGithubSecrets(input)
    expect(result.some((d) => d.type === 'github-token')).toBe(true)
  })

  it('detects GitHub refresh token', () => {
    const input = 'ghr_1234567890abcdefghijklmnopqrstuvwxyz'
    const result = detectGithubSecrets(input)
    expect(result.some((d) => d.type === 'github-token')).toBe(true)
  })

  it('does not flag random strings starting with gh', () => {
    const input = 'ghost story about github'
    const result = detectGithubSecrets(input)
    expect(result).toHaveLength(0)
  })

  it('includes source attribution', () => {
    const input = 'ghp_1234567890abcdefghijklmnopqrstuvwxyz'
    const result = detectGithubSecrets(input)
    expect(result[0]?.source).toBe('detector:secrets/github')
  })
})

describe('Stripe Secret Detector', () => {
  it('detects Stripe live secret key', () => {
    const input = 'sk_live_51234567890abcdefghijklmnopqrstuvwxyz'
    const result = detectStripeSecrets(input)
    expect(result.some((d) => d.type === 'stripe-secret-key')).toBe(true)
  })

  it('detects Stripe test secret key', () => {
    const input = 'sk_test_51234567890abcdefghijklmnopqrstuvwxyz'
    const result = detectStripeSecrets(input)
    expect(result.some((d) => d.type === 'stripe-secret-key')).toBe(true)
  })

  it('detects Stripe publishable key', () => {
    const input = 'pk_live_51234567890abcdefghijklmnopqrstuvwxyz'
    const result = detectStripeSecrets(input)
    expect(result.some((d) => d.type === 'stripe-publishable-key')).toBe(true)
  })

  it('live keys have higher confidence than test keys', () => {
    const live = detectStripeSecrets('sk_live_51234567890abcdefghijklmnopqrstuvwxyz')
    const test = detectStripeSecrets('sk_test_51234567890abcdefghijklmnopqrstuvwxyz')
    const liveConf = live.find((d) => d.type === 'stripe-secret-key')!.confidence
    const testConf = test.find((d) => d.type === 'stripe-secret-key')!.confidence
    expect(liveConf).toBeGreaterThan(testConf)
  })

  it('includes source attribution', () => {
    const result = detectStripeSecrets('sk_live_51234567890abcdefghijklmnopqrstuvwxyz')
    expect(result[0]?.source).toBe('detector:secrets/stripe')
  })
})
