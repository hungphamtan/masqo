import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import type { Detection } from '@masqo/shared'

interface ReviewData {
  original: string
  output: string
  detections: Detection[]
}

const MONO = '"JetBrains Mono", "Fira Code", ui-monospace, monospace'
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function confidenceToSeverity(c: number): 'high' | 'medium' | 'low' {
  if (c >= 0.9) return 'high'
  if (c >= 0.7) return 'medium'
  return 'low'
}

const SEV_COLOR = { high: '#E11D48', medium: '#F59E0B', low: '#64748B' }
const SEV_LABEL = { high: 'HIGH', medium: 'MED', low: 'LOW' }

function Sidebar() {
  const [data, setData] = useState<ReviewData | null>(null)
  const [accepted, setAccepted] = useState<Set<number>>(new Set())
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'MASQO_REVIEW_DATA') {
        const d = event.data as ReviewData & { type: string }
        if (d.original && Array.isArray(d.detections)) {
          setData(d)
          setAccepted(new Set(d.detections.map((_, i) => i)))
        }
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const toggle = (i: number) => {
    setAccepted((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const buildOutput = () => {
    if (!data) return ''
    let out = data.original
    const toRedact = data.detections.filter((_, i) => accepted.has(i))
    const sorted = [...toRedact].sort((a, b) => b.position.start - a.position.start)
    for (const d of sorted) {
      out = out.slice(0, d.position.start) + `[REDACTED:${d.type}]` + out.slice(d.position.end)
    }
    return out
  }

  const pasteClean = () => {
    window.parent.postMessage({ type: 'MASQO_ACCEPT', text: buildOutput() }, window.location.origin)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(buildOutput()).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const reject = () => {
    window.parent.postMessage({ type: 'MASQO_REJECT' }, window.location.origin)
  }

  if (!data) {
    return (
      <div style={s.waiting}>
        <div style={s.waitingIcon}>M</div>
        <div style={s.waitingTitle}>Masqo is watching</div>
        <div style={s.waitingDesc}>Paste into the chat to scan for secrets</div>
      </div>
    )
  }

  const highCount = data.detections.filter(d => confidenceToSeverity(d.confidence) === 'high').length

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoMark}>M</div>
          <span style={s.logoText}>Masqo</span>
        </div>
        <div style={s.threatPill}>
          <span style={{ color: highCount > 0 ? '#E11D48' : '#94A3B8', fontWeight: 700 }}>
            {data.detections.length}
          </span>
          <span style={{ color: '#64748B', marginLeft: 3 }}>
            {data.detections.length === 1 ? 'secret' : 'secrets'}
          </span>
        </div>
      </div>

      {/* Preview strip */}
      <div style={s.previewStrip}>
        <div style={s.previewCol}>
          <div style={s.previewLabel}>ORIGINAL</div>
          <pre style={s.previewCode}>{data.original}</pre>
        </div>
        <div style={s.previewDivider} />
        <div style={s.previewCol}>
          <div style={s.previewLabel}>REDACTED</div>
          <pre style={{ ...s.previewCode, color: '#15803D' }}>{buildOutput()}</pre>
        </div>
      </div>

      {/* Detection list */}
      <div style={s.detectionList}>
        <div style={s.sectionHeader}>
          <span style={s.sectionLabel}>DETECTIONS</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setAccepted(new Set(data.detections.map((_, i) => i)))} style={s.microBtn}>All</button>
            <button onClick={() => setAccepted(new Set())} style={s.microBtn}>None</button>
          </div>
        </div>

        {data.detections.map((d, i) => {
          const sev = confidenceToSeverity(d.confidence)
          const isOn = accepted.has(i)
          return (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                ...s.detectionCard,
                borderLeftColor: isOn ? SEV_COLOR[sev] : '#E2E8F0',
                opacity: isOn ? 1 : 0.5,
              }}
            >
              <div style={s.cardRow}>
                <span style={{ ...s.sevBadge, background: SEV_COLOR[sev] }}>{SEV_LABEL[sev]}</span>
                <span style={s.typeLabel}>{d.type}</span>
                <span style={s.confLabel}>{Math.round(d.confidence * 100)}%</span>
                <div style={{ marginLeft: 'auto', ...s.checkbox, borderColor: isOn ? SEV_COLOR[sev] : '#CBD5E1', background: isOn ? SEV_COLOR[sev] : 'transparent' }}>
                  {isOn && <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2.5"><polyline points="2,6 5,9 10,3"/></svg>}
                </div>
              </div>
              {d.originalText && (
                <div style={s.cardSecret}>
                  {d.originalText.length > 44 ? `${d.originalText.slice(0, 20)}…${d.originalText.slice(-12)}` : d.originalText}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button onClick={reject} style={s.btnCancel}>Cancel</button>
        <button onClick={copyToClipboard} style={s.btnSecondary}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
        <button onClick={pasteClean} style={s.btnPrimary}>
          Paste clean ({accepted.size})
        </button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#F8FAFC', fontFamily: FONT, fontSize: 13, overflow: 'hidden' },

  waiting: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0F172A', gap: 10 },
  waitingIcon: { width: 44, height: 44, borderRadius: 12, background: '#E11D48', color: '#fff', fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  waitingTitle: { color: '#F8FAFC', fontWeight: 700, fontSize: 15, marginTop: 4 },
  waitingDesc: { color: '#475569', fontSize: 12, textAlign: 'center' },

  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#0F172A', borderBottom: '1px solid #1E293B', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  logoMark: { width: 24, height: 24, borderRadius: 5, background: '#E11D48', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 700, fontSize: 14, color: '#F8FAFC', letterSpacing: '-0.2px' },
  threatPill: { background: '#1E293B', padding: '3px 10px', borderRadius: 20, fontSize: 12 },

  previewStrip: { display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid #E2E8F0', flexShrink: 0, maxHeight: 160, overflow: 'hidden' },
  previewCol: { flex: 1, padding: '8px 10px', minWidth: 0 },
  previewDivider: { width: 1, background: '#E2E8F0', flexShrink: 0 },
  previewLabel: { fontSize: 9, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 5 },
  previewCode: { fontSize: 10, fontFamily: MONO, whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, color: '#334155', lineHeight: 1.5, overflow: 'hidden', maxHeight: 120 },

  detectionList: { flex: 1, overflow: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionLabel: { fontSize: 9, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em' },
  microBtn: { height: 22, padding: '0 8px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: 4, fontSize: 11, cursor: 'pointer' },

  detectionCard: { background: '#fff', border: '1px solid #E2E8F0', borderLeft: '3px solid', borderRadius: 6, padding: '8px 10px', cursor: 'pointer', transition: 'opacity 0.15s', display: 'flex', flexDirection: 'column', gap: 5 },
  cardRow: { display: 'flex', alignItems: 'center', gap: 6 },
  sevBadge: { fontSize: 9, fontWeight: 800, color: '#fff', padding: '1px 5px', borderRadius: 3, letterSpacing: '0.05em', flexShrink: 0 },
  typeLabel: { fontSize: 12, fontWeight: 700, color: '#1E293B', fontFamily: MONO },
  confLabel: { fontSize: 11, color: '#94A3B8', fontWeight: 600 },
  checkbox: { width: 16, height: 16, borderRadius: 3, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardSecret: { fontSize: 10, fontFamily: MONO, color: '#E11D48', background: '#FFF1F2', padding: '2px 6px', borderRadius: 3, wordBreak: 'break-all' },

  actions: { display: 'flex', gap: 6, padding: '10px 12px', borderTop: '1px solid #E2E8F0', background: '#fff', flexShrink: 0 },
  btnCancel: { height: 34, padding: '0 12px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  btnSecondary: { height: 34, padding: '0 12px', background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  btnPrimary: { flex: 1, height: 34, background: '#E11D48', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13 },
}

const root = createRoot(document.getElementById('root')!)
root.render(<Sidebar />)
