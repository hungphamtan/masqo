import { z } from 'zod'

const SEMVER_RE = /^\d+\.\d+\.\d+$/

const ReplacementModeSchema = z.enum(['redact', 'tokenize', 'partial', 'warn'])

const CustomRuleSchema = z.object({
  pattern: z.string(),
  type: z.string(),
  name: z.string(),
})

const DetectorSettingSchema = z.object({
  enabled: z.boolean(),
  confidence: z.enum(['low', 'medium', 'high']).optional(),
})

const PolicySchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(SEMVER_RE, 'version must be semver (x.y.z)'),
  detectors: z.record(z.string(), DetectorSettingSchema).optional().default({}),
  customRules: z.array(CustomRuleSchema).optional().default([]),
  replacementMode: ReplacementModeSchema,
})

export type Policy = z.infer<typeof PolicySchema>

export class PolicyParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PolicyParseError'
  }
}

export function parsePolicy(json: string): Policy {
  let raw: unknown
  try {
    raw = JSON.parse(json)
  } catch {
    throw new PolicyParseError('Invalid JSON: failed to parse policy file')
  }

  const result = PolicySchema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ')
    throw new PolicyParseError(`Policy validation failed — ${issues}`)
  }

  for (const rule of result.data.customRules) {
    try {
      new RegExp(rule.pattern)
    } catch {
      throw new PolicyParseError(
        `Policy validation failed — customRules: invalid regex pattern "${rule.pattern}"`
      )
    }
  }

  return result.data
}
