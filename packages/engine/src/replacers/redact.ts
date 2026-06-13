import type { Detection } from '@masqo/shared'

export function redact(input: string, detections: Detection[]): string {
  if (detections.length === 0) return input

  const sorted = [...detections].sort((a, b) => a.position.start - b.position.start)
  let result = ''
  let cursor = 0

  for (const detection of sorted) {
    if (detection.position.start < cursor) continue // skip overlapping
    result += input.slice(cursor, detection.position.start)
    result += `[REDACTED:${detection.type}]`
    cursor = detection.position.end
  }

  result += input.slice(cursor)
  return result
}
