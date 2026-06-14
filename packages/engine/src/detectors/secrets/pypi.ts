import type { Detection } from '@masqo/shared'

const PYPI_TOKEN_PATTERN = /pypi-AgE[A-Za-z0-9_-]{70,}/g

export function detectPypiSecrets(input: string): Detection[] {
  const detections: Detection[] = []
  for (const match of input.matchAll(PYPI_TOKEN_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'pypi-token',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.99,
      pattern: 'pypi-AgE[...]{70+}',
      source: 'detector:secrets/pypi',
      explanation: 'Detected PyPI upload token',
      originalText: match[0],
    })
  }
  return detections
}
