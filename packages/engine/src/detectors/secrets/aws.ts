import type { Detection } from '@masqo/shared'

/**
 * AWS Access Key ID pattern: AKIA followed by 16 alphanumeric characters
 */
const AWS_ACCESS_KEY_PATTERN = /AKIA[0-9A-Z]{16}/g

/**
 * AWS Secret Access Key pattern: 40 base64 characters
 * Higher confidence when found near AWS_SECRET or similar context
 */
const AWS_SECRET_KEY_PATTERN = /[A-Za-z0-9/+=]{40}/g

/**
 * AWS Session Token pattern: Long base64 string (100+ chars)
 */
const AWS_SESSION_TOKEN_PATTERN = /[A-Za-z0-9/+=]{100,}/g

/**
 * Comment patterns to exclude from detection
 */
const COMMENT_PATTERNS = [
  /^\s*\/\//,  // JS/TS comment
  /^\s*#/,     // Shell/Python comment
  /^\s*\/\*/,  // Multi-line comment start
  /^\s*\*/,    // Multi-line comment continuation
]

/**
 * Check if a line is a comment
 */
function isCommentLine(line: string): boolean {
  return COMMENT_PATTERNS.some((pattern) => pattern.test(line))
}

/**
 * Get the line containing a position in text
 */
function getLineAtPosition(text: string, position: number): string {
  const lines = text.split('\\n')
  let currentPos = 0

  for (const line of lines) {
    const lineEnd = currentPos + line.length + 1 // +1 for newline
    if (position >= currentPos && position < lineEnd) {
      return line
    }
    currentPos = lineEnd
  }

  return text
}

/**
 * Detect AWS secrets in text
 * @param input Text to scan
 * @returns Array of detections
 */
export function detectAwsSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  // Detect AWS Access Keys
  const accessKeyMatches = input.matchAll(AWS_ACCESS_KEY_PATTERN)
  for (const match of accessKeyMatches) {
    if (match.index === undefined) continue

    // Check if match is in a comment
    const line = getLineAtPosition(input, match.index)
    if (isCommentLine(line)) continue

    detections.push({
      type: 'aws-access-key',
      position: {
        start: match.index,
        end: match.index + match[0].length,
      },
      confidence: 0.95,
      pattern: 'AKIA[0-9A-Z]{16}',
      source: 'detector:secrets/aws',
      explanation: 'Detected AWS access key pattern (AKIA followed by 16 alphanumeric characters)',
      originalText: match[0],
    })
  }

  // Detect AWS Secret Keys
  const secretKeyMatches = input.matchAll(AWS_SECRET_KEY_PATTERN)
  for (const match of secretKeyMatches) {
    if (match.index === undefined) continue

    // Check if match is in a comment
    const line = getLineAtPosition(input, match.index)
    if (isCommentLine(line)) continue

    // Skip if exact match length is not 40 (to reduce false positives)
    if (match[0].length !== 40) continue

    // Require AWS context - bare 40-char base64 has too many false positives (JWT segments, etc.)
    const context = input.substring(
      Math.max(0, match.index - 100),
      Math.min(input.length, match.index + match[0].length + 100)
    )
    const hasAwsContext = /AWS_SECRET|SECRET_ACCESS_KEY|aws.*secret/i.test(context)
    if (!hasAwsContext) continue

    const confidence = 0.95

    detections.push({
      type: 'aws-secret-key',
      position: {
        start: match.index,
        end: match.index + match[0].length,
      },
      confidence,
      pattern: '[A-Za-z0-9/+=]{40}',
      source: 'detector:secrets/aws',
      explanation: 'Detected AWS secret access key pattern (40 base64 characters)',
      originalText: match[0],
    })
  }

  // Detect AWS Session Tokens
  const sessionTokenMatches = input.matchAll(AWS_SESSION_TOKEN_PATTERN)
  for (const match of sessionTokenMatches) {
    if (match.index === undefined) continue

    // Check if match is in a comment
    const line = getLineAtPosition(input, match.index)
    if (isCommentLine(line)) continue

    // Check for AWS session token context
    const context = input.substring(
      Math.max(0, match.index - 50),
      Math.min(input.length, match.index + match[0].length + 50)
    )
    const hasSessionContext = /SESSION_TOKEN|session.*token/i.test(context)

    // Only flag if we have explicit session context (regex already guarantees length >= 100)
    if (!hasSessionContext) continue

    detections.push({
      type: 'aws-session-token',
      position: {
        start: match.index,
        end: match.index + match[0].length,
      },
      confidence: 0.85,
      pattern: '[A-Za-z0-9/+=]{100,}',
      source: 'detector:secrets/aws',
      explanation: 'Detected AWS session token pattern (long base64 string)',
      originalText: match[0],
    })
  }

  return detections
}
