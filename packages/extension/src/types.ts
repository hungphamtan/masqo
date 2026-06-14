import type { Detection } from '@masqo/shared'

export interface ScanRequest {
  type: 'SCAN'
  text: string
  policy?: string
}

export interface ScanResponse {
  type: 'SCAN_RESULT'
  output: string
  detections: Detection[]
  mode: string
}

export interface ErrorResponse {
  type: 'ERROR'
  message: string
}

export type MessageToBackground = ScanRequest
export type MessageFromBackground = ScanResponse | ErrorResponse

export interface StoredSettings {
  policy: string
  detectionHistory: Array<{
    type: string
    site: string
    timestamp: number
  }>
}

export const DEFAULT_SETTINGS: StoredSettings = {
  policy: 'general',
  detectionHistory: [],
}
