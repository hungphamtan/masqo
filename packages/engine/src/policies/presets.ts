import type { Policy } from './parser.js'

const PRESETS: Record<string, Policy> = {
  developer: {
    name: 'Developer',
    version: '1.0.0',
    detectors: {
      secrets: { enabled: true, confidence: 'high' },
      pii: { enabled: false },
      logs: { enabled: true, confidence: 'medium' },
    },
    customRules: [],
    replacementMode: 'tokenize',
  },
  general: {
    name: 'General',
    version: '1.0.0',
    detectors: {
      secrets: { enabled: true, confidence: 'medium' },
      pii: { enabled: true, confidence: 'medium' },
      logs: { enabled: false },
    },
    customRules: [],
    replacementMode: 'redact',
  },
}

export function loadPreset(name: string): Policy {
  const preset = PRESETS[name]
  if (!preset) {
    throw new Error(`Unknown preset: "${name}". Available: ${Object.keys(PRESETS).join(', ')}`)
  }
  return { ...preset, detectors: { ...preset.detectors }, customRules: [...preset.customRules] }
}

export function listPresets(): string[] {
  return Object.keys(PRESETS)
}
