import React from 'react'
import { Link } from 'react-router-dom'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={s.logoMark}>M</div>
            <span style={s.logo}>Masqo</span>
          </Link>
          <span style={s.tagline}>Local secret redaction - nothing leaves your browser</span>
          <nav style={s.nav}>
            <Link to="/how-it-works" style={s.navLink}>How it works</Link>
          </nav>
        </div>
      </header>
      <main style={s.main}>{children}</main>
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span>© 2026 Masqo. All processing runs locally - no data leaves your browser.</span>
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
  page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#F8FAFC' },
  header: { background: '#0F172A', color: '#fff', padding: '0 16px', borderBottom: '1px solid #1E293B' },
  headerInner: { maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14, minHeight: 56, flexWrap: 'wrap', padding: '8px 0' },
  logoMark: { width: 28, height: 28, borderRadius: 6, background: '#E11D48', color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.5px', flexShrink: 0 },
  logo: { fontWeight: 700, fontSize: 17, color: '#F8FAFC', letterSpacing: '-0.3px' },
  tagline: { fontSize: 12, color: '#475569', display: 'none' },
  nav: { marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' },
  navLink: { fontSize: 13, color: '#94A3B8', textDecoration: 'none' },
  navCta: { fontSize: 13, color: '#fff', textDecoration: 'none', background: '#E11D48', padding: '6px 14px', borderRadius: 6, fontWeight: 600 },
  main: { flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '32px 16px' },
  footer: { background: '#fff', borderTop: '1px solid #E2E8F0', padding: '16px 16px' },
  footerInner: { maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: 12, color: '#94A3B8', flexWrap: 'wrap', gap: 8 },
  footerLink: { color: '#94A3B8', textDecoration: 'none' },
}
