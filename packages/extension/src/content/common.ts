import type { MessageToBackground, MessageFromBackground, ScanResponse } from '../types.js'

export interface SiteConfig {
  name: string
  textareaSelector: string
}

export async function scanText(text: string, policy?: string): Promise<ScanResponse | null> {
  return new Promise((resolve) => {
    const msg: MessageToBackground = { type: 'SCAN', text, policy }
    chrome.runtime.sendMessage(msg, (response: MessageFromBackground) => {
      if (chrome.runtime.lastError || !response) {
        resolve(null)
        return
      }
      if (response.type === 'SCAN_RESULT') {
        resolve(response)
      } else {
        resolve(null)
      }
    })
  })
}

export function interceptPaste(
  config: SiteConfig,
  onDetection: (original: string, result: ScanResponse) => void
): void {
  document.addEventListener('paste', async (event: ClipboardEvent) => {
    const text = event.clipboardData?.getData('text/plain')
    if (!text?.trim()) return

    const target = event.target as HTMLElement
    const inEditable =
      target.matches(config.textareaSelector) ||
      !!target.closest(config.textareaSelector) ||
      target.isContentEditable ||
      !!(target as HTMLElement).closest('[contenteditable="true"]')

    if (!inEditable) {
      console.debug('[Masqo] paste outside editable, skipping', target)
      return
    }

    // Must call preventDefault synchronously - browser inserts paste text after
    // the current task completes, so any async await before this is too late.
    event.preventDefault()
    console.debug('[Masqo] paste intercepted on', config.name, '— scanning', text.length, 'chars')

    const result = await scanText(text)
    console.debug('[Masqo] scan result', result)

    if (!result || result.detections.length === 0) {
      console.debug('[Masqo] no detections, reinserting original text')
      // We already prevented the default paste, so manually reinsert
      const active = document.activeElement as HTMLElement
      if (active) insertTextAtCursor(active, text)
      return
    }

    onDetection(text, result)
  }, true)
}

export function injectSidebar(
  original: string,
  result: ScanResponse,
  onAccept: (text: string) => void,
  onReject: () => void
): void {
  document.getElementById('masqo-sidebar')?.remove()

  const sidebarUrl = chrome.runtime.getURL('src/sidebar/index.html')
  // Use the extension's own origin to scope postMessage - prevents any page
  // script from injecting MASQO_ACCEPT and replacing the user's paste content
  const extensionOrigin = chrome.runtime.getURL('').slice(0, -1)

  const container = document.createElement('div')
  container.id = 'masqo-sidebar'
  Object.assign(container.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '420px',
    height: '100vh',
    zIndex: '2147483647',
    border: 'none',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.3)',
  })

  const iframe = document.createElement('iframe')
  iframe.src = sidebarUrl
  iframe.style.cssText = 'width:100%;height:100%;border:none;'

  container.appendChild(iframe)
  document.body.appendChild(container)

  iframe.addEventListener('load', () => {
    iframe.contentWindow?.postMessage({
      type: 'MASQO_REVIEW_DATA',
      original,
      output: result.output,
      detections: result.detections,
    }, extensionOrigin)
  })

  // Named handler so it can be removed after use - prevents listener accumulation
  // across multiple paste events
  const msgHandler = (event: MessageEvent) => {
    // Sidebar (chrome-extension://) posts to window.parent (host page context).
    // event.origin here is the extension origin - validate it.
    // If origin doesn't match the extension, ignore.
    if (event.origin !== extensionOrigin) return
    if (event.data?.type === 'MASQO_ACCEPT') {
      container.remove()
      window.removeEventListener('message', msgHandler)
      onAccept(event.data.text as string)
    } else if (event.data?.type === 'MASQO_REJECT') {
      container.remove()
      window.removeEventListener('message', msgHandler)
      onReject()
    } else if (event.data?.type === 'MASQO_COPY') {
      navigator.clipboard.writeText(event.data.text as string).catch(() => {})
    }
  }
  window.addEventListener('message', msgHandler)
}

export function insertTextAtCursor(element: HTMLElement, text: string): void {
  element.focus()
  const inputEvent = new InputEvent('input', {
    data: text,
    inputType: 'insertText',
    bubbles: true,
  })
  if (element.isContentEditable) {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      sel.collapseToEnd()
    }
  } else {
    const el = element as HTMLTextAreaElement
    const start = el.selectionStart ?? 0
    const end = el.selectionEnd ?? 0
    el.value = el.value.slice(0, start) + text + el.value.slice(end)
    el.selectionStart = el.selectionEnd = start + text.length
  }
  element.dispatchEvent(inputEvent)
}
