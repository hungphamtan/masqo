import type { Detector } from '../types.js'
import { detectAwsSecrets } from './secrets/aws.js'
import { detectGcpSecrets } from './secrets/gcp.js'
import { detectGithubSecrets } from './secrets/github.js'
import { detectStripeSecrets } from './secrets/stripe.js'
import { detectJwt } from './secrets/jwt.js'
import { detectBearerTokens } from './secrets/bearer.js'
import { detectCookies } from './secrets/cookies.js'
import { detectDatabaseSecrets } from './secrets/database.js'
import { detectEnvSecrets } from './secrets/env.js'
import { detectStackTraces } from './code/stacktrace.js'
import { detectHttpSecrets } from './code/http.js'
import { detectConfigSecrets } from './code/config.js'
import { detectPrivateKeys } from './secrets/privatekeys.js'
import { detectSlackSecrets } from './secrets/slack.js'
import { detectOpenAiSecrets } from './secrets/openai.js'
import { detectGitlabSecrets } from './secrets/gitlab.js'
import { detectSendgridSecrets } from './secrets/sendgrid.js'
import { detectTwilioSecrets } from './secrets/twilio.js'
import { detectNpmSecrets } from './secrets/npm.js'
import { detectPypiSecrets } from './secrets/pypi.js'
import { detectAzureSecrets } from './secrets/azure.js'
import { detectBasicAuthUrls } from './secrets/basicauth.js'
import { detectPii } from './pii/pii.js'

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
    detectors.set('env', { name: 'env', detect: detectEnvSecrets })
    detectors.set('stacktrace', { name: 'stacktrace', detect: detectStackTraces })
    detectors.set('http', { name: 'http', detect: detectHttpSecrets })
    detectors.set('config', { name: 'config', detect: detectConfigSecrets })
    detectors.set('privatekeys', { name: 'privatekeys', detect: detectPrivateKeys })
    detectors.set('slack', { name: 'slack', detect: detectSlackSecrets })
    detectors.set('openai', { name: 'openai', detect: detectOpenAiSecrets })
    detectors.set('gitlab', { name: 'gitlab', detect: detectGitlabSecrets })
    detectors.set('sendgrid', { name: 'sendgrid', detect: detectSendgridSecrets })
    detectors.set('twilio', { name: 'twilio', detect: detectTwilioSecrets })
    detectors.set('npm', { name: 'npm', detect: detectNpmSecrets })
    detectors.set('pypi', { name: 'pypi', detect: detectPypiSecrets })
    detectors.set('azure', { name: 'azure', detect: detectAzureSecrets })
    detectors.set('basicauth', { name: 'basicauth', detect: detectBasicAuthUrls })
    detectors.set('pii', { name: 'pii', detect: detectPii })
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
