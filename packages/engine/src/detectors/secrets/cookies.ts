import type { Detection } from '@masqo/shared'

const SESSION_COOKIE_PATTERN = /(?:^|[;\s])(?:Set-Cookie:\s*)?session\s*=\s*([A-Za-z0-9._~+/=%-]{16,})/gi
const AUTH_COOKIE_PATTERN = /(?:^|[;\s])(?:Set-Cookie:\s*)?(?:auth[_-]?token|access[_-]?token)\s*=\s*([A-Za-z0-9._~+/=%-]{16,})/gi

export function detectCookies(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(SESSION_COOKIE_PATTERN)) {
    if (match.index === undefined || !match[1]) continue
    const valueStart = match.index + match[0].indexOf(match[1])
    detections.push({
      type: 'session-cookie',
      position: { start: valueStart, end: valueStart + match[1].length },
      confidence: 0.85,
      pattern: 'session=[value]{16,}',
      source: 'detector:secrets/cookies',
      explanation: 'Detected session cookie value',
      originalText: match[1],
    })
  }

  for (const match of input.matchAll(AUTH_COOKIE_PATTERN)) {
    if (match.index === undefined || !match[1]) continue
    const valueStart = match.index + match[0].indexOf(match[1])
    detections.push({
      type: 'auth-cookie',
      position: { start: valueStart, end: valueStart + match[1].length },
      confidence: 0.9,
      pattern: 'auth_token=[value]{16,}',
      source: 'detector:secrets/cookies',
      explanation: 'Detected authentication cookie value',
      originalText: match[1],
    })
  }

  return detections
}
