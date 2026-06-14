import type { Detection } from '@masqo/shared'

const PRIVATE_KEY_PATTERN =
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----[\s\S]+?-----END (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/g

export function detectPrivateKeys(input: string): Detection[] {
  const detections: Detection[] = []
  for (const match of input.matchAll(PRIVATE_KEY_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'private-key',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.99,
      pattern: '-----BEGIN * PRIVATE KEY-----',
      source: 'detector:secrets/privatekeys',
      explanation: 'Detected PEM-encoded private key',
      originalText: match[0],
    })
  }
  return detections
}
