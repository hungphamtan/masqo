import type { Detection } from '@masqo/shared'

// Three base64url segments separated by dots — classic JWT structure
const JWT_PATTERN = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g

export function detectJwt(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(JWT_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'jwt',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.95,
      pattern: 'eyJ[...] three-segment base64url',
      source: 'detector:secrets/jwt',
      explanation: 'Detected JSON Web Token (three base64url segments starting with eyJ)',
      originalText: match[0],
    })
  }

  return detections
}
