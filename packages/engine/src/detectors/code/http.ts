import type { Detection } from '@masqo/shared'

const AUTH_HEADER_PATTERN = /^Authorization:\s+(?:Bearer|Basic|Digest|Token)\s+\S+/gim
const COOKIE_HEADER_PATTERN = /^(?:Set-)?Cookie:\s+\S+/gim
const API_KEY_HEADER_PATTERN = /^X-API-?Key:\s+\S+/gim
const JSON_CREDENTIAL_PATTERN =
  /"(?:password|passwd|secret|token|access_token|refresh_token|api_key|apikey|credentials)"\s*:\s*"([^"]{4,})"/gi

export function detectHttpSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(AUTH_HEADER_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'http-auth-header',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.9,
      pattern: 'Authorization: Bearer/Basic/Token ...',
      source: 'detector:code/http',
      explanation: 'Detected HTTP Authorization header with credentials',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(COOKIE_HEADER_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'http-cookie-header',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.75,
      pattern: '(Set-)Cookie: ...',
      source: 'detector:code/http',
      explanation: 'Detected HTTP Cookie header — may contain session or auth cookies',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(API_KEY_HEADER_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'http-api-key-header',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.9,
      pattern: 'X-API-Key: ...',
      source: 'detector:code/http',
      explanation: 'Detected X-API-Key header',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(JSON_CREDENTIAL_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'json-credential-field',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.85,
      pattern: '"credential_field": "value"',
      source: 'detector:code/http',
      explanation: 'Detected credential field in JSON payload',
      originalText: match[0],
    })
  }

  return detections
}
