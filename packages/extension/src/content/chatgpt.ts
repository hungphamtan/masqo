import { interceptPaste, injectSidebar, insertTextAtCursor } from './common.js'
import type { ScanResponse } from '../types.js'

const CONFIG = {
  name: 'ChatGPT',
  textareaSelector: '#prompt-textarea, [data-testid="prompt-textarea"], div[contenteditable="true"]',
}

interceptPaste(CONFIG, (original: string, result: ScanResponse) => {
  const activeEl = document.activeElement as HTMLElement | null
  injectSidebar(
    original,
    result,
    (cleanText) => {
      if (activeEl) insertTextAtCursor(activeEl, cleanText)
    },
    () => {
      // Rejected — user chose not to paste
    }
  )
})
