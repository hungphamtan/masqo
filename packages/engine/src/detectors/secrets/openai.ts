import type { Detection } from '@masqo/shared'

// Modern: sk-proj-... or sk-svcacct-... (any prefix before T3BlbkFJ)
// Legacy: sk-[48 chars total including T3BlbkFJ marker]
const OPENAI_KEY_PATTERN = /sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}T3BlbkFJ[A-Za-z0-9_-]{20,}/g
// Also catch newer format without T3BlbkFJ (sk-proj- prefix with sufficient length)
const OPENAI_NEW_PATTERN = /sk-proj-[A-Za-z0-9_-]{48,}/g

export function detectOpenAiSecrets(input: string): Detection[] {
  const detections: Detection[] = []
  const seen = new Set<number>()

  const add = (match: RegExpMatchArray) => {
    if (match.index === undefined || seen.has(match.index)) return
    seen.add(match.index)
    detections.push({
      type: 'openai-api-key',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.98,
      pattern: 'sk-[proj-]...T3BlbkFJ...',
      source: 'detector:secrets/openai',
      explanation: 'Detected OpenAI API key',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(OPENAI_KEY_PATTERN)) add(match)
  for (const match of input.matchAll(OPENAI_NEW_PATTERN)) add(match)

  return detections
}
