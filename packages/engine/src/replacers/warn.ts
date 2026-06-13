import type { Detection } from '@masqo/shared'

export interface WarnResult {
  output: string
  hasWarnings: boolean
  detections: Detection[]
}

export function warn(input: string, detections: Detection[]): WarnResult {
  return {
    output: input,
    hasWarnings: detections.length > 0,
    detections,
  }
}
