import type { Detection } from '@masqo/shared'
import { createHash } from 'crypto'

const tokenMap = new Map<string, string>()
const reverseMap = new Map<string, string>()

function makeToken(value: string): string {
  const hash = createHash('sha256').update(value).digest('hex').slice(0, 12)
  return `TOKEN_${hash}`
}

export function tokenize(input: string, detections: Detection[]): string {
  if (detections.length === 0) return input

  const sorted = [...detections].sort((a, b) => a.position.start - b.position.start)
  let result = ''
  let cursor = 0

  for (const detection of sorted) {
    if (detection.position.start < cursor) continue
    const original = input.slice(detection.position.start, detection.position.end)
    const token = makeToken(original)
    tokenMap.set(token, original)
    reverseMap.set(original, token)
    result += input.slice(cursor, detection.position.start)
    result += token
    cursor = detection.position.end
  }

  result += input.slice(cursor)
  return result
}

export function restore(tokenized: string): string {
  let result = tokenized
  for (const [token, original] of tokenMap) {
    result = result.replaceAll(token, original)
  }
  return result
}
