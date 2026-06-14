import React from 'react'
import { Link } from 'react-router-dom'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={s.page}>
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
            <Link to="/" style={s.navCta}>Try it →</Link>
          </nav>
        </div>
      </header>
      <main style={s.main}>{children}</main>
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span>© 2025 Masqo. All processing runs locally — no data leaves your browser.</span>
          <nav style={{ display: 'flex', gap: 20 }}>
            <Link to="/privacy" style={s.footerLink}>Privacy</Link>
            <Link to="/terms" style={s.footerLink}>Terms</Link>
            <Link to="/how-it-works" style={s.footerLink}>How it works</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  header: { background: '#1e293b', color: '#fff', padding: '12px 24px' },
  headerInner: { maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 },
  logo: { fontWeight: 700, fontSize: 18, color: '#fff' },
  tagline: { fontSize: 12, color: '#94a3b8' },
  nav: { marginLeft: 'auto', display: 'flex', gap: 20, alignItems: 'center' },
  navLink: { fontSize: 13, color: '#94a3b8', textDecoration: 'none' },
  navCta: { fontSize: 13, color: '#fff', textDecoration: 'none', background: '#6366f1', padding: '6px 14px', borderRadius: 6, fontWeight: 600 },
  main: { flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '48px 24px' },
  footer: { background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '20px 24px' },
  footerInner: { maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8' },
  footerLink: { color: '#94a3b8', textDecoration: 'none' },
}
