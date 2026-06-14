import type { Detection } from '@masqo/shared'

// JSON: "sensitiveKey": "value"
const JSON_SECRET_PATTERN =
  /"(password|passwd|secret[_-]?key|api[_-]?key|apikey|credentials|auth[_-]?token|private[_-]?key)"\s*:\s*"([^"]{1,})"/gi

// YAML: sensitive_key: value (not quoted)
const YAML_SECRET_PATTERN =
  /^[ \t]*(password|passwd|secret[_-]?key|api[_-]?key|credentials|auth[_-]?token|private[_-]?key)\s*:\s*(\S.*)$/gim

export function detectConfigSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(JSON_SECRET_PATTERN)) {
    if (match.index === undefined || !match[2]) continue
    if (!match[2].trim()) continue
    detections.push({
      type: 'config-secret',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.85,
      pattern: '"sensitive_key": "value"',
      source: 'detector:code/config',
      explanation: `Detected sensitive config field: ${match[1]}`,
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(YAML_SECRET_PATTERN)) {
    if (match.index === undefined || !match[2]) continue
    const value = match[2].trim()
    if (!value || value === '~' || value === 'null' || value === '""') continue
    // Skip if it looks like a JSON match we already caught
    if (input[match.index - 1] === '"') continue
    detections.push({
      type: 'config-secret',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.8,
      pattern: 'sensitive_key: value',
      source: 'detector:code/config',
      explanation: `Detected sensitive YAML config field: ${match[1]}`,
      originalText: match[0],
    })
  }

  return detections
}
