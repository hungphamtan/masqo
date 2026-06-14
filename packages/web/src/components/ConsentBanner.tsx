import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'masqo_analytics_consent'

export type ConsentState = 'accepted' | 'declined' | null

export function getConsent(): ConsentState {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'accepted' || v === 'declined') return v
  } catch { /* ignore */ }
  return null
}

function setConsent(value: 'accepted' | 'declined'): void {
  try { localStorage.setItem(STORAGE_KEY, value) } catch { /* ignore */ }
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

export function ConsentBanner({ onConsent }: { onConsent: (v: ConsentState) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (getConsent() === null) setVisible(true)
  }, [])

  if (!visible) return null

  const handle = (v: 'accepted' | 'declined') => {
    setConsent(v)
    setVisible(false)
    onConsent(v)
  }

  return (
    <div style={s.overlay}>
      <div style={s.banner}>
        <div style={s.content}>
          <span style={s.icon}>📊</span>
          <div style={s.text}>
            <strong style={s.title}>Anonymous analytics</strong>
            <span style={s.desc}>
              We use{' '}
              <a href="https://plausible.io" target="_blank" rel="noopener noreferrer" style={s.link}>
                Plausible
              </a>
              {' '}— cookieless, no personal data, no fingerprinting. Helps us see which features matter.{' '}
              <a href="/privacy" style={s.link}>Privacy policy</a>
            </span>
          </div>
        </div>
        <div style={s.actions}>
          <button onClick={() => handle('declined')} style={s.btnDecline}>No thanks</button>
          <button onClick={() => handle('accepted')} style={s.btnAccept}>Allow</button>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, padding: '0 16px 16px', pointerEvents: 'none', fontFamily: FONT },
  banner: { maxWidth: 680, margin: '0 auto', background: '#0F172A', color: '#F8FAFC', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', pointerEvents: 'all', flexWrap: 'wrap' },
  content: { display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 },
  icon: { fontSize: 20, flexShrink: 0, marginTop: 1 },
  text: { display: 'flex', flexDirection: 'column', gap: 2 },
  title: { fontSize: 13, fontWeight: 700, color: '#F8FAFC' },
  desc: { fontSize: 12, color: '#94A3B8', lineHeight: 1.5 },
  link: { color: '#E11D48', textDecoration: 'none' },
  actions: { display: 'flex', gap: 8, flexShrink: 0 },
  btnDecline: { height: 32, padding: '0 14px', background: 'transparent', color: '#64748B', border: '1px solid #334155', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: FONT },
  btnAccept: { height: 32, padding: '0 14px', background: '#E11D48', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: FONT },
}
