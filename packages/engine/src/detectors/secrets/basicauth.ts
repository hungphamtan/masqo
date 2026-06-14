import type { Detection } from '@masqo/shared'

// https://user:pass@host — exclude DB schemes already handled by database detector
const DB_SCHEMES = /^(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis(?:s)?):\/\//i
const BASIC_AUTH_PATTERN = /https?:\/\/[^:@\s]+:[^@\s]+@[^\s"']+/gi

export function detectBasicAuthUrls(input: string): Detection[] {
  const detections: Detection[] = []
  for (const match of input.matchAll(BASIC_AUTH_PATTERN)) {
    if (match.index === undefined) continue
    if (DB_SCHEMES.test(match[0])) continue
    detections.push({
      type: 'basic-auth-url',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.9,
      pattern: 'https://user:pass@host',
      source: 'detector:secrets/basicauth',
      explanation: 'Detected HTTP Basic Auth credentials embedded in URL',
      originalText: match[0],
    })
  }
  return detections
}
