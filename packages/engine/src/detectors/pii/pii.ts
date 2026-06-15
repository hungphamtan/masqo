import type { Detection } from '@masqo/shared'

const EMAIL_PATTERN = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g

// E.164 and common national formats: +1-555-123-4567, (555) 123-4567, 555.123.4567
const PHONE_PATTERN = /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}\b/g

// US SSN: 123-45-6789 or 123 45 6789 (not 000, not 666, not 900-999 area)
const SSN_PATTERN = /\b(?!000|666|9\d{2})\d{3}[- ]\d{2}[- ]\d{4}\b/g

// Visa/MC/Discover: 16 digits with optional separators
const CREDIT_CARD_16_PATTERN = /\b(?:4\d{3}|5[1-5]\d{2}|6011)[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g
// Amex: 15 digits (4-6-5 or 4-4-7 grouping)
const CREDIT_CARD_AMEX_PATTERN = /\b3[47]\d{2}[\s\-]?\d{4,6}[\s\-]?\d{4,5}\b/g

// IP address (v4 only, skip loopback/private ranges)
const IPV4_PATTERN = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g

function isPrivateIp(a: number, b: number): boolean {
  return a === 10 || a === 127 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
}

export function detectPii(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(EMAIL_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'email',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.92,
      pattern: EMAIL_PATTERN.source,
      source: 'detector:pii/email',
      explanation: 'Detected email address',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(PHONE_PATTERN)) {
    if (match.index === undefined) continue
    const digits = match[0].replace(/\D/g, '')
    // require 10-11 digits to reduce false positives
    if (digits.length < 10 || digits.length > 11) continue
    detections.push({
      type: 'phone-number',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.82,
      pattern: PHONE_PATTERN.source,
      source: 'detector:pii/phone',
      explanation: 'Detected phone number',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(SSN_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'ssn',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.9,
      pattern: SSN_PATTERN.source,
      source: 'detector:pii/ssn',
      explanation: 'Detected US Social Security Number',
      originalText: match[0],
    })
  }

  for (const pattern of [CREDIT_CARD_16_PATTERN, CREDIT_CARD_AMEX_PATTERN]) {
    for (const match of input.matchAll(pattern)) {
      if (match.index === undefined) continue
      const digits = match[0].replace(/\D/g, '')
      if (digits.length < 15 || digits.length > 16) continue
      detections.push({
        type: 'credit-card',
        position: { start: match.index, end: match.index + match[0].length },
        confidence: 0.85,
        pattern: pattern.source,
        source: 'detector:pii/credit-card',
        explanation: 'Detected credit card number',
        originalText: match[0],
      })
    }
  }

  for (const match of input.matchAll(IPV4_PATTERN)) {
    if (match.index === undefined) continue
    const [a, b, c, d] = [match[1], match[2], match[3], match[4]].map(Number) as [number, number, number, number]
    if ([a, b, c, d].some((n) => n > 255)) continue
    if (isPrivateIp(a, b)) continue
    detections.push({
      type: 'ip-address',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.75,
      pattern: IPV4_PATTERN.source,
      source: 'detector:pii/ip-address',
      explanation: 'Detected public IP address',
      originalText: match[0],
    })
  }

  return detections
}
