import { createEngine } from '@masqo/engine'
import { ReplacementMode } from '@masqo/shared'
import type { MessageToBackground, MessageFromBackground } from '../types.js'

const engine = createEngine()

chrome.runtime.onMessage.addListener(
  (message: MessageToBackground, _sender, sendResponse: (r: MessageFromBackground) => void) => {
    if (message.type !== 'SCAN') return false

    try {
      const result = engine.scan(message.text, {
        mode: ReplacementMode.Redact,
        ...(message.policy && message.policy !== 'default' ? { presetName: message.policy } : {}),
      })

      sendResponse({
        type: 'SCAN_RESULT',
        output: result.output,
        detections: result.detections,
        mode: result.mode,
      })
    } catch (e) {
      sendResponse({
        type: 'ERROR',
        message: e instanceof Error ? e.message : String(e),
      })
    }

    return true // keep channel open for async
  }
)
