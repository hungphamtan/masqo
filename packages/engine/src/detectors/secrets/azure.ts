import type { Detection } from '@masqo/shared'

// Azure Storage Account key: base64, 88 chars, always ends with ==
const AZURE_STORAGE_KEY_PATTERN = /AccountKey=[A-Za-z0-9+/]{86}==/g

export function detectAzureSecrets(input: string): Detection[] {
  const detections: Detection[] = []
  for (const match of input.matchAll(AZURE_STORAGE_KEY_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'azure-storage-key',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.97,
      pattern: 'AccountKey=[base64 88chars]',
      source: 'detector:secrets/azure',
      explanation: 'Detected Azure Storage Account key',
      originalText: match[0],
    })
  }
  return detections
}
