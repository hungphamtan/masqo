import React from 'react'
import { Link } from 'react-router-dom'

export function Layout({ children, maxWidth = 1200, mainPadding }: { children: React.ReactNode; maxWidth?: number; mainPadding?: string }) {
  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={{ ...s.headerInner, maxWidth }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={s.logoMark}>M</div>
            <span style={s.logo}>Masqo</span>
          </Link>
          <span className="header-tagline">All processing runs locally</span>
          <nav style={s.nav}>
            <a href="https://github.com/masqo/masqo" target="_blank" rel="noopener noreferrer" style={s.navIconLink} title="GitHub" aria-label="GitHub repository">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <Link to="/how-it-works" style={s.navLink}>How it works</Link>
          </nav>
        </div>
      </header>
      <main style={{ ...s.main, maxWidth, ...(mainPadding ? { padding: mainPadding } : {}) }}>{children}</main>
      <footer style={s.footer}>
        <div style={{ ...s.footerInner, maxWidth }}>
          <span>© 2026 Masqo. All processing runs locally - no data leaves your browser.</span>
          <nav style={s.footerNav}>
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
  navLink: { fontSize: 13, color: '#94A3B8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', lineHeight: 1 },
  navIconLink: { color: '#94A3B8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  navCta: { fontSize: 13, color: '#fff', textDecoration: 'none', background: '#E11D48', padding: '6px 14px', borderRadius: 6, fontWeight: 600 },
  main: { flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '32px 16px' },
  footer: { background: '#fff', borderTop: '1px solid #E2E8F0', padding: '16px 16px' },
  footerInner: { maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94A3B8', flexWrap: 'wrap', gap: 16 },
  footerNav: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' },
  footerLink: { color: '#94A3B8', textDecoration: 'none', display: 'flex', alignItems: 'center' },
}
