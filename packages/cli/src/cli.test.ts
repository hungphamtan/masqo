import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import { resolve } from 'path'

const BIN = resolve(import.meta.dirname, '../bin/masqo.js')

function run(args: string): { stdout: string; stderr: string; code: number } {
  try {
    const stdout = execSync(`node ${BIN} ${args}`, { encoding: 'utf8' })
    return { stdout, stderr: '', code: 0 }
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number }
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      code: err.status ?? 1,
    }
  }
}

describe('CLI structure (Task 4.1)', () => {
  it('--help exits 0 and shows usage', () => {
    const r = run('--help')
    expect(r.code).toBe(0)
    expect(r.stdout).toContain('masqo')
    expect(r.stdout).toContain('redact')
  })

  it('--version exits 0', () => {
    const r = run('--version')
    expect(r.code).toBe(0)
    expect(r.stdout.trim()).toMatch(/\d+\.\d+\.\d+/)
  })

  it('redact --help shows redact usage', () => {
    const r = run('redact --help')
    expect(r.code).toBe(0)
    expect(r.stdout).toContain('redact')
    expect(r.stdout).toContain('--mode')
  })

  it('config --help shows config usage', () => {
    const r = run('config --help')
    expect(r.code).toBe(0)
    expect(r.stdout).toContain('config')
  })
})
