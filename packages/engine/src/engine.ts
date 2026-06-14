import { ReplacementMode } from '@masqo/shared'
import type { Detection } from '@masqo/shared'
import type { EngineConfig, ScanResult } from './types.js'
import { createRegistry } from './detectors/index.js'
import { redact } from './replacers/redact.js'
import { tokenize } from './replacers/tokenize.js'
import { partial } from './replacers/partial.js'
import { warn } from './replacers/warn.js'

export class Engine {
  private readonly registry = createRegistry({ builtins: true })

  scan(input: string, config: EngineConfig): ScanResult {
    const enabledNames = config.enabledDetectors ?? this.registry.list()
    const minConfidence = config.minConfidence ?? 0

    let allDetections: Detection[] = []
    for (const name of enabledNames) {
      let detector
      try {
        detector = this.registry.get(name)
      } catch {
        continue // unknown detector name — skip
      }
      const found = detector.detect(input).filter((d) => d.confidence >= minConfidence)
      allDetections = allDetections.concat(found)
    }

    const output = applyMode(input, allDetections, config.mode)

    return {
      original: input,
      output,
      detections: allDetections,
      mode: config.mode,
    }
  }
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
