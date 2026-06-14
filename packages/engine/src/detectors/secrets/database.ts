import type { Detection } from '@masqo/shared'

// DB connection strings with credentials: scheme://user:pass@host or scheme://:pass@host
const DB_URL_PATTERN =
  /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis(?:s)?):\/\/[^:@\s]*:[^@\s]+@[^\s"']+/gi

// Sentry DSN: https://key@host/project
const SENTRY_DSN_PATTERN = /https?:\/\/[a-f0-9]{32}@o\d+\.ingest\.sentry\.io\/\d+/gi

export function detectDatabaseSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(DB_URL_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'database-connection-string',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.95,
      pattern: 'scheme://user:pass@host',
      source: 'detector:secrets/database',
      explanation: 'Detected database connection string with embedded credentials',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(SENTRY_DSN_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'sentry-dsn',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.95,
      pattern: 'https://[32hexchars]@o[id].ingest.sentry.io/[project]',
      source: 'detector:secrets/database',
      explanation: 'Detected Sentry DSN with embedded key',
      originalText: match[0],
    })
  }

  return detections
}
