import type { Detection } from '@masqo/shared'

const SENDGRID_PATTERN = /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g

export function detectSendgridSecrets(input: string): Detection[] {
  const detections: Detection[] = []
  for (const match of input.matchAll(SENDGRID_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'sendgrid-api-key',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.99,
      pattern: 'SG.[22chars].[43chars]',
      source: 'detector:secrets/sendgrid',
      explanation: 'Detected SendGrid API key',
      originalText: match[0],
    })
  }
  return detections
}
