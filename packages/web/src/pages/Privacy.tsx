import React from 'react'
import { Layout } from './Layout.js'

export function Privacy() {
  return (
    <Layout>
      <h1 style={s.h1}>Privacy Policy</h1>
      <p style={s.meta}>Effective date: June 2026 · Last updated: June 2026</p>

      <p style={s.p}>
        Masqo is built on a single principle: <strong>your data never leaves your device.</strong>{' '}
        This policy explains what we collect (almost nothing), what we do with it, and why you can trust us.
      </p>

      <Section title="1. What Masqo does">
        <p style={s.p}>
          Masqo detects and redacts secrets (API keys, tokens, passwords, and other sensitive data)
          from text you provide. All detection and redaction logic runs entirely inside your browser
          or on your local machine. No text you paste, upload, or process is ever transmitted to any
          external server.
        </p>
      </Section>

      <Section title="2. Data we do NOT collect">
        <ul style={s.ul}>
          <li>The text you scan or redact</li>
          <li>Detected secrets or their redacted replacements</li>
          <li>Files you open or drag into the app</li>
          <li>Your browsing history or clipboard contents</li>
          <li>Any personally identifiable information</li>
        </ul>
        <p style={s.p}>
          The web application has no backend. There is no database, no user account system,
          and no analytics pipeline that receives your content.
        </p>
      </Section>

      <Section title="3. Local storage">
        <p style={s.p}>
          The browser extension stores your preferences (active policy, enabled sites, custom sites)
          in Chrome's <code style={s.code}>chrome.storage.sync</code>. This is synced across your
          Chrome profile by Google if you are signed in to Chrome - this is browser behaviour
          outside our control. We store no secrets or scanned content in extension storage.
        </p>
      </Section>

      <Section title="4. Analytics and telemetry">
        <p style={s.p}>
          The web app and browser extension contain no analytics, crash reporting, or telemetry SDKs.
          We do not use Google Analytics, Mixpanel, Sentry, or any similar service that would
          receive data about your usage.
        </p>
        <p style={s.p}>
          The web app is served as a static site. Standard web server access logs (IP address,
          user-agent, page URL, timestamp) may be retained by our hosting provider for up to 30 days
          for abuse prevention and capacity planning. These logs do not contain any content you processed.
        </p>
      </Section>

      <Section title="5. Browser extension permissions">
        <p style={s.p}>The Masqo extension requests the following permissions:</p>
        <ul style={s.ul}>
          <li><strong>storage</strong> - saves your policy and site preferences locally</li>
          <li><strong>activeTab / tabs</strong> - reads the current tab URL to show whether Masqo is active on that site</li>
          <li><strong>clipboardRead / clipboardWrite</strong> - used only when you explicitly trigger a paste action; the extension does not monitor your clipboard passively</li>
          <li><strong>scripting</strong> - injects the redaction sidebar into supported pages</li>
          <li><strong>host_permissions: &lt;all_urls&gt;</strong> - allows content scripts to run on any site you add to the site list; the script only activates on hostnames you have configured</li>
        </ul>
      </Section>

      <Section title="6. Third-party services">
        <p style={s.p}>
          Masqo does not integrate with any third-party data processors for the purpose of
          processing your content. The extension is distributed via the Chrome Web Store;
          Google's standard Web Store privacy policy applies to the installation process.
        </p>
      </Section>

      <Section title="7. Children">
        <p style={s.p}>
          Masqo is a developer tool not directed at children under 13. We do not knowingly
          collect any information from children.
        </p>
      </Section>

      <Section title="8. Changes to this policy">
        <p style={s.p}>
          If we make material changes to this policy, we will update the effective date above
          and note the changes in the extension's changelog. Continued use of Masqo after
          such changes constitutes acceptance of the updated policy.
        </p>
      </Section>

      <Section title="9. Contact">
        <p style={s.p}>
          Questions about this privacy policy? Reach out via:
        </p>
        <ul style={s.ul}>
          <li>GitHub: <a href="https://github.com/hungphamtan/masqo" style={s.link}>github.com/hungphamtan/masqo</a></li>
          <li>LinkedIn: <a href="https://www.linkedin.com/in/phamtanhung" style={s.link}>linkedin.com/in/phamtanhung</a></li>
        </ul>
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
  code: { fontFamily: 'monospace', background: '#f1f5f9', padding: '1px 5px', borderRadius: 3, fontSize: 12 },
  link: { color: '#6366f1' },
}
