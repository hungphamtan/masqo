import React from 'react'

export function FeatureMedia({
  src,
  poster,
  captionsSrc,
  transcript,
}: {
  src: string
  poster?: string
  captionsSrc?: string
  transcript: React.ReactNode
}) {
  return (
    <div style={s.wrap}>
      <video
        className="feature-video"
        controls
        preload="none"
        poster={poster}
        style={s.video}
      >
        <source src={`${src}.webm`} type="video/webm" />
        <source src={`${src}.mp4`} type="video/mp4" />
        {captionsSrc && (
          <track kind="captions" src={captionsSrc} srcLang="en" label="English" default />
        )}
        Your browser does not support embedded video. Read the transcript below.
      </video>
      <details style={s.details}>
        <summary style={s.summary}>Text description / transcript</summary>
        <div style={s.transcript}>{transcript}</div>
      </details>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { margin: '8px 0 24px' },
  video: { width: '100%', maxWidth: '100%', borderRadius: 12, background: '#0F172A', display: 'block', border: '1px solid #E2E8F0' },
  details: { marginTop: 10, fontSize: 14, color: '#475569' },
  summary: { cursor: 'pointer', fontWeight: 600, color: '#0F172A' },
  transcript: { marginTop: 8, lineHeight: 1.7 },
}
