import { interceptPaste, injectSidebar, insertTextAtCursor } from './common.js'
import type { ScanResponse } from '../types.js'

const CONFIG = {
  name: 'Claude',
  textareaSelector: '[contenteditable="true"], .ProseMirror, div[data-placeholder]',
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
