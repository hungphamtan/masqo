import React from 'react'
import { Layout } from './Layout.js'

export function HowItWorks() {
  return (
    <Layout>
      <h1 style={s.h1}>How Masqo works</h1>
      <p style={s.lead}>
        Masqo is a local-first privacy engine that detects and redacts secrets before they leave your machine.
        No accounts. No servers. No cloud processing.
      </p>

      <div style={s.steps}>
        <Step n="1" title="Paste or load your text">
          Copy text containing API keys, JWTs, database URLs, or other secrets into the editor.
          You can also drag-and-drop a file directly onto the input area.
        </Step>
        <Step n="2" title="Masqo scans instantly">
          The detection engine runs entirely in your browser using WebAssembly-compatible JavaScript.
          It identifies 20+ secret patterns including AWS keys, bearer tokens, JWTs, database connection
          strings, private keys, and more.
        </Step>
        <Step n="3" title="Review and accept">
          Each detection is shown with its type, confidence score, and a preview of the matched text.
          You choose which ones to redact - accept all, reject all, or pick individually.
        </Step>
        <Step n="4" title="Copy or export clean output">
          The redacted output is ready to copy to clipboard or export as a file.
          Accepted matches are replaced with <code style={s.code}>[REDACTED:type]</code> tokens.
        </Step>
      </div>

      <h2 style={s.h2}>Detection modes</h2>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Mode</th>
            <th style={s.th}>What it does</th>
            <th style={s.th}>Best for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={s.td}><strong>Redact</strong></td>
            <td style={s.td}>Replaces secret with <code style={s.code}>[REDACTED:type]</code></td>
            <td style={s.td}>Sharing logs, bug reports</td>
          </tr>
          <tr>
            <td style={s.td}><strong>Tokenize</strong></td>
            <td style={s.td}>Replaces with a stable placeholder like <code style={s.code}>{'[JWT_1]'}</code></td>
            <td style={s.td}>AI prompts where structure matters</td>
          </tr>
          <tr>
            <td style={s.td}><strong>Partial</strong></td>
            <td style={s.td}>Shows first/last characters, masks middle</td>
            <td style={s.td}>Debugging with context</td>
          </tr>
          <tr>
            <td style={s.td}><strong>Warn only</strong></td>
            <td style={s.td}>Highlights but doesn't change output</td>
            <td style={s.td}>Audit / review workflows</td>
          </tr>
        </tbody>
      </table>

      <h2 style={s.h2}>What gets detected</h2>
      <div style={s.grid}>
        {[
          'AWS access & secret keys', 'GCP service account keys', 'GitHub / GitLab tokens',
          'Stripe API keys', 'OpenAI API keys', 'Bearer tokens',
          'JSON Web Tokens (JWT)', 'Database connection strings', 'Private keys (RSA/EC)',
          'SSH private keys', 'HTTP Basic Auth', 'Cookie headers',
          '.env secret assignments', 'Slack tokens', 'Twilio credentials',
          'Sendgrid keys', 'npm / PyPI tokens', 'Stack traces',
          'HTTP request headers', 'Config file secrets',
          'Email addresses', 'Phone numbers', 'SSNs', 'Credit card numbers', 'Public IP addresses',
        ].map((item) => (
          <div key={item} style={s.chip}>✓ {item}</div>
        ))}
      </div>

      <h2 style={s.h2}>Policies</h2>
      <p style={s.p}>
        Policies control which detectors run and at what confidence threshold. Pick one from the
        Policy dropdown in the toolbar, or leave it on <strong>Default</strong> to run all detectors
        with no filtering.
      </p>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Policy</th>
            <th style={s.th}>Secrets</th>
            <th style={s.th}>PII</th>
            <th style={s.th}>Logs</th>
            <th style={s.th}>Default mode</th>
            <th style={s.th}>Best for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={s.td}><strong>General</strong> (default)</td>
            <td style={s.td}>Medium+</td>
            <td style={s.td}>Medium+</td>
            <td style={s.td}>Disabled</td>
            <td style={s.td}>Redact</td>
            <td style={s.td}>Documents and messages - catches emails, phones, SSNs alongside secrets</td>
          </tr>
          <tr>
            <td style={s.td}><strong>Developer</strong></td>
            <td style={s.td}>High confidence only</td>
            <td style={s.td}>Disabled</td>
            <td style={s.td}>Medium+</td>
            <td style={s.td}>Tokenize</td>
            <td style={s.td}>Sharing code, logs, stack traces - skips PII, keeps stable placeholders</td>
          </tr>
          <tr>
            <td style={s.td}><strong>Default</strong></td>
            <td style={s.td}>All confidence</td>
            <td style={s.td}>All confidence</td>
            <td style={s.td}>All confidence</td>
            <td style={s.td}>Your choice</td>
            <td style={s.td}>All detectors, no filtering - maximum coverage</td>
          </tr>
        </tbody>
      </table>

      <h2 style={s.h2}>Browser extension</h2>
      <p style={s.p}>
        The Masqo browser extension intercepts paste events on AI chat interfaces (ChatGPT, Claude,
        Gemini, Grok, Perplexity and more) and shows a review panel before the text is inserted.
        You can accept, reject, or toggle individual detections - then click "Paste clean" to insert
        the redacted version.
      </p>
      <p style={s.p}>
        The extension uses the same detection engine as this web app. All processing happens locally
        in your browser. The extension never reads your clipboard passively - it only scans text at
        the moment you paste.
      </p>
    </Layout>
  )
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div style={step.row}>
      <div style={step.num}>{n}</div>
      <div>
        <div style={step.title}>{title}</div>
        <p style={step.body}>{children}</p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  h1: { fontSize: 32, fontWeight: 700, color: '#1e293b', marginBottom: 12 },
  h2: { fontSize: 20, fontWeight: 700, color: '#1e293b', marginTop: 40, marginBottom: 16 },
  lead: { fontSize: 16, color: '#475569', lineHeight: 1.7, marginBottom: 40, maxWidth: 640 },
  p: { fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 16 },
  steps: { display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 48 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14, display: 'block', overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  th: { textAlign: 'left', padding: '10px 12px', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#475569', verticalAlign: 'top' },
  code: { fontFamily: 'monospace', background: '#f1f5f9', padding: '1px 5px', borderRadius: 3, fontSize: 12, color: '#dc2626' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 },
  chip: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '7px 12px', fontSize: 13, color: '#166534' },
}

const step: Record<string, React.CSSProperties> = {
  row: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  num: { width: 36, height: 36, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  title: { fontWeight: 600, fontSize: 16, color: '#1e293b', marginBottom: 6 },
  body: { fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 },
}
