import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { getSettings, setPolicy, clearHistory, getSites, addCustomSite, removeCustomSite, toggleSiteEnabled } from '../storage/index.js'
import { BUILT_IN_SITES } from '../sites.js'
import type { SiteConfig } from '../sites.js'
import type { StoredSettings } from '../types.js'

const PRESETS = ['general', 'developer']
const SUPPORTED_HOSTS = BUILT_IN_SITES.map((s) => s.hostname)

type Tab = 'policy' | 'sites'

function Popup() {
  const [settings, setSettings] = useState<StoredSettings | null>(null)
  const [saved, setSaved] = useState(false)
  const [activeHost, setActiveHost] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('policy')
  const [sites, setSites] = useState<SiteConfig[]>([])
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set())
  const [customSites, setCustomSites] = useState<SiteConfig[]>([])
  const [newName, setNewName] = useState('')
  const [newHostname, setNewHostname] = useState('')

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s)
      setDisabledIds(new Set(s.disabledSiteIds ?? []))
      setCustomSites(s.customSites ?? [])
    })
    getSites().then(setSites)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0]?.url
      if (url) {
        try { setActiveHost(new URL(url).hostname) } catch { /* ignore */ }
      }
    })
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

  const handleToggleSite = async (id: string, enabled: boolean) => {
    await toggleSiteEnabled(id, enabled)
    setDisabledIds((prev) => {
      const next = new Set(prev)
      enabled ? next.delete(id) : next.add(id)
      return next
    })
    getSites().then(setSites)
  }

  const handleRemoveCustom = async (id: string) => {
    await removeCustomSite(id)
    setCustomSites((prev) => prev.filter((s) => s.id !== id))
    getSites().then(setSites)
  }

  const handleAddSite = async () => {
    const name = newName.trim()
    const hostname = newHostname.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (!name || !hostname) return
    const id = `custom-${hostname.replace(/\./g, '-')}-${Date.now()}`
    const site: SiteConfig = { id, name, hostname, textareaSelector: 'textarea, [contenteditable="true"]', builtIn: false }
    await addCustomSite(site)
    setCustomSites((prev) => [...prev, site])
    getSites().then(setSites)
    setNewName('')
    setNewHostname('')
  }

  if (!settings) return <div style={styles.loading}>Loading…</div>

  const isSupported = activeHost
    ? SUPPORTED_HOSTS.some((h) => activeHost === h || activeHost.endsWith('.' + h)) || customSites.some((s) => activeHost === s.hostname || activeHost.endsWith('.' + s.hostname))
    : true

  const allBuiltIn = BUILT_IN_SITES

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.logo}>🔒 Masqo</span>
        {saved && <span style={styles.saved}>Saved ✓</span>}
      </div>

      {!isSupported && activeHost && (
        <div style={styles.notice}>
          <strong>Not active here.</strong> Add this site in the Sites tab to enable Masqo.
          <br /><span style={{ color: '#6b7280' }}>{activeHost}</span>
        </div>
      )}

      <div style={styles.tabs}>
        <button onClick={() => setTab('policy')} style={tab === 'policy' ? styles.tabActive : styles.tab}>Policy</button>
        <button onClick={() => setTab('sites')} style={tab === 'sites' ? styles.tabActive : styles.tab}>Sites ({sites.length})</button>
      </div>

      {tab === 'policy' && (
        <>
          <div style={styles.section}>
            <label style={styles.label}>Active policy</label>
            <select value={settings.policy} onChange={(e) => handlePolicyChange(e.target.value)} style={styles.select}>
              {PRESETS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <div style={styles.hint}>
              {settings.policy === 'developer' ? 'Secrets + logs detected, tokenize mode' : 'Secrets + PII detected, redact mode'}
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
        </>
      )}

      {tab === 'sites' && (
        <div style={styles.section}>
          <label style={styles.label}>Built-in sites</label>
          {allBuiltIn.map((site) => {
            const enabled = !disabledIds.has(site.id)
            return (
              <div key={site.id} style={styles.siteRow}>
                <div>
                  <div style={styles.siteName}>{site.name}</div>
                  <div style={styles.siteHost}>{site.hostname}</div>
                </div>
                <label style={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleToggleSite(site.id, e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ ...styles.toggleTrack, background: enabled ? '#2563eb' : '#d1d5db' }}>
                    <span style={{ ...styles.toggleThumb, transform: enabled ? 'translateX(14px)' : 'translateX(0)' }} />
                  </span>
                </label>
              </div>
            )
          })}

          {customSites.length > 0 && (
            <>
              <label style={{ ...styles.label, marginTop: 12 }}>Custom sites</label>
              {customSites.map((site) => (
                <div key={site.id} style={styles.siteRow}>
                  <div>
                    <div style={styles.siteName}>{site.name}</div>
                    <div style={styles.siteHost}>{site.hostname}</div>
                  </div>
                  <button onClick={() => handleRemoveCustom(site.id)} style={styles.removeBtn}>Remove</button>
                </div>
              ))}
            </>
          )}

          <label style={{ ...styles.label, marginTop: 12 }}>Add site</label>
          <input
            type="text"
            placeholder="Name (e.g. Grok)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Hostname (e.g. grok.com)"
            value={newHostname}
            onChange={(e) => setNewHostname(e.target.value)}
            style={{ ...styles.input, marginTop: 6 }}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSite()}
          />
          <button
            onClick={handleAddSite}
            disabled={!newName.trim() || !newHostname.trim()}
            style={{ ...styles.addBtn, opacity: (!newName.trim() || !newHostname.trim()) ? 0.5 : 1 }}
          >
            Add site
          </button>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: 16, fontSize: 13, width: 320 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  logo: { fontWeight: 700, fontSize: 16, color: '#1e293b' },
  saved: { fontSize: 11, color: '#16a34a', fontWeight: 600 },
  notice: { background: '#fef9c3', border: '1px solid #fde047', borderRadius: 6, padding: '10px 12px', marginBottom: 12, fontSize: 12, lineHeight: 1.5, color: '#713f12' },
  tabs: { display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid #e5e7eb', paddingBottom: 4 },
  tab: { padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 13, borderRadius: 4 },
  tabActive: { padding: '4px 12px', background: '#eff6ff', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: 600, fontSize: 13, borderRadius: 4 },
  section: { marginBottom: 16 },
  label: { display: 'block', fontWeight: 600, color: '#374151', marginBottom: 6, fontSize: 12, textTransform: 'uppercase' as const },
  select: { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, background: '#fff' },
  hint: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  empty: { color: '#9ca3af', fontSize: 12, fontStyle: 'italic', padding: '8px 0' },
  historyItem: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' },
  historyMeta: { color: '#9ca3af', fontSize: 11 },
  clearBtn: { fontSize: 11, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' },
  loading: { padding: 16, color: '#6b7280', fontSize: 13 },
  siteRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f3f4f6' },
  siteName: { fontWeight: 500, color: '#1e293b', fontSize: 13 },
  siteHost: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
  toggle: { cursor: 'pointer', flexShrink: 0 },
  toggleTrack: { display: 'inline-block', width: 32, height: 18, borderRadius: 9, position: 'relative', transition: 'background 0.2s' },
  toggleThumb: { position: 'absolute', top: 2, left: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s' },
  removeBtn: { fontSize: 11, color: '#dc2626', background: 'none', border: '1px solid #fca5a5', borderRadius: 4, cursor: 'pointer', padding: '2px 8px' },
  input: { width: '100%', padding: '7px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, background: '#fff', boxSizing: 'border-box' as const },
  addBtn: { marginTop: 8, width: '100%', padding: '8px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
}

const root = createRoot(document.getElementById('root')!)
root.render(<Popup />)
