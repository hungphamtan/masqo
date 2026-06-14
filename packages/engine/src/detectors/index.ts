import type { Detector } from '../types.js'
import { detectAwsSecrets } from './secrets/aws.js'
import { detectGcpSecrets } from './secrets/gcp.js'
import { detectGithubSecrets } from './secrets/github.js'
import { detectStripeSecrets } from './secrets/stripe.js'
import { detectJwt } from './secrets/jwt.js'
import { detectBearerTokens } from './secrets/bearer.js'
import { detectCookies } from './secrets/cookies.js'
import { detectDatabaseSecrets } from './secrets/database.js'

interface Registry {
  register(name: string, detector: Detector): void
  get(name: string): Detector
  list(): string[]
}

interface CreateRegistryOptions {
  builtins?: boolean
}

export function createRegistry(options: CreateRegistryOptions = {}): Registry {
  const detectors = new Map<string, Detector>()

  if (options.builtins) {
    detectors.set('aws', { name: 'aws', detect: detectAwsSecrets })
    detectors.set('gcp', { name: 'gcp', detect: detectGcpSecrets })
    detectors.set('github', { name: 'github', detect: detectGithubSecrets })
    detectors.set('stripe', { name: 'stripe', detect: detectStripeSecrets })
    detectors.set('jwt', { name: 'jwt', detect: detectJwt })
    detectors.set('bearer', { name: 'bearer', detect: detectBearerTokens })
    detectors.set('cookies', { name: 'cookies', detect: detectCookies })
    detectors.set('database', { name: 'database', detect: detectDatabaseSecrets })
  }

  return {
    register(name: string, detector: Detector): void {
      if (detectors.has(name)) {
        throw new Error(`Detector '${name}' is already registered`)
      }
      detectors.set(name, detector)
    },

    get(name: string): Detector {
      const detector = detectors.get(name)
      if (!detector) {
        throw new Error(`Detector '${name}' not found`)
      }
      return detector
    },

    list(): string[] {
      return [...detectors.keys()]
    },
  }
}
