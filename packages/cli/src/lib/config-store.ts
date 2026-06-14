import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve } from 'path'
import { homedir } from 'os'

export interface MasqoConfig {
  policy: string
  customRules: Array<{ pattern: string; type: string; name: string }>
}

const DEFAULT_CONFIG: MasqoConfig = {
  policy: 'general',
  customRules: [],
}

function configDir(): string {
  return process.env['MASQO_CONFIG_DIR'] ?? resolve(homedir(), '.masqo')
}

function configPath(): string {
  return resolve(configDir(), 'config.json')
}

export function loadConfig(): MasqoConfig {
  const path = configPath()
  if (!existsSync(path)) return { ...DEFAULT_CONFIG, customRules: [] }
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as MasqoConfig
  } catch {
    return { ...DEFAULT_CONFIG, customRules: [] }
  }
}

export function saveConfig(config: MasqoConfig): void {
  const dir = configDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(configPath(), JSON.stringify(config, null, 2), 'utf8')
}
