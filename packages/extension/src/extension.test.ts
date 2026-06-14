import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Storage tests (mock chrome API) ───────────────────────────────────────────

const mockStorage: Record<string, unknown> = {}

const mockLocalStorage: Record<string, unknown> = {}

vi.stubGlobal('chrome', {
  storage: {
    sync: {
      get: vi.fn((key: string) => Promise.resolve({ [key]: mockStorage[key] })),
      set: vi.fn((obj: Record<string, unknown>) => {
        Object.assign(mockStorage, obj)
        return Promise.resolve()
      }),
    },
    local: {
      get: vi.fn((key: string) => Promise.resolve({ [key]: mockLocalStorage[key] })),
      set: vi.fn((obj: Record<string, unknown>) => {
        Object.assign(mockLocalStorage, obj)
        return Promise.resolve()
      }),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    lastError: null,
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
  },
})

beforeEach(() => {
  Object.keys(mockStorage).forEach((k) => delete mockStorage[k])
  Object.keys(mockLocalStorage).forEach((k) => delete mockLocalStorage[k])
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

  it('getSites returns all built-in sites by default', async () => {
    const { getSites } = await import('./storage/index.js')
    const sites = await getSites()
    expect(sites.length).toBeGreaterThanOrEqual(10)
    expect(sites.some((s) => s.id === 'claude')).toBe(true)
    expect(sites.some((s) => s.id === 'grok')).toBe(true)
  })

  it('toggleSiteEnabled disables a site', async () => {
    const { getSites, toggleSiteEnabled } = await import('./storage/index.js')
    await toggleSiteEnabled('claude', false)
    const sites = await getSites()
    expect(sites.some((s) => s.id === 'claude')).toBe(false)
  })

  it('addCustomSite appears in getSites', async () => {
    const { getSites, addCustomSite } = await import('./storage/index.js')
    await addCustomSite({ id: 'test-site', name: 'Test', hostname: 'test.com', textareaSelector: 'textarea', builtIn: false })
    const sites = await getSites()
    expect(sites.some((s) => s.id === 'test-site')).toBe(true)
  })

  it('removeCustomSite removes it from getSites', async () => {
    const { getSites, addCustomSite, removeCustomSite } = await import('./storage/index.js')
    await addCustomSite({ id: 'temp-site', name: 'Temp', hostname: 'temp.com', textareaSelector: 'textarea', builtIn: false })
    await removeCustomSite('temp-site')
    const sites = await getSites()
    expect(sites.some((s) => s.id === 'temp-site')).toBe(false)
  })

  it('detectionHistory stored in chrome.storage.local not sync', async () => {
    const { addDetectionHistory } = await import('./storage/index.js')
    await addDetectionHistory('jwt', 'claude.ai')
    // local storage should have the entry
    expect(mockLocalStorage['masqo_history']).toBeDefined()
    const history = mockLocalStorage['masqo_history'] as Array<{ type: string; site: string }>
    expect(history[0].type).toBe('jwt')
    expect(history[0].site).toBe('claude.ai')
    // sync storage should NOT have detectionHistory
    const syncData = mockStorage['masqo_settings'] as Record<string, unknown> | undefined
    expect(syncData?.['detectionHistory']).toBeUndefined()
  })

  it('filters out invalid customSites from storage on read', async () => {
    // Inject invalid customSite directly into mock storage
    mockStorage['masqo_settings'] = {
      policy: 'general',
      disabledSiteIds: [],
      customSites: [
        { id: 'valid', name: 'Valid', hostname: 'valid.com', textareaSelector: 'textarea', builtIn: false },
        { id: 'bad', name: 'Bad', hostname: 'evil.com/../../../etc/passwd', textareaSelector: 'x'.repeat(501), builtIn: false },
        'not-an-object',
        null,
      ],
    }
    const { getSettings } = await import('./storage/index.js')
    const s = await getSettings()
    expect(s.customSites).toHaveLength(1)
    expect(s.customSites[0].id).toBe('valid')
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
    expect(Array.isArray(DEFAULT_SETTINGS.disabledSiteIds)).toBe(true)
    expect(Array.isArray(DEFAULT_SETTINGS.customSites)).toBe(true)
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
    expect(manifest.content_scripts.length).toBeGreaterThanOrEqual(1)
    expect(manifest.permissions).toContain('storage')
  })

  it('manifest.json version is not 0.0.0', async () => {
    const { readFileSync } = await import('fs')
    const { resolve } = await import('path')
    const manifest = JSON.parse(
      readFileSync(resolve(import.meta.dirname, '../public/manifest.json'), 'utf8')
    )
    expect(manifest.version).not.toBe('0.0.0')
  })

  it('manifest uses <all_urls> for broad site support', async () => {
    const { readFileSync } = await import('fs')
    const { resolve } = await import('path')
    const manifest = JSON.parse(
      readFileSync(resolve(import.meta.dirname, '../public/manifest.json'), 'utf8')
    )
    const allMatches = manifest.content_scripts
      .flatMap((cs: { matches: string[] }) => cs.matches)
      .join(' ')
    expect(allMatches).toContain('<all_urls>')
  })
})
