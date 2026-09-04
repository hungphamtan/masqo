import React from 'react'
import { Layout } from './Layout.js'
import { Link } from 'react-router-dom'

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
      <Link to="/how-it-works/web-app" style={s.seeMore}>See the editor flow →</Link>

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
      <Link to="/how-it-works/extension" style={s.seeMore}>See the extension flow →</Link>

      <div style={s.cta}>
        <div style={s.ctaBody}>
          <div style={s.ctaTitle}>Redact secrets everywhere you chat with AI</div>
          <div style={s.ctaText}>
            Install the Chrome extension to catch API keys, tokens, and PII the moment you paste -
            before they reach ChatGPT, Claude, Gemini and more.
          </div>
          <div style={s.ctaTrust}>Free · Runs 100% locally · Same engine as this page</div>
        </div>
        <a
          href="https://chromewebstore.google.com/detail/masqo-secret-redaction/mfeaahjddfafgbckbilbbagbhpakhdap"
          target="_blank"
          rel="noopener noreferrer"
          style={s.ctaBtn}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" y1="8" x2="12" y2="8" /><line x1="3.95" y1="6.06" x2="8.54" y2="14" /><line x1="10.88" y1="21.94" x2="15.46" y2="14" />
          </svg>
          Add to Chrome - it's free
        </a>
      </div>

      <h2 style={s.h2}>Claude Code hook &amp; CLI</h2>
      <p style={s.p}>
        Prefer to redact at the file system boundary? The <code style={s.code}>@masqo/cli</code> installs a
        Claude Code hook that scans every file write for secrets <em>before</em> they reach the AI - no
        copy-paste required.
      </p>
      <p style={s.p}>Install the CLI globally:</p>
      <pre style={s.codeBlock}>npm install -g @masqo/cli</pre>
      <p style={s.p}>Wire it into Claude Code with one command:</p>
      <pre style={s.codeBlock}>masqo install-hook claude-code</pre>
      <p style={s.p}>
        This adds a <code style={s.code}>PreToolUse</code> hook to <code style={s.code}>~/.claude/settings.json</code> that
        runs on every <code style={s.code}>Write</code>, <code style={s.code}>Edit</code>, and{' '}
        <code style={s.code}>MultiEdit</code> call. If secrets are found, Claude Code sees the redacted
        output instead of the raw file. Overhead is under 100ms for typical files.
      </p>
      <p style={s.p}>You can also run it standalone on any text or file:</p>
      <pre style={s.codeBlock}>{`# Redact from stdin
echo "sk-proj-abc123..." | masqo redact

# Redact a file, write clean output
masqo redact secret.txt -o redacted.txt

# Interactive review before redacting
masqo review secret.txt

# Set default replacement mode: redact | tokenize | partial | warn
masqo config --mode tokenize`}</pre>
      <Link to="/how-it-works/cli" style={s.seeMore}>See the hook flow →</Link>

      <h2 style={s.h2}>npm packages</h2>
      <p style={s.p}>
        Masqo is open and modular. Every surface shares one engine, published on npm under the{' '}
        <a href="https://www.npmjs.com/search?q=%40masqo" target="_blank" rel="noopener noreferrer" style={s.link}>@masqo</a>{' '}
        scope - so you can embed the same detection in your own tools, pipelines, or CI.
      </p>
      <div style={s.pkgGrid}>
        <PkgCard name="@masqo/cli" desc="Command-line redaction and the Claude Code hook installer. The fastest way to protect a dev workflow." />
        <PkgCard name="@masqo/engine" desc="The core detection and replacement engine. Deterministic detectors, configurable modes - drop it into any Node or browser project." />
        <PkgCard name="@masqo/shared" desc="Shared types, policies, and constants used across every Masqo surface. Import it to build on the same contracts." />
      </div>
      <Link to="/how-it-works/engine" style={s.seeMore}>See how to embed the engine →</Link>
    </Layout>
  )
}

function PkgCard({ name, desc }: { name: string; desc: string }) {
  return (
    <a
      href={`https://www.npmjs.com/package/${name}`}
      target="_blank"
      rel="noopener noreferrer"
      style={pkg.card}
    >
      <div style={pkg.name}>{name}</div>
      <div style={pkg.desc}>{desc}</div>
      <div style={pkg.link}>View on npm →</div>
    </a>
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
  link: { color: '#E11D48', textDecoration: 'none', fontWeight: 600 },
  seeMore: { display: 'inline-block', fontSize: 14, color: '#E11D48', textDecoration: 'none', fontWeight: 600, marginTop: 4 },
  cta: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderRadius: 14, padding: '24px 28px', marginTop: 24 },
  ctaBody: { flex: '1 1 320px', minWidth: 0 },
  ctaTitle: { fontSize: 18, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 },
  ctaText: { fontSize: 14, color: '#CBD5E1', lineHeight: 1.6, marginBottom: 10, maxWidth: 460 },
  ctaTrust: { fontSize: 12, color: '#94A3B8', fontWeight: 600 },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', gap: 9, background: '#E11D48', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15, padding: '13px 22px', borderRadius: 8, whiteSpace: 'nowrap', flexShrink: 0 },
  codeBlock: { background: '#0F172A', color: '#E2E8F0', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6, padding: '14px 16px', borderRadius: 8, overflowX: 'auto', margin: '0 0 16px', whiteSpace: 'pre' },
  pkgGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 },
}

const pkg: Record<string, React.CSSProperties> = {
  card: { display: 'flex', flexDirection: 'column', gap: 8, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '16px 18px', textDecoration: 'none', transition: 'border-color 0.15s' },
  name: { fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#1e293b' },
  desc: { fontSize: 13, color: '#475569', lineHeight: 1.55, flex: 1 },
  link: { fontSize: 13, fontWeight: 600, color: '#E11D48' },
}

const step: Record<string, React.CSSProperties> = {
  row: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  num: { width: 36, height: 36, borderRadius: '50%', background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  title: { fontWeight: 600, fontSize: 16, color: '#1e293b', marginBottom: 6 },
  body: { fontSize: 14, color: '#475569', lineHeight: 1.6, margin: 0 },
}
