import type { Detection } from '@masqo/shared'

const SLACK_TOKEN_PATTERN = /xox[abposr]-(?:\d+-)+[a-zA-Z0-9]+/g
const SLACK_WEBHOOK_PATTERN = /https:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9_]+\/B[A-Za-z0-9_]+\/[A-Za-z0-9_]+/g

export function detectSlackSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(SLACK_TOKEN_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'slack-token',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.95,
      pattern: 'xox[abposr]-...',
      source: 'detector:secrets/slack',
      explanation: 'Detected Slack API token',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(SLACK_WEBHOOK_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'slack-webhook',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.99,
      pattern: 'https://hooks.slack.com/services/T.../B.../...',
      source: 'detector:secrets/slack',
      explanation: 'Detected Slack incoming webhook URL',
      originalText: match[0],
    })
  }

  return detections
}
