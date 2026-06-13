import type { Detection, ReplacementMode } from '@masqo/shared'

/**
 * Detector interface - detects sensitive patterns in text
 */
export interface Detector {
  /**
   * Name of the detector (e.g., 'aws', 'jwt')
   */
  readonly name: string

  /**
   * Detect sensitive patterns in the input text
   * @param input Text to scan
   * @returns Array of detections found
   */
  detect(input: string): Detection[]
}

/**
 * Replacer interface - replaces detected content
 */
export interface Replacer {
  /**
   * Replace detected content in the input text
   * @param input Original text
   * @param detections Array of detections to replace
   * @returns Replaced text
   */
  replace(input: string, detections: Detection[]): string

  /**
   * Restore replaced content (for tokenization mode)
   * @param output Text with replacements
   * @returns Original text (if reversible)
   */
  restore?(output: string): string | null
}

/**
 * Engine configuration
 */
export interface EngineConfig {
  /**
   * Replacement mode to use
   */
  mode: ReplacementMode

  /**
   * Detector names to enable (if empty, all detectors run)
   */
  enabledDetectors?: string[]

  /**
   * Minimum confidence threshold (0.0 to 1.0)
   */
  minConfidence?: number
}

/**
 * Engine scan result
 */
export interface ScanResult {
  /**
   * Original input text
   */
  original: string

  /**
   * Output text with replacements applied
   */
  output: string

  /**
   * All detections found
   */
  detections: Detection[]

  /**
   * Replacement mode used
   */
  mode: ReplacementMode
}
