import type { Detection } from '@masqo/shared'

const GCP_API_KEY_PATTERN = /AIza[0-9A-Za-z_-]{35}/g
const GCP_SERVICE_ACCOUNT_PATTERN = /"type"\s*:\s*"service_account"/g

export function detectGcpSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(GCP_API_KEY_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'gcp-api-key',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.9,
      pattern: 'AIza[0-9A-Za-z_-]{35}',
      source: 'detector:secrets/gcp',
      explanation: 'Detected GCP API key (AIza prefix with 35 alphanumeric characters)',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(GCP_SERVICE_ACCOUNT_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'gcp-service-account',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.95,
      pattern: '"type"\\s*:\\s*"service_account"',
      source: 'detector:secrets/gcp',
      explanation: 'Detected GCP service account JSON key',
      originalText: match[0],
    })
  }

  return detections
}
