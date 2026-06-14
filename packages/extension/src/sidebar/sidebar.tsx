import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import type { Detection } from '@masqo/shared'

interface ReviewData {
  original: string
  output: string
  detections: Detection[]
}

function Sidebar() {
  const [data, setData] = useState<ReviewData | null>(null)
  const [accepted, setAccepted] = useState<Set<number>>(new Set())

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'MASQO_REVIEW_DATA') {
        const d = event.data as ReviewData & { type: string }
        setData(d)
        setAccepted(new Set(d.detections.map((_, i) => i)))
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

  const pasteClean = () => {
    if (!data) return
    // Apply only accepted detections
    let out = data.original
    const toRedact = data.detections.filter((_, i) => accepted.has(i))
    // Sort descending by position so replacements don't shift indices
    const sorted = [...toRedact].sort((a, b) => b.position.start - a.position.start)
    for (const d of sorted) {
      out = out.slice(0, d.position.start) + `[REDACTED:${d.type}]` + out.slice(d.position.end)
    }
    window.parent.postMessage({ type: 'MASQO_ACCEPT', text: out }, '*')
  }

  const reject = () => {
    window.parent.postMessage({ type: 'MASQO_REJECT' }, '*')
  }

  if (!data) {
    return (
      <div style={styles.loading}>
        <p>Waiting for paste event…</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.logo}>🔒 Masqo</span>
        <span style={styles.count}>
          {accepted.size}/{data.detections.length} redactions selected
        </span>
      </div>

      <div style={styles.panels}>
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Original</div>
          <pre style={styles.code}>{data.original}</pre>
        </div>
        <div style={styles.panel}>
          <div style={styles.panelTitle}>Redacted preview</div>
          <pre style={styles.code}>{data.output}</pre>
        </div>
      </div>

      <div style={styles.detectionList}>
        <div style={styles.panelTitle}>Detections</div>
        {data.detections.map((d, i) => (
          <div
            key={i}
            style={{ ...styles.detectionItem, background: accepted.has(i) ? '#fef3c7' : '#f3f4f6' }}
            onClick={() => toggle(i)}
          >
            <input
              type="checkbox"
              checked={accepted.has(i)}
              onChange={() => toggle(i)}
              style={{ marginRight: 8 }}
            />
            <span style={{ color: '#dc2626', fontWeight: 600 }}>{d.type}</span>
            <span style={{ color: '#6b7280', fontSize: 12, marginLeft: 8 }}>
              {Math.round(d.confidence * 100)}% confidence
            </span>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{d.explanation}</div>
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button onClick={reject} style={styles.btnSecondary}>Cancel</button>
        <button
          onClick={() => setAccepted(new Set())}
          style={styles.btnSecondary}
        >
          Reject all
        </button>
        <button
          onClick={() => setAccepted(new Set(data.detections.map((_, i) => i)))}
          style={styles.btnSecondary}
        >
          Accept all
        </button>
        <button onClick={pasteClean} style={styles.btnPrimary}>
          Paste clean ({accepted.size})
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff', fontSize: 13 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#1e293b', color: '#fff' },
  logo: { fontWeight: 700, fontSize: 15 },
  count: { fontSize: 12, color: '#94a3b8' },
  panels: { display: 'flex', gap: 8, padding: 12, flex: '0 0 200px', borderBottom: '1px solid #e5e7eb' },
  panel: { flex: 1, overflow: 'hidden' },
  panelTitle: { fontWeight: 600, fontSize: 11, color: '#6b7280', textTransform: 'uppercase', marginBottom: 4 },
  code: { fontSize: 11, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 140, overflow: 'auto', background: '#f8fafc', padding: 8, borderRadius: 4 },
  detectionList: { flex: 1, overflow: 'auto', padding: 12, borderBottom: '1px solid #e5e7eb' },
  detectionItem: { padding: '8px 10px', borderRadius: 6, marginBottom: 6, cursor: 'pointer', border: '1px solid #e5e7eb' },
  actions: { display: 'flex', gap: 8, padding: 12, justifyContent: 'flex-end', flexWrap: 'wrap' },
  btnPrimary: { padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 },
  btnSecondary: { padding: '8px 12px', background: '#f1f5f9', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7280' },
}

const root = createRoot(document.getElementById('root')!)
root.render(<Sidebar />)
