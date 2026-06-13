import type { Detection } from '@masqo/shared'

interface PartialOptions {
  revealChars?: number
}

export function partial(input: string, detections: Detection[], options: PartialOptions = {}): string {
  if (detections.length === 0) return input

  const reveal = options.revealChars ?? 4
  const sorted = [...detections].sort((a, b) => a.position.start - b.position.start)
  let result = ''
  let cursor = 0

  for (const detection of sorted) {
    if (detection.position.start < cursor) continue
    const matched = input.slice(detection.position.start, detection.position.end)
    const shown =
      matched.length > reveal * 2
        ? `${matched.slice(0, reveal)}...${matched.slice(-reveal)}`
        : matched
    result += input.slice(cursor, detection.position.start)
    result += shown
    cursor = detection.position.end
  }

  result += input.slice(cursor)
  return result
}
