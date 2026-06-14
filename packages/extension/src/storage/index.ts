import type { StoredSettings } from '../types.js'
import { DEFAULT_SETTINGS } from '../types.js'
import { BUILT_IN_SITES } from '../sites.js'
import type { SiteConfig } from '../sites.js'

export async function getSettings(): Promise<StoredSettings> {
  const result = await chrome.storage.sync.get('masqo_settings')
  const stored = result['masqo_settings'] as StoredSettings | undefined
  return stored ?? { ...DEFAULT_SETTINGS }
}

export async function saveSettings(settings: StoredSettings): Promise<void> {
  await chrome.storage.sync.set({ masqo_settings: settings })
}

export async function getPolicy(): Promise<string> {
  const s = await getSettings()
  return s.policy
}

export async function setPolicy(policy: string): Promise<void> {
  const s = await getSettings()
  s.policy = policy
  await saveSettings(s)
}

export async function addDetectionHistory(
  type: string,
  site: string
): Promise<void> {
  const s = await getSettings()
  s.detectionHistory = [
    { type, site, timestamp: Date.now() },
    ...s.detectionHistory,
  ].slice(0, 10)
  await saveSettings(s)
}

export async function clearHistory(): Promise<void> {
  const s = await getSettings()
  s.detectionHistory = []
  await saveSettings(s)
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
  await saveSettings(s)
}

export async function removeCustomSite(id: string): Promise<void> {
  const s = await getSettings()
  s.customSites = (s.customSites ?? []).filter((site) => site.id !== id)
  await saveSettings(s)
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
  await saveSettings(s)
}
