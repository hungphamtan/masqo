import React from 'react'
import { DetailPage } from '../../components/DetailPage.js'

const codeBlock: React.CSSProperties = {
  background: '#0F172A', color: '#E2E8F0', fontFamily: 'monospace', fontSize: 13,
  lineHeight: 1.6, padding: '14px 16px', borderRadius: 8, overflowX: 'auto',
  margin: '0 0 16px', whiteSpace: 'pre',
}
const p: React.CSSProperties = { fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 12 }

export function EngineDetail() {
  return (
    <DetailPage
      title="Embed the engine"
      lead="Every Masqo surface shares one detection engine, published as @masqo/engine. Drop it into your own Node or browser project to scan and redact text."
      media={{
        src: '/media/engine',
        transcript: (
          <>
            Import createEngine from @masqo/engine, create an engine, and call scan with your text
            and a replacement mode. You get back the redacted output and a list of detections, each
            with a type, position, and confidence.
          </>
        ),
      }}
      diagram={{
        title: 'Engine flow',
        desc: 'Three steps: create the engine, call scan with text and options, and receive the redacted output plus detections.',
        steps: [
          { label: 'createEngine', caption: 'Instantiate the engine once.' },
          { label: 'scan(text)', caption: 'Pass text and a replacement mode.' },
          { label: 'Result', caption: 'Get redacted output plus a list of detections.' },
        ],
      }}
      cta={{ label: 'View @masqo/engine on npm', href: 'https://www.npmjs.com/package/@masqo/engine', external: true }}
    >
      <p style={p}>Install and use it in a few lines:</p>
      <pre style={codeBlock}>npm install @masqo/engine @masqo/shared</pre>
      <pre style={codeBlock}>{`import { createEngine } from '@masqo/engine'
import { ReplacementMode } from '@masqo/shared'

const engine = createEngine()
const result = engine.scan('AKIAIOSFODNN7EXAMPLE', {
  mode: ReplacementMode.Redact,
})

console.log(result.output)       // [REDACTED:aws-access-key]
console.log(result.detections)   // [{ type, position, confidence, ... }]`}</pre>
    </DetailPage>
  )
}
