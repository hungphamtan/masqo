import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { spawnSync } from 'child_process'
import { resolve } from 'path'
import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { tmpdir } from 'os'

const BIN = resolve(import.meta.dirname, '../../bin/masqo.js')
const TEST_CLAUDE_DIR = resolve(tmpdir(), 'masqo-hook-test-claude')

function run(args: string[]): { stdout: string; stderr: string; code: number } {
  const r = spawnSync('node', [BIN, ...args], {
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, MASQO_CLAUDE_DIR: TEST_CLAUDE_DIR },
  })
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', code: r.status ?? 1 }
}

beforeEach(() => {
  if (existsSync(TEST_CLAUDE_DIR)) rmSync(TEST_CLAUDE_DIR, { recursive: true })
  mkdirSync(TEST_CLAUDE_DIR, { recursive: true })
})

afterEach(() => {
  if (existsSync(TEST_CLAUDE_DIR)) rmSync(TEST_CLAUDE_DIR, { recursive: true })
})

describe('install-hook command (Task 6.1)', () => {
  it('install-hook --help exits 0', () => {
    const r = run(['install-hook', '--help'])
    expect(r.code).toBe(0)
    expect(r.stdout).toContain('install-hook')
  })

  it('installs hook into new settings.json', () => {
    const r = run(['install-hook', 'claude-code'])
    expect(r.code).toBe(0)
    const settingsPath = resolve(TEST_CLAUDE_DIR, 'settings.json')
    expect(existsSync(settingsPath)).toBe(true)
    const settings = JSON.parse(readFileSync(settingsPath, 'utf8'))
    expect(JSON.stringify(settings)).toContain('masqo')
  })

  it('adds hook to existing settings.json', () => {
    const settingsPath = resolve(TEST_CLAUDE_DIR, 'settings.json')
    writeFileSync(settingsPath, JSON.stringify({ permissions: { allow: [] } }), 'utf8')
    run(['install-hook', 'claude-code'])
    const settings = JSON.parse(readFileSync(settingsPath, 'utf8'))
    expect(JSON.stringify(settings)).toContain('masqo')
  })

  it('does not duplicate hook if already installed', () => {
    run(['install-hook', 'claude-code'])
    run(['install-hook', 'claude-code'])
    const settingsPath = resolve(TEST_CLAUDE_DIR, 'settings.json')
    const content = readFileSync(settingsPath, 'utf8')
    const occurrences = (content.match(/masqo redact --hook/g) ?? []).length
    expect(occurrences).toBe(1)
  })

  it('unknown hook target exits with error', () => {
    const r = run(['install-hook', 'vscode'])
    expect(r.code).not.toBe(0)
    expect(r.stderr).toMatch(/unknown|unsupported|error/i)
  })
})
