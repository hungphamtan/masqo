import React from 'react'
import { DetailPage } from '../../components/DetailPage.js'

const codeBlock: React.CSSProperties = {
  background: '#0F172A', color: '#E2E8F0', fontFamily: 'monospace', fontSize: 13,
  lineHeight: 1.6, padding: '14px 16px', borderRadius: 8, overflowX: 'auto',
  margin: '0 0 16px', whiteSpace: 'pre',
}
const p: React.CSSProperties = { fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 12 }

export function CliDetail() {
  return (
    <DetailPage
      title="Claude Code hook & CLI"
      lead="Redact at the file-system boundary. The @masqo/cli installs a Claude Code hook that scans every file write for secrets before they reach the AI."
      media={{
        src: '/media/cli',
        transcript: (
          <>
            When Claude Code writes or edits a file, a PreToolUse hook runs masqo redact on the
            file contents. If secrets are found, Claude Code receives the redacted output instead
            of the raw file. You can also run masqo directly on any text or file from the terminal.
          </>
        ),
      }}
      diagram={{
        title: 'Claude Code hook flow',
        desc: 'Four steps: Claude Code writes a file, the PreToolUse hook runs masqo redact, secrets are masked, and Claude Code sees the clean output.',
        steps: [
          { label: 'Write', caption: 'Claude Code issues a Write, Edit, or MultiEdit call.' },
          { label: 'Hook', caption: 'The PreToolUse hook runs masqo redact on the file contents.' },
          { label: 'Redact', caption: 'Any detected secrets are masked locally.' },
          { label: 'Clean', caption: 'Claude Code proceeds with the redacted output.' },
        ],
      }}
      cta={{ label: 'View @masqo/cli on npm', href: 'https://www.npmjs.com/package/@masqo/cli', external: true }}
    >
      <p style={p}>Install the CLI globally:</p>
      <pre style={codeBlock}>npm install -g @masqo/cli</pre>
      <p style={p}>Wire it into Claude Code with one command:</p>
      <pre style={codeBlock}>masqo install-hook claude-code</pre>
      <p style={p}>Or run it standalone on any text or file:</p>
      <pre style={codeBlock}>{`echo "sk-proj-abc123..." | masqo redact
masqo redact secret.txt -o redacted.txt
masqo review secret.txt`}</pre>
    </DetailPage>
  )
}
