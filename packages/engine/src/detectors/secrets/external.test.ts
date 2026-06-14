import { describe, it, expect } from 'vitest'
import { detectPrivateKeys } from './privatekeys.js'
import { detectSlackSecrets } from './slack.js'
import { detectOpenAiSecrets } from './openai.js'
import { detectGitlabSecrets } from './gitlab.js'
import { detectSendgridSecrets } from './sendgrid.js'
import { detectTwilioSecrets } from './twilio.js'
import { detectNpmSecrets } from './npm.js'
import { detectPypiSecrets } from './pypi.js'
import { detectAzureSecrets } from './azure.js'
import { detectBasicAuthUrls } from './basicauth.js'

describe('Private Key Detector', () => {
  it('detects RSA private key', () => {
    const input = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----'
    expect(detectPrivateKeys(input).some((d) => d.type === 'private-key')).toBe(true)
  })

  it('detects EC private key', () => {
    const input = '-----BEGIN EC PRIVATE KEY-----\nMHQCAQEE...\n-----END EC PRIVATE KEY-----'
    expect(detectPrivateKeys(input).some((d) => d.type === 'private-key')).toBe(true)
  })

  it('detects OpenSSH private key', () => {
    const input = '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC...\n-----END OPENSSH PRIVATE KEY-----'
    expect(detectPrivateKeys(input).some((d) => d.type === 'private-key')).toBe(true)
  })

  it('detects generic PRIVATE KEY', () => {
    const input = '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANB...\n-----END PRIVATE KEY-----'
    expect(detectPrivateKeys(input).some((d) => d.type === 'private-key')).toBe(true)
  })

  it('detects PGP private key', () => {
    const input = '-----BEGIN PGP PRIVATE KEY BLOCK-----\nVersion: GnuPG\n\nlQOYBF...\n-----END PGP PRIVATE KEY BLOCK-----'
    expect(detectPrivateKeys(input).some((d) => d.type === 'private-key')).toBe(true)
  })

  it('does not flag public key', () => {
    const input = '-----BEGIN PUBLIC KEY-----\nMIIBIjAN...\n-----END PUBLIC KEY-----'
    expect(detectPrivateKeys(input)).toHaveLength(0)
  })

  it('includes source attribution', () => {
    const input = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpA...\n-----END RSA PRIVATE KEY-----'
    expect(detectPrivateKeys(input)[0]?.source).toBe('detector:secrets/privatekeys')
  })
})

describe('Slack Secret Detector', () => {
  it('detects Slack bot token', () => {
    expect(detectSlackSecrets('xoxb-123456789012-1234567890123-aBcDeFgHiJkLmNoPqRsTuVwX').some((d) => d.type === 'slack-token')).toBe(true)
  })

  it('detects Slack app token', () => {
    expect(detectSlackSecrets('xoxp-123456789012-1234567890123-aBcDeFgHiJkLmNoPqRsTuVwX').some((d) => d.type === 'slack-token')).toBe(true)
  })

  it('detects Slack webhook URL', () => {
    const input = 'https://hooks.slack.com/services/TXXXXXXXXX/BXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX'
    expect(detectSlackSecrets(input).some((d) => d.type === 'slack-webhook')).toBe(true)
  })

  it('does not flag random xox string', () => {
    expect(detectSlackSecrets('xoxygen molecule')).toHaveLength(0)
  })

  it('includes source attribution', () => {
    expect(detectSlackSecrets('xoxb-123456789012-1234567890123-aBcDeFgHiJkLmNoPqRsTuVwX')[0]?.source).toBe('detector:secrets/slack')
  })
})

describe('OpenAI Secret Detector', () => {
  it('detects OpenAI API key', () => {
    const input = 'sk-proj-aBcDeFgHiJkLmNoPqRsT3BlbkFJxYzAbCdEfGhIjKlMnOPQ'
    expect(detectOpenAiSecrets(input).some((d) => d.type === 'openai-api-key')).toBe(true)
  })

  it('detects legacy OpenAI key format', () => {
    const input = 'sk-aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDT3BlbkFJaBcDeFgHiJkLmNoPqRsT'
    expect(detectOpenAiSecrets(input).some((d) => d.type === 'openai-api-key')).toBe(true)
  })

  it('does not flag generic sk- strings', () => {
    expect(detectOpenAiSecrets('sk-short')).toHaveLength(0)
  })

  it('includes source attribution', () => {
    const input = 'sk-proj-aBcDeFgHiJkLmNoPqRsT3BlbkFJxYzAbCdEfGhIjKlMnOPQ'
    expect(detectOpenAiSecrets(input)[0]?.source).toBe('detector:secrets/openai')
  })
})

