import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { spawnSync } from 'child_process'
import { resolve } from 'path'
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'

const BIN = resolve(import.meta.dirname, '../../bin/masqo.js')

function run(args: string[]): { stdout: string; stderr: string; code: number } {
  const r = spawnSync('node', [BIN, ...args], { encoding: 'utf8', timeout: 10000 })
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', code: r.status ?? 1 }
}

const tmpIn = resolve(tmpdir(), 'masqo-test-input.txt')
const tmpOut = resolve(tmpdir(), 'masqo-test-output.txt')

beforeEach(() => {
  writeFileSync(tmpIn, 'AWS key: AKIAIOSFODNN7EXAMPLE\nhello world\n', 'utf8')
})

afterEach(() => {
  if (existsSync(tmpIn)) unlinkSync(tmpIn)
  if (existsSync(tmpOut)) unlinkSync(tmpOut)
})

describe('redact command - file input (Task 4.3)', () => {
  it('reads from file argument', () => {
    const r = run(['redact', tmpIn])
    expect(r.code).toBe(0)
    expect(r.stdout).toContain('[REDACTED:aws-access-key]')
    expect(r.stdout).not.toContain('AKIAIOSFODNN7EXAMPLE')
  })

  it('preserves non-secret lines', () => {
    const r = run(['redact', tmpIn])
    expect(r.stdout).toContain('hello world')
  })

  it('--output writes redacted content to file', () => {
    const r = run(['redact', tmpIn, '--output', tmpOut])
    expect(r.code).toBe(0)
    const content = readFileSync(tmpOut, 'utf8')
    expect(content).toContain('[REDACTED:aws-access-key]')
    expect(content).not.toContain('AKIAIOSFODNN7EXAMPLE')
  })

  it('--output writes nothing to stdout', () => {
    const r = run(['redact', tmpIn, '--output', tmpOut])
    expect(r.stdout.trim()).toBe('')
  })

  it('missing file exits with error message', () => {
    const r = run(['redact', '/nonexistent/file.txt'])
    expect(r.code).not.toBe(0)
    expect(r.stderr).toMatch(/no such file|ENOENT|error/i)
  })

  it('preserves UTF-8 encoding', () => {
    writeFileSync(tmpIn, 'Hello 世界 AKIAIOSFODNN7EXAMPLE café\n', 'utf8')
    const r = run(['redact', tmpIn])
    expect(r.stdout).toContain('世界')
    expect(r.stdout).toContain('café')
  })
})
