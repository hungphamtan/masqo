import React from 'react'

export interface FlowStep {
  label: string
  caption: string
}

export function FlowDiagram({ title, desc, steps }: { title: string; desc: string; steps: FlowStep[] }) {
  const titleId = React.useId()
  const descId = React.useId()
  const boxW = 150
  const boxH = 64
  const gap = 44
  const width = steps.length * boxW + (steps.length - 1) * gap
  const height = boxH + 8

  return (
    <div style={s.wrap}>
      <svg
        className="flow-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        <title id={titleId}>{title}</title>
        <desc id={descId}>{desc}</desc>
        {steps.map((step, i) => {
          const x = i * (boxW + gap)
          return (
            <g key={i}>
              <rect x={x} y={4} width={boxW} height={boxH} rx={10} fill="#FB7185" />
              <text x={x + boxW / 2} y={4 + boxH / 2 + 5} textAnchor="middle" fill="#F8FAFC" fontSize="15" fontWeight="700" fontFamily="-apple-system, sans-serif">
                {step.label}
              </text>
              {i < steps.length - 1 && (
                <g>
                  <line x1={x + boxW} y1={4 + boxH / 2} x2={x + boxW + gap} y2={4 + boxH / 2} stroke="#FDA4AF" strokeWidth="3" />
                  <polygon points={`${x + boxW + gap},${4 + boxH / 2} ${x + boxW + gap - 9},${4 + boxH / 2 - 6} ${x + boxW + gap - 9},${4 + boxH / 2 + 6}`} fill="#FDA4AF" />
                </g>
              )}
            </g>
          )
        })}
      </svg>
      <ol style={s.list} aria-label={title}>
        {steps.map((step, i) => (
          <li key={i} style={s.li}>
            <strong style={s.liLabel}>{step.label}.</strong> {step.caption}
          </li>
        ))}
      </ol>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { margin: '8px 0 32px' },
  list: { listStyle: 'decimal', paddingLeft: 22, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 },
  li: { fontSize: 14, color: '#475569', lineHeight: 1.6 },
  liLabel: { color: '#0F172A' },
}
