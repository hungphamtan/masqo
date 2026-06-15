import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { getSettings, setPolicy, clearHistory, getSites, addCustomSite, removeCustomSite, toggleSiteEnabled } from '../storage/index.js'
import { BUILT_IN_SITES } from '../sites.js'
import type { SiteConfig } from '../sites.js'
import type { StoredSettings } from '../types.js'

const PRESETS = ['general', 'developer']
const SUPPORTED_HOSTS = BUILT_IN_SITES.map((s) => s.hostname)
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
const MONO = '"JetBrains Mono", "Fira Code", ui-monospace, monospace'

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

  if (!settings) {
    return (
      <div style={{ ...s.root, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
        <div style={s.logoMark}>M</div>
      </div>
    )
  }

  const isSupported = activeHost
    ? SUPPORTED_HOSTS.some((h) => activeHost === h || activeHost.endsWith('.' + h)) ||
      customSites.some((cs) => activeHost === cs.hostname || activeHost.endsWith('.' + cs.hostname))
    : true

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoMark}>M</div>
          <span style={s.logoText}>Masqo</span>
        </div>
        {saved && <span style={s.savedBadge}>Saved ✓</span>}
      </div>

      {/* Unsupported site notice */}
      {!isSupported && activeHost && (
        <div style={s.notice}>
          <span style={{ fontWeight: 600 }}>Not active on this site.</span>
          <br />
          <span style={{ fontFamily: MONO, fontSize: 11 }}>{activeHost}</span>
          <br />
          <span style={{ color: '#92400E' }}>Add it in the Sites tab to enable Masqo here.</span>
        </div>
      )}

      {/* Tabs */}
      <div style={s.tabs}>
        <button onClick={() => setTab('policy')} style={tab === 'policy' ? s.tabOn : s.tabOff}>Policy</button>
        <button onClick={() => setTab('sites')} style={tab === 'sites' ? s.tabOn : s.tabOff}>
          Sites <span style={{ opacity: 0.6 }}>({sites.length})</span>
        </button>
      </div>

      {/* Policy tab */}
      {tab === 'policy' && (
        <div style={s.body}>
          <div style={s.field}>
            <div style={s.fieldLabel}>Active policy</div>
            <select value={settings.policy} onChange={(e) => handlePolicyChange(e.target.value)} style={s.select}>
              {PRESETS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <div style={s.hint}>
              {settings.policy === 'developer'
                ? 'Secrets + logs - tokenize mode'
                : 'Secrets + PII - redact mode'}
            </div>
          </div>

          <div style={s.field}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={s.fieldLabel}>Recent detections</div>
              {settings.detectionHistory.length > 0 && (
                <button onClick={handleClearHistory} style={s.linkBtn}>Clear</button>
              )}
            </div>
            {settings.detectionHistory.length === 0 ? (
              <div style={s.empty}>No detections yet</div>
            ) : (
              settings.detectionHistory.slice(0, 5).map((h, i) => (
                <div key={i} style={s.historyRow}>
                  <span style={s.historyType}>{h.type}</span>
                  <span style={s.historyMeta}>{h.site}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sites tab */}
      {tab === 'sites' && (
        <div style={s.body}>
          <div style={s.fieldLabel}>Built-in sites</div>
          <div style={s.siteList}>
            {BUILT_IN_SITES.map((site) => {
              const enabled = !disabledIds.has(site.id)
              return (
                <div key={site.id} style={s.siteRow}>
                  <div style={{ minWidth: 0 }}>
                    <div style={s.siteName}>{site.name}</div>
                    <div style={s.siteHost}>{site.hostname}</div>
                  </div>
                  <label style={{ cursor: 'pointer', flexShrink: 0 }}>
                    <input type="checkbox" checked={enabled} onChange={(e) => handleToggleSite(site.id, e.target.checked)} style={{ display: 'none' }} />
                    <span style={{ ...s.pill, background: enabled ? '#E11D48' : '#CBD5E1' }}>
                      <span style={{ ...s.pillDot, transform: enabled ? 'translateX(14px)' : 'translateX(2px)' }} />
                    </span>
                  </label>
                </div>
              )
            })}
          </div>

          {customSites.length > 0 && (
            <>
              <div style={{ ...s.fieldLabel, marginTop: 12 }}>Custom sites</div>
              <div style={s.siteList}>
                {customSites.map((site) => (
                  <div key={site.id} style={s.siteRow}>
                    <div style={{ minWidth: 0 }}>
                      <div style={s.siteName}>{site.name}</div>
                      <div style={s.siteHost}>{site.hostname}</div>
                    </div>
                    <button onClick={() => handleRemoveCustom(site.id)} style={s.removeBtn}>✕</button>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ ...s.fieldLabel, marginTop: 14 }}>Add site</div>
          <input type="text" placeholder="Name (e.g. Grok)" value={newName} onChange={(e) => setNewName(e.target.value)} style={s.input} />
          <input type="text" placeholder="Hostname (e.g. grok.com)" value={newHostname} onChange={(e) => setNewHostname(e.target.value)} style={{ ...s.input, marginTop: 6 }} onKeyDown={(e) => e.key === 'Enter' && handleAddSite()} />
          <button onClick={handleAddSite} disabled={!newName.trim() || !newHostname.trim()} style={{ ...s.addBtn, opacity: (!newName.trim() || !newHostname.trim()) ? 0.4 : 1 }}>
            Add site
          </button>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { width: 320, fontFamily: FONT, fontSize: 13, background: '#fff', color: '#0F172A' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#0F172A', borderBottom: '1px solid #1E293B' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  logoMark: { width: 24, height: 24, borderRadius: 5, background: '#E11D48', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 700, fontSize: 15, color: '#F8FAFC', letterSpacing: '-0.2px' },
  savedBadge: { fontSize: 11, color: '#4ADE80', fontWeight: 600 },
  notice: { background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 0, padding: '10px 14px', fontSize: 12, lineHeight: 1.6, color: '#78350F', borderLeft: '3px solid #F59E0B' },
  tabs: { display: 'flex', borderBottom: '1px solid #F1F5F9' },
  tabOn: { flex: 1, padding: '9px 0', background: 'none', border: 'none', borderBottom: '2px solid #E11D48', cursor: 'pointer', color: '#E11D48', fontWeight: 700, fontSize: 13, fontFamily: FONT },
  tabOff: { flex: 1, padding: '9px 0', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', color: '#64748B', fontSize: 13, fontFamily: FONT },
  body: { padding: '14px 14px 16px' },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' as const, marginBottom: 7 },
  select: { width: '100%', height: 34, padding: '0 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, background: '#F8FAFC', color: '#0F172A', cursor: 'pointer' },
  hint: { fontSize: 11, color: '#94A3B8', marginTop: 5 },
  empty: { color: '#CBD5E1', fontSize: 12, fontStyle: 'italic', padding: '6px 0' },
  historyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F8FAFC' },
  historyType: { fontSize: 12, fontWeight: 700, color: '#E11D48', fontFamily: MONO },
  historyMeta: { fontSize: 11, color: '#94A3B8' },
  linkBtn: { fontSize: 11, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 },
  siteList: { display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #F1F5F9', borderRadius: 8, overflow: 'hidden', marginBottom: 4 },
  siteRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderBottom: '1px solid #F8FAFC', background: '#fff' },
  siteName: { fontWeight: 500, color: '#1E293B', fontSize: 13 },
  siteHost: { fontSize: 10, color: '#94A3B8', fontFamily: MONO, marginTop: 1 },
  pill: { display: 'inline-flex', width: 32, height: 18, borderRadius: 9, position: 'relative', transition: 'background 0.2s' },
  pillDot: { position: 'absolute', top: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },
  removeBtn: { width: 22, height: 22, borderRadius: 4, background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECDD3', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  input: { width: '100%', height: 34, padding: '0 10px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, background: '#F8FAFC', color: '#0F172A', boxSizing: 'border-box' as const },
  addBtn: { marginTop: 8, width: '100%', height: 34, background: '#E11D48', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700, fontSize: 13, fontFamily: FONT },
}

const root = createRoot(document.getElementById('root')!)
root.render(<Popup />)
