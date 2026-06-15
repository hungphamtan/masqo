import { ReplacementMode } from '@masqo/shared'
import type { Detection } from '@masqo/shared'
import type { EngineConfig, ScanResult } from './types.js'
import { createRegistry } from './detectors/index.js'
import { redact } from './replacers/redact.js'
import { tokenize } from './replacers/tokenize.js'
import { partial } from './replacers/partial.js'
import { warn } from './replacers/warn.js'
import { loadPreset } from './policies/presets.js'
import type { Policy } from './policies/parser.js'

// Map policy detector group names → individual registry detector names
const DETECTOR_GROUPS: Record<string, string[]> = {
  secrets: ['aws', 'gcp', 'github', 'gitlab', 'stripe', 'jwt', 'bearer', 'cookies',
             'database', 'env', 'privatekeys', 'slack', 'openai', 'sendgrid',
             'twilio', 'npm', 'pypi', 'azure', 'basicauth'],
  logs: ['stacktrace', 'http', 'config'],
  pii: ['pii'],
}

export class Engine {
  private readonly registry = createRegistry({ builtins: true })

  scan(input: string, config: EngineConfig): ScanResult {
    const policy = resolvePolicy(config)
    const effectiveMode = policy
      ? (policy.replacementMode as ReplacementMode)
      : config.mode

    const enabledNames = resolveDetectors(config, policy, this.registry.list())
    const minConfidence = config.minConfidence ?? 0

    let allDetections: Detection[] = []

    for (const name of enabledNames) {
      let detector
      try {
        detector = this.registry.get(name)
      } catch {
        continue
      }
      const found = detector.detect(input).filter((d) => d.confidence >= minConfidence)
      allDetections = allDetections.concat(found)
    }

    // Apply custom rules from policy
    if (policy) {
      for (const rule of policy.customRules) {
        try {
          const re = new RegExp(rule.pattern, 'g')
          for (const match of input.matchAll(re)) {
            if (match.index === undefined) continue
            allDetections.push({
              type: rule.type,
              position: { start: match.index, end: match.index + match[0].length },
              confidence: 0.9,
              pattern: rule.pattern,
              source: `policy:custom/${rule.name}`,
              explanation: `Custom rule matched: ${rule.name}`,
              originalText: match[0],
            })
          }
        } catch {
          // invalid regex already rejected by parser; skip silently here
        }
      }
    }

    const output = applyMode(input, allDetections, effectiveMode)

    return {
      original: input,
      output,
      detections: allDetections,
      mode: effectiveMode,
    }
  }
}

function resolvePolicy(config: EngineConfig): Policy | undefined {
  if (config.policy) return config.policy
  if (config.presetName) return loadPreset(config.presetName)
  return undefined
}

function resolveDetectors(
  config: EngineConfig,
  policy: Policy | undefined,
  allNames: string[]
): string[] {
  // Explicit list always wins
  if (config.enabledDetectors) return config.enabledDetectors

  if (!policy) return allNames

  // Build enabled set from policy detector groups
  const enabled = new Set<string>()
  for (const [group, setting] of Object.entries(policy.detectors)) {
    if (!setting.enabled) continue
    const members = DETECTOR_GROUPS[group]
    if (members) {
      members.forEach((n) => enabled.add(n))
    } else {
      // Unknown group treated as individual detector name
      enabled.add(group)
    }
  }

  // If policy has no detector settings, run all
  if (Object.keys(policy.detectors).length === 0) return allNames

  return allNames.filter((n) => enabled.has(n))
}

function applyMode(input: string, detections: Detection[], mode: ReplacementMode): string {
  switch (mode) {
    case ReplacementMode.Redact:
      return redact(input, detections)
    case ReplacementMode.Tokenize:
      return tokenize(input, detections)
    case ReplacementMode.Partial:
      return partial(input, detections)
    case ReplacementMode.Warn:
      return warn(input, detections).output
  }
}

export function createEngine(): Engine {
  return new Engine()
}
