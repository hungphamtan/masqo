import type { Detection } from '@masqo/shared'

const tokenMap = new Map<string, string>()
const reverseMap = new Map<string, string>()

// FNV-1a 32-bit - fast, browser-compatible, no Node crypto dependency
function fnv1a(str: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = (h * 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

function makeToken(value: string): string {
  // Two passes for 16 hex chars of entropy
  return `TOKEN_${fnv1a(value)}${fnv1a(value + '\x00')}`
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
