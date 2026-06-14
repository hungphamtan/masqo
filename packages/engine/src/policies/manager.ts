import { parsePolicy, PolicyParseError } from './parser.js'
import type { Policy } from './parser.js'

type CustomRule = Policy['customRules'][number]
type DetectorMap = Policy['detectors']

interface ValidateResult {
  ok: boolean
  error?: string
}

interface PolicyManager {
  loadPolicy(json: string): Policy
  savePolicy(policy: Policy): string
  mergeRules(base: Policy, rules: CustomRule[], detectors?: DetectorMap): Policy
  validatePolicy(json: string): ValidateResult
}

export function createPolicyManager(): PolicyManager {
  return {
    loadPolicy(json: string): Policy {
      return parsePolicy(json)
    },

    savePolicy(policy: Policy): string {
      return JSON.stringify(policy, null, 2)
    },

    mergeRules(base: Policy, rules: CustomRule[], detectors: DetectorMap = {}): Policy {
      return {
        ...base,
        detectors: { ...base.detectors, ...detectors },
        customRules: [...base.customRules, ...rules],
      }
    },

    validatePolicy(json: string): ValidateResult {
      try {
        parsePolicy(json)
        return { ok: true }
      } catch (e) {
        return {
          ok: false,
          error: e instanceof PolicyParseError ? e.message : String(e),
        }
      }
    },
  }
}

export type { Policy, PolicyManager }
