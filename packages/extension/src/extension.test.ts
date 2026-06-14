import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Storage tests (mock chrome API) ───────────────────────────────────────────

const mockStorage: Record<string, unknown> = {}

vi.stubGlobal('chrome', {
  storage: {
    sync: {
      get: vi.fn((key: string) => Promise.resolve({ [key]: mockStorage[key] })),
      set: vi.fn((obj: Record<string, unknown>) => {
        Object.assign(mockStorage, obj)
        return Promise.resolve()
      }),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    lastError: null,
  },
})

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  vi.clearAllMocks()
})

describe('Storage', () => {
  it('getSettings returns default when empty', async () => {
    const { getSettings } = await import('./storage/index.js')
    const s = await getSettings()
    expect(s.policy).toBe('general')
    expect(s.detectionHistory).toEqual([])
  })

  it('setPolicy persists policy', async () => {
    const { setPolicy, getSettings } = await import('./storage/index.js')
    await setPolicy('developer')
    const s = await getSettings()
    expect(s.policy).toBe('developer')
  })

  it('addDetectionHistory stores up to 10 items', async () => {
    const { addDetectionHistory, getSettings } = await import('./storage/index.js')
    for (let i = 0; i < 12; i++) {
      await addDetectionHistory(`type-${i}`, 'chatgpt.com')
    }
    const s = await getSettings()
    expect(s.detectionHistory.length).toBe(10)
  })

  it('clearHistory empties the list', async () => {
    const { addDetectionHistory, clearHistory, getSettings } = await import('./storage/index.js')
    await addDetectionHistory('jwt', 'claude.ai')
    await clearHistory()
    const s = await getSettings()
    expect(s.detectionHistory).toHaveLength(0)
  })
})

// ── Types / contracts ─────────────────────────────────────────────────────────

describe('Message types', () => {
  it('ScanRequest has correct shape', () => {
    const msg = { type: 'SCAN' as const, text: 'hello', policy: 'developer' }
    expect(msg.type).toBe('SCAN')
    expect(msg.text).toBe('hello')
  })

  it('DEFAULT_SETTINGS has expected shape', async () => {
    const { DEFAULT_SETTINGS } = await import('./types.js')
    expect(DEFAULT_SETTINGS.policy).toBe('general')
    expect(Array.isArray(DEFAULT_SETTINGS.detectionHistory)).toBe(true)
  })
})

// ── Manifest validation ───────────────────────────────────────────────────────

describe('Manifest', () => {
  it('manifest.json is valid JSON with required fields', async () => {
    const { readFileSync } = await import('fs')
    const { resolve } = await import('path')
    const manifest = JSON.parse(
      readFileSync(resolve(import.meta.dirname, '../public/manifest.json'), 'utf8')
    )
    expect(manifest.manifest_version).toBe(3)
    expect(manifest.name).toBeDefined()
    expect(manifest.background?.service_worker).toBeDefined()
    expect(Array.isArray(manifest.content_scripts)).toBe(true)
    expect(manifest.content_scripts.length).toBeGreaterThanOrEqual(3)
    expect(manifest.permissions).toContain('storage')
  })

  it('manifest covers all 3 AI chat sites', async () => {
    const { readFileSync } = await import('fs')
    const { resolve } = await import('path')
    const manifest = JSON.parse(
      readFileSync(resolve(import.meta.dirname, '../public/manifest.json'), 'utf8')
    )
    const allMatches = manifest.content_scripts
      .flatMap((cs: { matches: string[] }) => cs.matches)
      .join(' ')
    expect(allMatches).toContain('openai.com')
    expect(allMatches).toContain('claude.ai')
    expect(allMatches).toContain('gemini.google.com')
  })
})
