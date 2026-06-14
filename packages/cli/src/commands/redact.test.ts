import { describe, it, expect } from 'vitest'
import { execSync, spawnSync } from 'child_process'
import { resolve } from 'path'

const BIN = resolve(import.meta.dirname, '../../bin/masqo.js')

function pipe(input: string, args: string): { stdout: string; stderr: string; code: number } {
  const r = spawnSync('node', [BIN, ...args.split(' ')], {
    input,
    encoding: 'utf8',
    timeout: 10000,
  })
  return { stdout: r.stdout ?? '', stderr: r.stderr ?? '', code: r.status ?? 1 }
}

function run(args: string): { stdout: string; stderr: string; code: number } {
  return pipe('', args)
}

describe('redact command — stdin (Task 4.2)', () => {
  it('redacts AWS key from stdin', () => {
    const r = pipe('AWS key: AKIAIOSFODNN7EXAMPLE', 'redact')
    expect(r.code).toBe(0)
    expect(r.stdout).toContain('[REDACTED:aws-access-key]')
    expect(r.stdout).not.toContain('AKIAIOSFODNN7EXAMPLE')
  })

  it('--mode redact produces [REDACTED:type]', () => {
    const r = pipe('AKIAIOSFODNN7EXAMPLE', 'redact --mode redact')
    expect(r.stdout).toContain('[REDACTED:aws-access-key]')
  })

  it('--mode tokenize produces TOKEN_', () => {
    const r = pipe('AKIAIOSFODNN7EXAMPLE', 'redact --mode tokenize')
    expect(r.stdout).toMatch(/TOKEN_[a-f0-9]+/)
  })

  it('--mode partial produces partial reveal', () => {
    const r = pipe('AKIAIOSFODNN7EXAMPLE', 'redact --mode partial')
    expect(r.stdout).toContain('AKIA...MPLE')
  })

  it('--mode warn preserves content with warning to stderr', () => {
    const r = pipe('AKIAIOSFODNN7EXAMPLE', 'redact --mode warn')
    expect(r.stdout).toContain('AKIAIOSFODNN7EXAMPLE')
    expect(r.stderr).toContain('warning')
  })

  it('--format json outputs JSON', () => {
    const r = pipe('AKIAIOSFODNN7EXAMPLE', 'redact --format json')
    expect(r.code).toBe(0)
    const parsed = JSON.parse(r.stdout)
    expect(parsed).toHaveProperty('output')
    expect(parsed).toHaveProperty('detections')
    expect(Array.isArray(parsed.detections)).toBe(true)
  })

  it('--policy developer uses tokenize mode', () => {
    const r = pipe('AKIAIOSFODNN7EXAMPLE', 'redact --policy developer')
    expect(r.stdout).toMatch(/TOKEN_[a-f0-9]+/)
  })

  it('clean input exits 0 and passes through unchanged', () => {
    const r = pipe('hello world, no secrets here', 'redact')
    expect(r.code).toBe(0)
    expect(r.stdout.trim()).toBe('hello world, no secrets here')
  })

  it('--hook mode outputs JSON and exits 1 when secrets found', () => {
    const r = pipe('AKIAIOSFODNN7EXAMPLE', 'redact --hook')
    expect(r.code).toBe(1)
    const parsed = JSON.parse(r.stdout)
    expect(parsed.detections.length).toBeGreaterThan(0)
  })

  it('--hook mode exits 0 when no secrets found', () => {
    const r = pipe('hello world', 'redact --hook')
    expect(r.code).toBe(0)
    const parsed = JSON.parse(r.stdout)
    expect(parsed.detections).toHaveLength(0)
  })
})

describe('redact --claude-hook mode', () => {
  const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.sig'

  it('Write tool with secret → continue:false', () => {
    const input = JSON.stringify({ tool_name: 'Write', tool_input: { content: `token: ${jwt}` } })
    const r = pipe(input, 'redact --claude-hook')
    expect(r.code).toBe(0)
    const out = JSON.parse(r.stdout)
    expect(out.continue).toBe(false)
    expect(out.stopReason).toMatch(/jwt/)
  })

  it('Edit tool with secret in new_string → continue:false', () => {
    const input = JSON.stringify({ tool_name: 'Edit', tool_input: { new_string: `token: ${jwt}` } })
    const r = pipe(input, 'redact --claude-hook')
    expect(r.code).toBe(0)
    const out = JSON.parse(r.stdout)
    expect(out.continue).toBe(false)
  })

  it('MultiEdit tool with secret in edits[].new_string → continue:false', () => {
    const input = JSON.stringify({
      tool_name: 'MultiEdit',
      tool_input: { edits: [{ old_string: 'x', new_string: `token: ${jwt}` }] },
    })
    const r = pipe(input, 'redact --claude-hook')
    expect(r.code).toBe(0)
    const out = JSON.parse(r.stdout)
    expect(out.continue).toBe(false)
  })

  it('clean content → continue:true', () => {
    const input = JSON.stringify({ tool_name: 'Write', tool_input: { content: 'hello world' } })
    const r = pipe(input, 'redact --claude-hook')
    expect(r.code).toBe(0)
    const out = JSON.parse(r.stdout)
    expect(out.continue).toBe(true)
  })

  it('empty/whitespace content → continue:true', () => {
    const input = JSON.stringify({ tool_name: 'Write', tool_input: { content: '   ' } })
    const r = pipe(input, 'redact --claude-hook')
    expect(r.code).toBe(0)
    expect(JSON.parse(r.stdout).continue).toBe(true)
  })

  it('malformed JSON → continue:true (fail open)', () => {
    const r = pipe('not json at all', 'redact --claude-hook')
    expect(r.code).toBe(0)
    expect(JSON.parse(r.stdout).continue).toBe(true)
  })

  it('missing tool_input → continue:true', () => {
    const input = JSON.stringify({ tool_name: 'Bash' })
    const r = pipe(input, 'redact --claude-hook')
    expect(r.code).toBe(0)
    expect(JSON.parse(r.stdout).continue).toBe(true)
  })
})
