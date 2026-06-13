/**
 * Position in a text string
 */
export interface Position {
  /** Starting index (inclusive) */
  start: number
  /** Ending index (exclusive) */
  end: number
}

/**
 * Replacement mode for detected content
 */
export enum ReplacementMode {
  /** Replace with [REDACTED:type] */
  Redact = 'redact',
  /** Replace with reversible token, store mapping */
  Tokenize = 'tokenize',
  /** Show partial content (e.g., first/last N chars) */
  Partial = 'partial',
  /** Flag but don't replace */
  Warn = 'warn',
}

/**
 * A detected sensitive item
 */
export interface Detection {
  /** Type of detection (e.g., 'aws-access-key') */
  type: string
  /** Position in the input text */
  position: Position
  /** Confidence score (0.0 to 1.0) */
  confidence: number
  /** Regex pattern that matched */
  pattern: string
  /** Source detector path (e.g., 'detector:secrets/aws') */
  source: string
  /** Human-readable explanation */
  explanation: string
  /** Original matched text (for reference, not stored in output) */
  originalText?: string
}

/**
 * Policy configuration
 */
export interface PolicyConfig {
  /** Policy name */
  name: string
  /** Policy version (semver) */
  version: string
  /** Detector settings */
  detectors: {
    [key: string]: {
      enabled: boolean
      confidence?: 'low' | 'medium' | 'high'
    }
  }
  /** Custom detection rules */
  customRules: Array<{
    pattern: string
    type: string
    name: string
  }>
  /** Default replacement mode */
  replacementMode: ReplacementMode
}
