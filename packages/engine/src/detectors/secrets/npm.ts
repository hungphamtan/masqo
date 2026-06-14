import type { Detection } from '@masqo/shared'

const NPM_TOKEN_PATTERN = /\/\/.+\/:_authToken=\s*(npm_[A-Za-z0-9]+|[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12})/g

export function detectNpmSecrets(input: string): Detection[] {
  const detections: Detection[] = []
  for (const match of input.matchAll(NPM_TOKEN_PATTERN)) {
    if (match.index === undefined || !match[1]) continue
    const tokenStart = match.index + match[0].lastIndexOf(match[1])
    detections.push({
      type: 'npm-auth-token',
      position: { start: tokenStart, end: tokenStart + match[1].length },
      confidence: 0.95,
      pattern: '//<registry>/:_authToken=<token>',
      source: 'detector:secrets/npm',
      explanation: 'Detected npm registry auth token in .npmrc',
      originalText: match[1],
    })
  }
  return detections
}
