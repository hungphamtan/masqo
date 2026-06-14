/**
 * Cross-package integration: CLI → Engine → Output
 * Same input produces same detections whether called via engine API or CLI binary.
 */
import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'
import { resolve } from 'path'
import { createEngine } from '@masqo/engine'
import { ReplacementMode } from '@masqo/shared'

const BIN = resolve(__dirname, '../../packages/cli/bin/masqo.js')

function cli(args: string, input = ''): { stdout: string; code: number } {
  const r = spawnSync('node', [BIN, ...args.split(' ')], {
    input, encoding: 'utf8', timeout: 15000,
  })
  return { stdout: r.stdout ?? '', code: r.status ?? 1 }
}

const TEST_CASES = [
  { label: 'AWS access key',     input: 'key: AKIAIOSFODNN7EXAMPLE',       type: 'aws-access-key' },
  { label: 'GitHub PAT',         input: 'ghp_1234567890abcdefghijklmnopqrstuvwxyz12', type: 'github-pat' },
  { label: 'Stripe live key',    input: 'sk_live_51234567890abcdefghijklmnopqrstuvwxyz', type: 'stripe-secret-key' },
  { label: 'JWT',                input: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', type: 'jwt' },
  { label: 'DB connection string', input: 'postgresql://admin:secret@localhost/db', type: 'database-connection-string' },
  { label: 'OpenAI key',         input: 'sk-proj-aBcDeFgHiJkLmNoPqRsT3BlbkFJxYzAbCdEfGhIjKlMnOPQ', type: 'openai-api-key' },
  { label: 'Env secret',         input: 'API_KEY=sk_live_abc123', type: 'env-secret' },
  { label: 'Private key',        input: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpA...\n-----END RSA PRIVATE KEY-----', type: 'private-key' },
]

describe('Engine API ↔ CLI parity', () => {
  const engine = createEngine()

  for (const tc of TEST_CASES) {
    it(`${tc.label}: engine and CLI both detect ${tc.type}`, () => {
      // Engine API
      const result = engine.scan(tc.input, { mode: ReplacementMode.Redact })
      expect(result.detections.some((d) => d.type === tc.type), `engine missed ${tc.type}`).toBe(true)

      // CLI --format json
      const r = cli('redact --format json', tc.input)
      expect(r.code).toBe(0)
      const parsed = JSON.parse(r.stdout)
      expect(parsed.detections.some((d: { type: string }) => d.type === tc.type), `CLI missed ${tc.type}`).toBe(true)
    })
  }

  it('CLI output matches engine output for redact mode', () => {
    const input = 'key: AKIAIOSFODNN7EXAMPLE'
    const engineResult = engine.scan(input, { mode: ReplacementMode.Redact })
    const cliResult = cli('redact', input)
    expect(cliResult.stdout.trim()).toBe(engineResult.output)
  })

  it('policy portable: developer preset same behavior via API and CLI', () => {
    const input = 'AKIAIOSFODNN7EXAMPLE'
    const engineResult = engine.scan(input, { mode: ReplacementMode.Redact, presetName: 'developer' })
    const cliResult = cli('redact --policy developer --format json', input)
    const cliParsed = JSON.parse(cliResult.stdout)
    // Both should tokenize (developer preset overrides mode)
    expect(engineResult.output).toMatch(/TOKEN_/)
    expect(cliParsed.output).toMatch(/TOKEN_/)
  })
})