describe('GitLab Secret Detector', () => {
  it('detects GitLab PAT', () => {
    expect(detectGitlabSecrets('glpat-aBcDeFgHiJkLmNoPqRsT').some((d) => d.type === 'gitlab-token')).toBe(true)
  })

  it('detects GitLab deploy token', () => {
    expect(detectGitlabSecrets('gldt-aBcDeFgHiJkLmNoPqRsT').some((d) => d.type === 'gitlab-token')).toBe(true)
  })

  it('detects GitLab runner token', () => {
    expect(detectGitlabSecrets('glrt-aBcDeFgHiJkLmNoPqRsT').some((d) => d.type === 'gitlab-token')).toBe(true)
  })

  it('includes source attribution', () => {
    expect(detectGitlabSecrets('glpat-aBcDeFgHiJkLmNoPqRsT')[0]?.source).toBe('detector:secrets/gitlab')
  })
})

describe('SendGrid Secret Detector', () => {
  it('detects SendGrid API key', () => {
    const input = 'SG.aBcDeFgHiJkLmNoPqRsTuV.aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPq'
    expect(detectSendgridSecrets(input).some((d) => d.type === 'sendgrid-api-key')).toBe(true)
  })

  it('does not flag short SG. strings', () => {
    expect(detectSendgridSecrets('SG.short.x')).toHaveLength(0)
  })

  it('includes source attribution', () => {
    const input = 'SG.aBcDeFgHiJkLmNoPqRsTuV.aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPq'
    expect(detectSendgridSecrets(input)[0]?.source).toBe('detector:secrets/sendgrid')
  })
})

describe('Twilio Secret Detector', () => {
  it('detects Twilio Account SID', () => {
    const input = 'AC1234567890abcdef1234567890abcdef'
    expect(detectTwilioSecrets(input).some((d) => d.type === 'twilio-account-sid')).toBe(true)
  })

  it('detects Twilio Auth Token', () => {
    const input = 'SK1234567890abcdef1234567890abcdef'
    expect(detectTwilioSecrets(input).some((d) => d.type === 'twilio-auth-token')).toBe(true)
  })

  it('includes source attribution', () => {
    expect(detectTwilioSecrets('AC1234567890abcdef1234567890abcdef')[0]?.source).toBe('detector:secrets/twilio')
  })
})

describe('NPM Secret Detector', () => {
  it('detects npm auth token (npm_ prefix)', () => {
    const input = '//.npmjs.org/:_authToken=npm_1234567890abcdefghijklmnopqrstuv'
    expect(detectNpmSecrets(input).some((d) => d.type === 'npm-auth-token')).toBe(true)
  })

  it('detects npm auth token (UUID format)', () => {
    const input = '//.npmjs.org/:_authToken=a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    expect(detectNpmSecrets(input).some((d) => d.type === 'npm-auth-token')).toBe(true)
  })

  it('includes source attribution', () => {
    const input = '//.npmjs.org/:_authToken=npm_abc123'
    expect(detectNpmSecrets(input)[0]?.source).toBe('detector:secrets/npm')
  })
})

describe('PyPI Secret Detector', () => {
  it('detects PyPI upload token', () => {
    const input = 'pypi-AgEIcHlwaS5vcmcaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZABCDEFG'
    expect(detectPypiSecrets(input).some((d) => d.type === 'pypi-token')).toBe(true)
  })

  it('includes source attribution', () => {
    const input = 'pypi-AgEIcHlwaS5vcmcaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZABCDEFG'
    expect(detectPypiSecrets(input)[0]?.source).toBe('detector:secrets/pypi')
  })
})

describe('Azure Secret Detector', () => {
  it('detects Azure Storage Account Key', () => {
    const input = 'AccountKey=aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgH=='
    expect(detectAzureSecrets(input).some((d) => d.type === 'azure-storage-key')).toBe(true)
  })

  it('includes source attribution', () => {
    const input = 'AccountKey=aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgH=='
    expect(detectAzureSecrets(input)[0]?.source).toBe('detector:secrets/azure')
  })
})

describe('Basic Auth URL Detector', () => {
  it('detects basic auth in HTTPS URL', () => {
    const input = 'https://user:password@example.com/api'
    expect(detectBasicAuthUrls(input).some((d) => d.type === 'basic-auth-url')).toBe(true)
  })

  it('detects basic auth in HTTP URL', () => {
    const input = 'http://admin:secret123@internal.example.com'
    expect(detectBasicAuthUrls(input).some((d) => d.type === 'basic-auth-url')).toBe(true)
  })

  it('does not flag DB connection strings (already covered by database detector)', () => {
    // postgres/mysql/mongodb/redis — handled by database detector, no double-flag
    const input = 'postgresql://user:pass@localhost/db'
    expect(detectBasicAuthUrls(input)).toHaveLength(0)
  })

  it('includes source attribution', () => {
    expect(detectBasicAuthUrls('https://user:pass@example.com')[0]?.source).toBe('detector:secrets/basicauth')
  })
})
