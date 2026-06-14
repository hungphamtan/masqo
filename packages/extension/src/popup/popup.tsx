import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { getSettings, setPolicy, clearHistory } from '../storage/index.js'
import type { StoredSettings } from '../types.js'

const PRESETS = ['general', 'developer']

function Popup() {
  const [settings, setSettings] = useState<StoredSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  const handlePolicyChange = async (policy: string) => {
    await setPolicy(policy)
    setSettings((s) => s ? { ...s, policy } : s)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleClearHistory = async () => {
    await clearHistory()
    setSettings((s) => s ? { ...s, detectionHistory: [] } : s)
  }

  if (!settings) {
    return <div style={styles.loading}>Loading…</div>
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.logo}>🔒 Masqo</span>
        {saved && <span style={styles.saved}>Saved ✓</span>}
      </div>

      <div style={styles.section}>
        <label style={styles.label}>Active policy</label>
        <select
          value={settings.policy}
          onChange={(e) => handlePolicyChange(e.target.value)}
          style={styles.select}
        >
          {PRESETS.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
        <div style={styles.hint}>
          {settings.policy === 'developer'
            ? 'Secrets + logs detected, tokenize mode'
            : 'Secrets + PII detected, redact mode'}
        </div>
      </div>

      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={styles.label}>Recent detections ({settings.detectionHistory.length})</label>
          {settings.detectionHistory.length > 0 && (
            <button onClick={handleClearHistory} style={styles.clearBtn}>Clear</button>
          )}
        </div>
        {settings.detectionHistory.length === 0 ? (
          <div style={styles.empty}>No detections yet</div>
        ) : (
          settings.detectionHistory.slice(0, 5).map((h, i) => (
            <div key={i} style={styles.historyItem}>
              <span style={{ color: '#dc2626', fontWeight: 600 }}>{h.type}</span>
              <span style={styles.historyMeta}>{h.site}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 16, fontSize: 13 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  logo: { fontWeight: 700, fontSize: 16, color: '#1e293b' },
  saved: { fontSize: 11, color: '#16a34a', fontWeight: 600 },
  section: { marginBottom: 16 },
  label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: 12, textTransform: 'uppercase' },
  select: { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, background: '#fff' },
  hint: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  empty: { color: '#9ca3af', fontSize: 12, fontStyle: 'italic', padding: '8px 0' },
  historyItem: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' },
  historyMeta: { color: '#9ca3af', fontSize: 11 },
  clearBtn: { fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' },
  loading: { padding: 16, color: '#6b7280', fontSize: 13 },
}

const root = createRoot(document.getElementById('root')!)
root.render(<Popup />)
