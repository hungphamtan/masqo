import type { Detection } from '@masqo/shared'

// Bearer token: at least 16 chars of non-whitespace after "Bearer "
const BEARER_PATTERN = /[Bb]earer\s+([A-Za-z0-9._~+/=-]{16,})/g

export function detectBearerTokens(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(BEARER_PATTERN)) {
    if (match.index === undefined || !match[1]) continue
    const tokenStart = match.index + match[0].indexOf(match[1])
    detections.push({
      type: 'bearer-token',
      position: { start: tokenStart, end: tokenStart + match[1].length },
      confidence: 0.9,
      pattern: 'Bearer [token]{16,}',
      source: 'detector:secrets/bearer',
      explanation: 'Detected Bearer authentication token in Authorization header',
      originalText: match[1],
    })
  }

  return detections
}
