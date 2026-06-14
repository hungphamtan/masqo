import type { StoredSettings } from '../types.js'
import { DEFAULT_SETTINGS } from '../types.js'
import { BUILT_IN_SITES } from '../sites.js'
import type { SiteConfig } from '../sites.js'

function isValidSiteConfig(v: unknown): v is SiteConfig {
  if (!v || typeof v !== 'object') return false
  const s = v as Record<string, unknown>
  return (
    typeof s['id'] === 'string' && s['id'].length <= 100 &&
    typeof s['name'] === 'string' && s['name'].length <= 100 &&
    typeof s['hostname'] === 'string' &&
    /^[a-zA-Z0-9.-]+$/.test(s['hostname']) &&
    s['hostname'].length <= 253 &&
    typeof s['textareaSelector'] === 'string' &&
    s['textareaSelector'].length <= 500 &&
    typeof s['builtIn'] === 'boolean'
  )
}

interface SyncSettings {
  policy: string
  disabledSiteIds: string[]
  customSites: SiteConfig[]
}

type HistoryEntry = { type: string; site: string; timestamp: number }

export async function getSettings(): Promise<StoredSettings> {
  const [syncResult, localResult] = await Promise.all([
    chrome.storage.sync.get('masqo_settings'),
    chrome.storage.local.get('masqo_history'),
  ])

  const stored = syncResult['masqo_settings'] as Partial<SyncSettings> | undefined
  const rawCustomSites = (stored?.customSites ?? []) as unknown[]
  const validatedCustomSites = rawCustomSites.filter(isValidSiteConfig)

  const history = (localResult['masqo_history'] as HistoryEntry[] | undefined) ?? []

  return {
    policy: stored?.policy ?? DEFAULT_SETTINGS.policy,
    disabledSiteIds: stored?.disabledSiteIds ?? [],
    customSites: validatedCustomSites,
    detectionHistory: history,
  }
}

async function saveSyncSettings(settings: StoredSettings): Promise<void> {
  const syncData: SyncSettings = {
    policy: settings.policy,
    disabledSiteIds: settings.disabledSiteIds,
    customSites: settings.customSites,
  }
  await chrome.storage.sync.set({ masqo_settings: syncData })
}

export async function getPolicy(): Promise<string> {
  const s = await getSettings()
  return s.policy
}

export async function setPolicy(policy: string): Promise<void> {
  const s = await getSettings()
  s.policy = policy
  await saveSyncSettings(s)
}

export async function addDetectionHistory(
  type: string,
  site: string
): Promise<void> {
  const s = await getSettings()
  const updated = [
    { type, site, timestamp: Date.now() },
    ...s.detectionHistory,
  ].slice(0, 10)
  await chrome.storage.local.set({ masqo_history: updated })
}

export async function clearHistory(): Promise<void> {
  await chrome.storage.local.set({ masqo_history: [] })
}

export async function getSites(): Promise<SiteConfig[]> {
  const s = await getSettings()
  const disabled = new Set(s.disabledSiteIds ?? [])
  const builtIn = BUILT_IN_SITES.filter((site) => !disabled.has(site.id))
  return [...builtIn, ...(s.customSites ?? [])]
}

export async function addCustomSite(site: SiteConfig): Promise<void> {
  const s = await getSettings()
  s.customSites = [...(s.customSites ?? []), { ...site, builtIn: false }]
  await saveSyncSettings(s)
}

export async function removeCustomSite(id: string): Promise<void> {
  const s = await getSettings()
  s.customSites = (s.customSites ?? []).filter((site) => site.id !== id)
  await saveSyncSettings(s)
}

export async function toggleSiteEnabled(id: string, enabled: boolean): Promise<void> {
  const s = await getSettings()
  const disabled = new Set(s.disabledSiteIds ?? [])
  if (enabled) {
    disabled.delete(id)
  } else {
    disabled.add(id)
  }
  s.disabledSiteIds = [...disabled]
  await saveSyncSettings(s)
}
