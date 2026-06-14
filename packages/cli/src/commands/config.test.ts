import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { spawnSync } from 'child_process'
import { resolve } from 'path'
import { rmSync, existsSync } from 'fs'
import { tmpdir } from 'os'

const BIN = resolve(import.meta.dirname, '../../bin/masqo.js')
const TEST_CONFIG_DIR = resolve(tmpdir(), 'masqo-test-config')

function run(args: string[]): { stdout: string; stderr: string; code: number } {
  const r = spawnSync('node', [BIN, ...args], {
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, MASQO_CONFIG_DIR: TEST_CONFIG_DIR },
  })
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', code: r.status ?? 1 }
}

beforeEach(() => {
  if (existsSync(TEST_CONFIG_DIR)) rmSync(TEST_CONFIG_DIR, { recursive: true })
})

afterEach(() => {
  if (existsSync(TEST_CONFIG_DIR)) rmSync(TEST_CONFIG_DIR, { recursive: true })
})

describe('config command (Task 4.4)', () => {
  it('config get shows default state when no config exists', () => {
    const r = run(['config', 'get'])
    expect(r.code).toBe(0)
    expect(r.stdout).toContain('policy')
  })

  it('config set-policy developer persists', () => {
    run(['config', 'set-policy', 'developer'])
    const r = run(['config', 'get'])
    expect(r.stdout).toContain('developer')
  })

  it('config set-policy general persists', () => {
    run(['config', 'set-policy', 'general'])
    const r = run(['config', 'get'])
    expect(r.stdout).toContain('general')
  })

  it('config set-policy invalid name exits with error', () => {
    const r = run(['config', 'set-policy', 'nonexistent'])
    expect(r.code).not.toBe(0)
    expect(r.stderr).toMatch(/invalid|unknown|error/i)
  })

  it('config add-rule adds a custom rule', () => {
    run(['config', 'add-rule', '--pattern', 'CORP_[A-Z]+', '--type', 'corp-secret', '--name', 'Corp Secret'])
    const r = run(['config', 'get'])
    expect(r.stdout).toContain('CORP_[A-Z]+')
  })

  it('config add-rule rejects invalid regex', () => {
    const r = run(['config', 'add-rule', '--pattern', '[invalid(', '--type', 'x', '--name', 'x'])
    expect(r.code).not.toBe(0)
    expect(r.stderr).toMatch(/invalid|regex|error/i)
  })
})
