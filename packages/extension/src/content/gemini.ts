import { interceptPaste, injectSidebar, insertTextAtCursor } from './common.js'
import type { ScanResponse } from '../types.js'

const CONFIG = {
  name: 'Gemini',
  textareaSelector: 'rich-textarea, [contenteditable="true"], .ql-editor',
}

interceptPaste(CONFIG, (original: string, result: ScanResponse) => {
  const activeEl = document.activeElement as HTMLElement | null
  injectSidebar(
    original,
    result,
    (cleanText) => {
      if (activeEl) insertTextAtCursor(activeEl, cleanText)
    },
    () => {}
  )
})
