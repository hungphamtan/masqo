// Plausible Analytics — cookieless, no PII, GDPR-compliant without consent in most jurisdictions.
// We still ask for consent to be conservative and on-brand.
// Docs: https://plausible.io/docs/script-extensions

const PLAUSIBLE_DOMAIN = 'masqo.dev' // update when domain is live

let loaded = false

export function loadAnalytics(): void {
  if (loaded || typeof document === 'undefined') return
  loaded = true

  const script = document.createElement('script')
  script.defer = true
  script.setAttribute('data-domain', PLAUSIBLE_DOMAIN)
  script.src = 'https://plausible.io/js/script.js'
  document.head.appendChild(script)
}

export function trackEvent(name: string, props?: Record<string, string | number>): void {
  if (typeof window === 'undefined') return
  const plausible = (window as Window & { plausible?: (n: string, o?: object) => void }).plausible
  if (typeof plausible === 'function') {
    plausible(name, props ? { props } : undefined)
  }
}
