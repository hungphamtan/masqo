import type { Detection } from '@masqo/shared'

export interface Explanation {
  patternName: string
  confidence: number
  confidenceLabel: 'low' | 'medium' | 'high'
  ruleSource: string
  message: string
}

export function explain(detection: Detection): Explanation {
  return {
    patternName: detection.type,
    confidence: detection.confidence,
    confidenceLabel: confidenceLabel(detection.confidence),
    ruleSource: detection.source,
    message: detection.explanation,
  }
}

function confidenceLabel(confidence: number): 'low' | 'medium' | 'high' {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.5) return 'medium'
  return 'low'
}
