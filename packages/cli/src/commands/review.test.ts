import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'
import { resolve } from 'path'
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs'
import { tmpdir } from 'os'

const BIN = resolve(import.meta.dirname, '../../bin/masqo.js')
const tmpIn = resolve(tmpdir(), 'masqo-review-test.txt')
const tmpOut = resolve(tmpdir(), 'masqo-review-out.txt')

function run(args: string[], input = ''): { stdout: string; stderr: string; code: number } {
  const r = spawnSync('node', [BIN, ...args], {
    input,
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, CI: '1' }, // forces non-interactive mode
  })
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', code: r.status ?? 1 }
}

afterEach(() => {
  if (existsSync(tmpIn)) unlinkSync(tmpIn)
  if (existsSync(tmpOut)) unlinkSync(tmpOut)
})

describe('review command (Tasks 5.1-5.4)', () => {
  describe('non-interactive / CI mode', () => {
    it('review --help exits 0', () => {
      const r = run(['review', '--help'])
      expect(r.code).toBe(0)
      expect(r.stdout).toContain('review')
    })

    it('in CI mode accepts all detections and redacts output', () => {
      writeFileSync(tmpIn, 'AWS key: AKIAIOSFODNN7EXAMPLE\nhello world\n', 'utf8')
      const r = run(['review', tmpIn, '--accept-all'])
      expect(r.code).toBe(0)
      expect(r.stdout).toContain('[REDACTED:aws-access-key]')
      expect(r.stdout).not.toContain('AKIAIOSFODNN7EXAMPLE')
    })

    it('--reject-all preserves original content', () => {
      writeFileSync(tmpIn, 'AWS key: AKIAIOSFODNN7EXAMPLE\n', 'utf8')
      const r = run(['review', tmpIn, '--reject-all'])
      expect(r.code).toBe(0)
      expect(r.stdout).toContain('AKIAIOSFODNN7EXAMPLE')
    })

    it('--output writes result to file', () => {
      writeFileSync(tmpIn, 'AWS key: AKIAIOSFODNN7EXAMPLE\n', 'utf8')
      run(['review', tmpIn, '--accept-all', '--output', tmpOut])
      expect(existsSync(tmpOut)).toBe(true)
      const content = readFileSync(tmpOut, 'utf8')
      expect(content).toContain('[REDACTED:aws-access-key]')
    })

    it('no detections exits 0 with clean message', () => {
      writeFileSync(tmpIn, 'hello world no secrets\n', 'utf8')
      const r = run(['review', tmpIn, '--accept-all'])
      expect(r.code).toBe(0)
    })

    it('--format json outputs JSON with accepted/rejected counts', () => {
      writeFileSync(tmpIn, 'AKIAIOSFODNN7EXAMPLE\n', 'utf8')
      const r = run(['review', tmpIn, '--accept-all', '--format', 'json'])
      expect(r.code).toBe(0)
      const parsed = JSON.parse(r.stdout)
      expect(parsed).toHaveProperty('output')
      expect(parsed).toHaveProperty('accepted')
      expect(parsed).toHaveProperty('rejected')
      expect(parsed.accepted).toBeGreaterThan(0)
    })

    it('reads from stdin when no file given', () => {
      const r = run(['review', '--accept-all'], 'AKIAIOSFODNN7EXAMPLE\n')
      expect(r.code).toBe(0)
      expect(r.stdout).toContain('[REDACTED:aws-access-key]')
    })
  })
})
