import type { StoredSettings } from '../types.js'
import { DEFAULT_SETTINGS } from '../types.js'
import { BUILT_IN_SITES } from '../sites.js'
import type { SiteConfig } from '../sites.js'

interface SyncSettings {
  policy: string
  disabledSiteIds: string[]
}

type HistoryEntry = { type: string; site: string; timestamp: number }

export async function getSettings(): Promise<StoredSettings> {
  const [syncResult, localResult] = await Promise.all([
    chrome.storage.sync.get('masqo_settings'),
    chrome.storage.local.get('masqo_history'),
  ])

  const stored = syncResult['masqo_settings'] as Partial<SyncSettings> | undefined
  const history = (localResult['masqo_history'] as HistoryEntry[] | undefined) ?? []

  return {
    policy: stored?.policy ?? DEFAULT_SETTINGS.policy,
    disabledSiteIds: stored?.disabledSiteIds ?? [],
    customSites: [],
    detectionHistory: history,
  }
}

async function saveSyncSettings(settings: StoredSettings): Promise<void> {
  const syncData: SyncSettings = {
    policy: settings.policy,
    disabledSiteIds: settings.disabledSiteIds,
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
  return BUILT_IN_SITES.filter((site) => !disabled.has(site.id))
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
