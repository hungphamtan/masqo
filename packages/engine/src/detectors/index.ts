import type { Detector } from '../types.js'
import { detectAwsSecrets } from './secrets/aws.js'

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
    detectors.set('aws', {
      name: 'aws',
      detect: detectAwsSecrets,
    })
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
