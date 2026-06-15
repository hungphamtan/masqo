import React from 'react'
import { Layout } from './Layout.js'

export function Terms() {
  return (
    <Layout>
      <h1 style={s.h1}>Terms of Service</h1>
      <p style={s.meta}>Effective date: June 2026 · Last updated: June 2026</p>

      <p style={s.p}>
        By using Masqo (the web app at this domain and/or the browser extension), you agree to
        these terms. If you do not agree, do not use Masqo.
      </p>

      <Section title="1. What Masqo is">
        <p style={s.p}>
          Masqo is a local-first secret redaction tool. It helps you detect and remove sensitive
          information (API keys, tokens, passwords, and similar secrets) from text before sharing it.
          It is provided as-is, free of charge, as a developer utility.
        </p>
      </Section>

      <Section title="2. No warranty">
        <p style={s.p}>
          Masqo is provided <strong>"as is"</strong> without warranty of any kind, express or implied.
          We do not warrant that:
        </p>
        <ul style={s.ul}>
          <li>Masqo will detect every secret in your text</li>
          <li>The service will be available without interruption</li>
          <li>The extension will work correctly on every website</li>
          <li>Detection patterns will remain accurate as services change their key formats</li>
        </ul>
        <p style={s.p}>
          <strong>You are responsible for verifying output before sharing it.</strong> Masqo is a
          helpful tool, not a guarantee. Always review redacted output, especially before sharing
          sensitive content.
        </p>
      </Section>

      <Section title="3. Acceptable use">
        <p style={s.p}>You agree to use Masqo only for lawful purposes. You may not use Masqo to:</p>
        <ul style={s.ul}>
          <li>Process content you do not have the right to access or share</li>
          <li>Attempt to reverse-engineer or extract secrets from content belonging to others</li>
          <li>Circumvent security controls on third-party systems</li>
          <li>Distribute modified versions of the extension that contain malicious code</li>
        </ul>
      </Section>

      <Section title="4. Limitation of liability">
        <p style={s.p}>
          To the maximum extent permitted by law, Masqo and its authors shall not be liable for
          any direct, indirect, incidental, special, or consequential damages arising from your
          use of the service, including but not limited to data breaches, accidental disclosure
          of secrets, or loss of data.
        </p>
      </Section>

      <Section title="5. Intellectual property">
        <p style={s.p}>
          Masqo's source code is open source. The name "Masqo", the logo, and the detection rule
          sets are owned by the Masqo project. You may not use the Masqo name or logo to endorse
          or promote products without prior written permission.
        </p>
      </Section>

      <Section title="6. Privacy">
        <p style={s.p}>
          Your use of Masqo is also governed by our{' '}
          <a href="/privacy" style={s.link}>Privacy Policy</a>, which is incorporated into these terms by reference.
        </p>
      </Section>

      <Section title="7. Changes to these terms">
        <p style={s.p}>
          We may update these terms from time to time. We will note material changes in the
          extension changelog and update the effective date above. Continued use of Masqo
          after changes constitutes acceptance of the updated terms.
        </p>
      </Section>

      <Section title="8. Governing law">
        <p style={s.p}>
          These terms are governed by the laws of the jurisdiction in which the primary author
          of Masqo resides, without regard to conflict-of-law provisions.
        </p>
      </Section>

      <Section title="9. Contact">
        <p style={s.p}>
          Questions about these terms? Open an issue on our GitHub repository or contact us at
          the email address listed in the Chrome Web Store listing.
        </p>
      </Section>
    </Layout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={s.h2}>{title}</h2>
      {children}
    </section>
  )
}

const s: Record<string, React.CSSProperties> = {
  h1: { fontSize: 32, fontWeight: 700, color: '#1e293b', marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 12 },
  meta: { fontSize: 13, color: '#94a3b8', marginBottom: 32 },
  p: { fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 12 },
  ul: { paddingLeft: 24, color: '#475569', fontSize: 15, lineHeight: 2 },
  link: { color: '#6366f1' },
}
