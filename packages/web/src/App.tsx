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
  partial: 'Partial',
  warn: 'Warn only',
}

const REPLACEMENT_MODES: Record<Mode, ReplacementMode> = {
  redact: ReplacementMode.Redact,
  tokenize: ReplacementMode.Tokenize,
  partial: ReplacementMode.Partial,
  warn: ReplacementMode.Warn,
}

export function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [detections, setDetections] = useState<Detection[]>([])
  const [accepted, setAccepted] = useState<Set<number>>(new Set())
  const [mode, setMode] = useState<Mode>('redact')
  const [policy, setPolicy] = useState<Policy>('none')
  const [scanned, setScanned] = useState(false)
  const [autoScan, setAutoScan] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scan = useCallback((text = input) => {
    if (!text.trim()) return
    const result = engine.scan(text, {
      mode: REPLACEMENT_MODES[mode],
      ...(policy !== 'none' ? { presetName: policy } : {}),
    })
    setOutput(result.output)
    setDetections(result.detections)
    setAccepted(new Set(result.detections.map((_, i) => i)))
    setScanned(true)
  }, [input, mode, policy])

  // Auto-scan with 400ms debounce after paste/input
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

  // Reapply only accepted detections to produce final output
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
  }

  const loadText = (text: string) => {
    setInput(text)
    setScanned(false)
    setDetections([])
    if (autoScan) setTimeout(() => scan(text), 0)
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
    setOutput('')
    setDetections([])
    setAccepted(new Set())
    setScanned(false)
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={s.logo}>🔒 Masqo</span>
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
        {/* Controls */}
        <div style={s.controls}>
          <label style={s.controlLabel}>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} style={s.select}>
            {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
              <option key={m} value={m}>{MODE_LABELS[m]}</option>
            ))}
          </select>

          <label style={s.controlLabel}>Policy</label>
          <select value={policy} onChange={(e) => setPolicy(e.target.value as Policy)} style={s.select}>
            <option value="none">No preset</option>
            <option value="developer">Developer</option>
            <option value="general">General</option>
          </select>

          <button onClick={() => fileRef.current?.click()} style={s.btnSecondary}>
            📂 Open file
          </button>
          <input ref={fileRef} type="file" accept="text/*" style={{ display: 'none' }} onChange={handleFileInput} />

          <label style={{ ...s.controlLabel, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={autoScan}
              onChange={(e) => setAutoScan(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Auto-scan
          </label>

          {!autoScan && (
            <button
              onClick={() => scan()}
              disabled={!input.trim()}
              style={s.btnPrimary}
            >
              Scan →
            </button>
          )}

          {scanned && (
            <button onClick={clear} style={s.btnSecondary}>Clear</button>
          )}
        </div>

        {/* Editor panels */}
        <div style={s.panels}>
          {/* Left — Input */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <span style={s.panelTitle}>Input</span>
              <span style={s.panelMeta}>{input.length} chars</span>
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

          {/* Right — Output */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <span style={s.panelTitle}>Output</span>
              {scanned && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={copyOutput} style={s.btnTiny}>Copy</button>
                  <button onClick={exportFile} style={s.btnTiny}>Export</button>
                </div>
              )}
            </div>
            <textarea
              style={{ ...s.textarea, background: scanned ? '#f0fdf4' : '#f8fafc', color: '#166534' }}
              value={scanned ? finalOutput : ''}
              readOnly
              placeholder="Redacted output appears here after scanning…"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Detection list */}
        {scanned && (
          <div style={s.detectionSection}>
            <div style={s.detectionHeader}>
              <span style={s.panelTitle}>
                {detections.length === 0
                  ? '✅ No secrets detected'
                  : `⚠️ ${detections.length} detection(s) — ${accepted.size} selected for redaction`}
              </span>
              {detections.length > 0 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setAccepted(new Set(detections.map((_, i) => i)))} style={s.btnTiny}>Accept all</button>
                  <button onClick={() => setAccepted(new Set())} style={s.btnTiny}>Reject all</button>
                </div>
              )}
            </div>

            {detections.length > 0 && (
              <div style={s.detectionGrid}>
                {detections.map((d, i) => (
                  <div
                    key={i}
                    onClick={() => toggle(i)}
                    style={{
                      ...s.detectionItem,
                      background: accepted.has(i) ? '#fef9c3' : '#f1f5f9',
                      borderColor: accepted.has(i) ? '#fde047' : '#e2e8f0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={accepted.has(i)}
                      onChange={() => toggle(i)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ marginRight: 8, cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={s.detectionType}>{d.type}</span>
                        <span style={s.detectionConf}>{Math.round(d.confidence * 100)}%</span>
                      </div>
                      <div style={s.detectionExplanation}>{d.explanation}</div>
                      {d.originalText && (
                        <div style={s.detectionOriginal}>
                          {d.originalText.length > 40
                            ? `${d.originalText.slice(0, 20)}…${d.originalText.slice(-10)}`
                            : d.originalText}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={s.footer}>
        All processing runs locally in your browser. No data is sent to any server.
      </footer>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  header: { background: '#1e293b', color: '#fff', padding: '12px 24px' },
  headerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 },
  logo: { fontWeight: 700, fontSize: 18, color: '#fff' },
  tagline: { fontSize: 12, color: '#94a3b8' },
  nav: { marginLeft: 'auto', display: 'flex', gap: 20 },
  navLink: { fontSize: 12, color: '#94a3b8', textDecoration: 'none' },
  main: { flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  controls: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  controlLabel: { fontSize: 12, fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' },
  select: { padding: '6px 10px', background: '#fff', minWidth: 120 },
  btnPrimary: { background: '#6366f1', color: '#fff', fontWeight: 600, padding: '8px 20px' },
  btnSecondary: { background: '#fff', color: '#374151', border: '1px solid #e2e8f0', padding: '7px 14px' },
  btnTiny: { background: '#f1f5f9', color: '#374151', border: '1px solid #e2e8f0', padding: '4px 10px', fontSize: 12 },
  panels: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  panel: { display: 'flex', flexDirection: 'column', gap: 6 },
  panelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { fontWeight: 600, fontSize: 13, color: '#475569' },
  panelMeta: { fontSize: 11, color: '#94a3b8' },
  textarea: { padding: 12, height: 320, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 },
  detectionSection: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  detectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  detectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 },
  detectionItem: { display: 'flex', alignItems: 'flex-start', padding: '10px 12px', border: '1px solid', borderRadius: 6, cursor: 'pointer' },
  detectionType: { fontWeight: 700, fontSize: 12, color: '#dc2626' },
  detectionConf: { fontSize: 11, color: '#9ca3af', background: '#f1f5f9', padding: '1px 6px', borderRadius: 10 },
  detectionExplanation: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  detectionOriginal: { fontSize: 11, fontFamily: 'monospace', color: '#dc2626', marginTop: 3, wordBreak: 'break-all' },
  footer: { textAlign: 'center', padding: '16px 24px', fontSize: 11, color: '#94a3b8', borderTop: '1px solid #e2e8f0', background: '#fff' },
}
