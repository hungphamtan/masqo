import type { Detection } from '@masqo/shared'

const TWILIO_SID_PATTERN = /AC[a-z0-9]{32}/g
const TWILIO_AUTH_PATTERN = /SK[a-z0-9]{32}/g

export function detectTwilioSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(TWILIO_SID_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'twilio-account-sid',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.9,
      pattern: 'AC[32 hex]',
      source: 'detector:secrets/twilio',
      explanation: 'Detected Twilio Account SID',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(TWILIO_AUTH_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'twilio-auth-token',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.9,
      pattern: 'SK[32 hex]',
      source: 'detector:secrets/twilio',
      explanation: 'Detected Twilio Auth Token',
      originalText: match[0],
    })
  }

  return detections
}
