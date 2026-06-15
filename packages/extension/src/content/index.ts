import { interceptPaste, injectSidebar, insertTextAtCursor } from './common.js'
import { BUILT_IN_SITES, matchSite } from '../sites.js'
import type { SiteConfig } from '../sites.js'
import type { ScanResponse } from '../types.js'

async function getActiveSites(): Promise<SiteConfig[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get('masqo_settings', (result) => {
      const settings = result['masqo_settings'] as {
        disabledSiteIds?: string[]
        customSites?: SiteConfig[]
      } | undefined

      const disabled = new Set(settings?.disabledSiteIds ?? [])
      const builtIn = BUILT_IN_SITES.filter((s) => !disabled.has(s.id))
      const custom = settings?.customSites ?? []
      resolve([...builtIn, ...custom])
    })
  })
}

async function init() {
  const hostname = window.location.hostname
  const sites = await getActiveSites()
  const site = matchSite(hostname, sites)

  if (!site) {
    console.debug('[Masqo] no matching site config for', hostname)
    return
  }

  console.debug('[Masqo] active on', site.name, '(', hostname, ')')

  interceptPaste(site, (original: string, result: ScanResponse) => {
    const activeEl = document.activeElement as HTMLElement | null
    injectSidebar(
      original,
      result,
      (cleanText) => {
        if (activeEl) {
          activeEl.focus()
          insertTextAtCursor(activeEl, cleanText)
        }
      },
      () => {}
    )
  })
}

init()
