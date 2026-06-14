import type { Detection } from '@masqo/shared'

const STRIPE_SECRET_LIVE_PATTERN = /sk_live_[A-Za-z0-9]{24,}/g
const STRIPE_SECRET_TEST_PATTERN = /sk_test_[A-Za-z0-9]{24,}/g
const STRIPE_PUBLISHABLE_PATTERN = /pk_(live|test)_[A-Za-z0-9]{24,}/g

export function detectStripeSecrets(input: string): Detection[] {
  const detections: Detection[] = []

  for (const match of input.matchAll(STRIPE_SECRET_LIVE_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'stripe-secret-key',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.99,
      pattern: 'sk_live_[A-Za-z0-9]{24,}',
      source: 'detector:secrets/stripe',
      explanation: 'Detected Stripe live secret key (sk_live_ prefix) — high risk',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(STRIPE_SECRET_TEST_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'stripe-secret-key',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.9,
      pattern: 'sk_test_[A-Za-z0-9]{24,}',
      source: 'detector:secrets/stripe',
      explanation: 'Detected Stripe test secret key (sk_test_ prefix)',
      originalText: match[0],
    })
  }

  for (const match of input.matchAll(STRIPE_PUBLISHABLE_PATTERN)) {
    if (match.index === undefined) continue
    detections.push({
      type: 'stripe-publishable-key',
      position: { start: match.index, end: match.index + match[0].length },
      confidence: 0.85,
      pattern: 'pk_(live|test)_[A-Za-z0-9]{24,}',
      source: 'detector:secrets/stripe',
      explanation: 'Detected Stripe publishable key (pk_ prefix)',
      originalText: match[0],
    })
  }

  return detections
}
