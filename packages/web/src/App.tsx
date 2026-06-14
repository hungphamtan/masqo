import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { createEngine } from '@masqo/engine'
import { ReplacementMode } from '@masqo/shared'
import type { Detection } from '@masqo/shared'

const engine = createEngine()

type Mode = 'redact' | 'tokenize' | 'partial' | 'warn'
type Policy = 'none' | 'developer' | 'general'

const MODE_LABELS: Record<Mode, string> = {
  redact: 'Redact',
  tokenize: 'Tokenize',
  partial: 'Partial reveal',
  warn: 'Warn only',
}

const REPLACEMENT_MODES: Record<Mode, ReplacementMode> = {
  redact: ReplacementMode.Redact,
  tokenize: ReplacementMode.Tokenize,
  partial: ReplacementMode.Partial,
  warn: ReplacementMode.Warn,
}

const SEVERITY_COLOR: Record<string, string> = {
  high: '#E11D48',
  medium: '#F59E0B',
  low: '#64748B',
}

function confidenceToSeverity(c: number): string {
  if (c >= 0.9) return 'high'
  if (c >= 0.7) return 'medium'
  return 'low'
}

export function App() {
  const [input, setInput] = useState('')
  const [detections, setDetections] = useState<Detection[]>([])
  const [accepted, setAccepted] = useState<Set<number>>(new Set())
  const [mode, setMode] = useState<Mode>('redact')
  const [policy, setPolicy] = useState<Policy>('none')
  const [scanned, setScanned] = useState(false)
  const [autoScan, setAutoScan] = useState(true)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scan = useCallback((text = input) => {
    if (!text.trim()) return
    const result = engine.scan(text, {
      mode: REPLACEMENT_MODES[mode],
      ...(policy !== 'none' ? { presetName: policy } : {}),
    })
    setDetections(result.detections)
    setAccepted(new Set(result.detections.map((_, i) => i)))
    setScanned(true)
  }, [input, mode, policy])

  useEffect(() => {
    if (!autoScan || !input.trim()) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => scan(input), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [input, autoScan, scan])

  const toggle = (i: number) => {
    setAccepted((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const finalOutput = (() => {
    if (!scanned) return ''
    const toRedact = detections.filter((_, i) => accepted.has(i))
    const sorted = [...toRedact].sort((a, b) => b.position.start - a.position.start)
    let out = input
    for (const d of sorted) {
      out = out.slice(0, d.position.start) + `[REDACTED:${d.type}]` + out.slice(d.position.end)
    }
    return out
  })()

  const exportFile = () => {
    const blob = new Blob([finalOutput], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'redacted.txt'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(finalOutput).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const loadText = (text: string) => {
    setInput(text)
    setScanned(false)
    setDetections([])
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => loadText(ev.target?.result as string ?? '')
    reader.readAsText(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => loadText(ev.target?.result as string ?? '')
    reader.readAsText(file)
  }

  const clear = () => {
    setInput('')
    setDetections([])
    setAccepted(new Set())
    setScanned(false)
  }

  const threatCount = detections.filter((d) => confidenceToSeverity(d.confidence) === 'high').length

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={s.logoMark}>M</div>
            <span style={s.logoText}>Masqo</span>
          </Link>
          <span style={s.tagline}>Local secret redaction — nothing leaves your browser</span>
          <nav style={s.nav}>
            <Link to="/how-it-works" style={s.navLink}>How it works</Link>
            <Link to="/privacy" style={s.navLink}>Privacy</Link>
            <Link to="/terms" style={s.navLink}>Terms</Link>
          </nav>
        </div>
      </header>

      <main style={s.main}>
        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.toolbarGroup}>
            <span style={s.toolLabel}>Mode</span>
            <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} style={s.select}>
              {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
                <option key={m} value={m}>{MODE_LABELS[m]}</option>
              ))}
            </select>
          </div>
          <div style={s.toolbarGroup}>
            <span style={s.toolLabel}>Policy</span>
            <select value={policy} onChange={(e) => setPolicy(e.target.value as Policy)} style={s.select}>
              <option value="none">None</option>
              <option value="developer">Developer</option>
              <option value="general">General</option>
            </select>
          </div>
          <button onClick={() => fileRef.current?.click()} style={s.btnGhost}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Open file
          </button>
          <input ref={fileRef} type="file" accept="text/*" style={{ display: 'none' }} onChange={handleFileInput} />

          <div style={s.toolbarRight}>
            <label style={s.autoScanToggle}>
              <input
                type="checkbox"
                checked={autoScan}
                onChange={(e) => setAutoScan(e.target.checked)}
                style={{ display: 'none' }}
              />
              <span style={{ ...s.togglePill, background: autoScan ? '#E11D48' : '#CBD5E1' }}>
                <span style={{ ...s.toggleDot, transform: autoScan ? 'translateX(16px)' : 'translateX(2px)' }} />
              </span>
              <span style={s.toolLabel}>Auto-scan</span>
            </label>

            {!autoScan && (
              <button onClick={() => scan()} disabled={!input.trim()} style={s.btnPrimary}>
                Scan
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            )}

            {scanned && (
              <button onClick={clear} style={s.btnGhost}>Clear</button>
            )}
          </div>
        </div>

        {/* Status bar — only when scanned */}
        {scanned && (
          <div style={{
            ...s.statusBar,
            background: detections.length === 0 ? '#F0FDF4' : '#FFF1F2',
            borderColor: detections.length === 0 ? '#BBF7D0' : '#FECDD3',
          }}>
            {detections.length === 0 ? (
              <span style={{ color: '#15803D', fontWeight: 600, fontSize: 13 }}>
                ✓ No secrets detected — safe to share
              </span>
            ) : (
              <span style={{ color: '#9F1239', fontWeight: 600, fontSize: 13 }}>
                {threatCount > 0 && `⚠ ${threatCount} high-risk`}
                {threatCount > 0 && detections.length > threatCount && ` + `}
                {detections.length > threatCount && `${detections.length - threatCount} other`}
                {` detection${detections.length !== 1 ? 's' : ''} — ${accepted.size} selected for redaction`}
              </span>
            )}
            {detections.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                <button onClick={() => setAccepted(new Set(detections.map((_, i) => i)))} style={s.btnMicro}>Accept all</button>
                <button onClick={() => setAccepted(new Set())} style={s.btnMicro}>Reject all</button>
              </div>
            )}
          </div>
        )}

        {/* Editor panels */}
        <div style={s.panels}>
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <span style={s.panelLabel}>INPUT</span>
              <span style={s.panelMeta}>{input.length > 0 ? `${input.length.toLocaleString()} chars` : ''}</span>
            </div>
            <textarea
              style={s.textarea}
              value={input}
              onChange={(e) => { setInput(e.target.value); setScanned(false) }}
              placeholder="Paste text here, or drag-and-drop a file…"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              spellCheck={false}
            />
          </div>

          <div style={{ ...s.panel, position: 'relative' }}>
            <div style={s.panelHeader}>
              <span style={s.panelLabel}>OUTPUT</span>
              {scanned && finalOutput && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={copyOutput} style={{ ...s.btnMicro, color: copied ? '#15803D' : undefined }}>
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                  <button onClick={exportFile} style={s.btnMicro}>Export</button>
                </div>
              )}
            </div>
            <textarea
              style={{
                ...s.textarea,
                background: scanned && detections.length > 0 ? '#FFFBEB' : scanned ? '#F0FDF4' : '#F8FAFC',
                color: '#0F172A',
                cursor: 'default',
              }}
              value={scanned ? finalOutput : ''}
              readOnly
              placeholder="Redacted output appears here…"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Detection cards */}
        {scanned && detections.length > 0 && (
          <div style={s.detectionGrid}>
            {detections.map((d, i) => {
              const sev = confidenceToSeverity(d.confidence)
              const isOn = accepted.has(i)
              return (
                <div
                  key={i}
                  onClick={() => toggle(i)}
                  style={{
                    ...s.detectionCard,
                    borderLeft: `3px solid ${isOn ? SEVERITY_COLOR[sev] : '#CBD5E1'}`,
                    background: isOn ? '#fff' : '#F8FAFC',
                    opacity: isOn ? 1 : 0.6,
                  }}
                >
                  <div style={s.cardTop}>
                    <span style={{ ...s.cardBadge, background: isOn ? SEVERITY_COLOR[sev] : '#94A3B8' }}>
                      {d.type}
                    </span>
                    <span style={s.cardConf}>{Math.round(d.confidence * 100)}%</span>
                    <div style={{ marginLeft: 'auto' }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 4,
                        border: `2px solid ${isOn ? SEVERITY_COLOR[sev] : '#CBD5E1'}`,
                        background: isOn ? SEVERITY_COLOR[sev] : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isOn && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeWidth="2"><polyline points="2,6 5,9 10,3"/></svg>}
                      </div>
                    </div>
                  </div>
                  <div style={s.cardDesc}>{d.explanation}</div>
                  {d.originalText && (
                    <div style={s.cardOriginal}>
                      {d.originalText.length > 48
                        ? `${d.originalText.slice(0, 22)}…${d.originalText.slice(-12)}`
                        : d.originalText}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      <footer style={s.footer}>
        <span>All processing runs locally in your browser — no data sent to any server.</span>
        <nav style={{ display: 'flex', gap: 16 }}>
          <Link to="/how-it-works" style={s.footerLink}>How it works</Link>
          <Link to="/privacy" style={s.footerLink}>Privacy</Link>
          <Link to="/terms" style={s.footerLink}>Terms</Link>
        </nav>
      </footer>
    </div>
  )
}

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const MONO = '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace'

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#F8FAFC', fontFamily: FONT },
  header: { background: '#0F172A', color: '#fff', padding: '0 24px', borderBottom: '1px solid #1E293B' },
  headerInner: { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14, height: 56 },
  logoMark: { width: 28, height: 28, borderRadius: 6, background: '#E11D48', color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, letterSpacing: '-0.5px' },
  logoText: { fontWeight: 700, fontSize: 17, color: '#F8FAFC', letterSpacing: '-0.3px' },
  tagline: { fontSize: 12, color: '#475569', marginLeft: 4 },
  nav: { marginLeft: 'auto', display: 'flex', gap: 24 },
  navLink: { fontSize: 13, color: '#94A3B8', textDecoration: 'none' },
  main: { flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  toolbar: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px' },
  toolbarGroup: { display: 'flex', alignItems: 'center', gap: 7 },
  toolbarRight: { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' },
  toolLabel: { fontSize: 12, fontWeight: 600, color: '#64748B', whiteSpace: 'nowrap' },
  select: { height: 32, padding: '0 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, color: '#0F172A', background: '#F8FAFC', cursor: 'pointer' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', background: '#E11D48', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  btnGhost: { display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', background: 'transparent', color: '#475569', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, cursor: 'pointer' },
  btnMicro: { height: 26, padding: '0 10px', background: 'transparent', color: '#475569', border: '1px solid #E2E8F0', borderRadius: 5, fontSize: 12, cursor: 'pointer' },
  autoScanToggle: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  togglePill: { display: 'inline-flex', width: 36, height: 20, borderRadius: 10, position: 'relative', transition: 'background 0.2s', flexShrink: 0 },
  toggleDot: { position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  statusBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 8, border: '1px solid', fontSize: 13 },
  panels: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  panel: { display: 'flex', flexDirection: 'column', gap: 6 },
  panelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' },
  panelLabel: { fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em' },
  panelMeta: { fontSize: 11, color: '#CBD5E1' },
  textarea: { padding: '12px 14px', height: 340, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontFamily: MONO, fontSize: 12, lineHeight: 1.65, resize: 'vertical', color: '#0F172A', outline: 'none', transition: 'border-color 0.15s' },
  detectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 8 },
  detectionCard: { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', transition: 'box-shadow 0.15s', display: 'flex', flexDirection: 'column', gap: 5 },
  cardTop: { display: 'flex', alignItems: 'center', gap: 7 },
  cardBadge: { fontSize: 11, fontWeight: 700, color: '#fff', padding: '2px 7px', borderRadius: 4, fontFamily: MONO, letterSpacing: '0.02em' },
  cardConf: { fontSize: 11, color: '#94A3B8', fontWeight: 600 },
  cardDesc: { fontSize: 12, color: '#475569', lineHeight: 1.4 },
  cardOriginal: { fontSize: 11, fontFamily: MONO, color: '#E11D48', background: '#FFF1F2', padding: '3px 7px', borderRadius: 4, wordBreak: 'break-all' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', fontSize: 11, color: '#94A3B8', borderTop: '1px solid #E2E8F0', background: '#fff', flexWrap: 'wrap', gap: 8 },
  footerLink: { color: '#94A3B8', textDecoration: 'none' },
}
