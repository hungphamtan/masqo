import type { Detection } from '@masqo/shared'

const SENSITIVE_TERMS = /(?:API_?KEY|SECRET|PASSWORD|TOKEN|PRIVATE_?KEY|CREDENTIALS|AUTH)/i
const ENV_PATTERN = /^([A-Za-z_][A-Za-z0-9_]*)=(.+)$/gm

export function detectEnvSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(ENV_PATTERN)) {
    if (match.index === undefined || !match[1] || !match[2]) continue
    const keyName = match[1]
    const value = match[2].trim()

    if (!SENSITIVE_TERMS.test(keyName) || !value) continue

    detections.push({
      type: 'env-secret',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.85,
      pattern: 'SENSITIVE_KEY=value',
      source: 'detector:secrets/env',
      explanation: `Detected sensitive environment variable: ${keyName}`,
      originalText: match[0],
    })
  }

  return detections
}
