import type { StoredSettings } from '../types.js'
import { DEFAULT_SETTINGS } from '../types.js'

export async function getSettings(): Promise<StoredSettings> {
  const result = await chrome.storage.sync.get('masqo_settings')
  return (result['masqo_settings'] as StoredSettings | undefined) ?? { ...DEFAULT_SETTINGS, detectionHistory: [] }
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
