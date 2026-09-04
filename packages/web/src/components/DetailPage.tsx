import React from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../pages/Layout.js'
import { FlowDiagram } from './FlowDiagram.js'
import { FeatureMedia } from './FeatureMedia.js'

export interface DetailPageProps {
  title: string
  lead: string
  diagram: { title: string; desc: string; steps: { label: string; caption: string }[] }
  media: { src: string; poster?: string; transcript: React.ReactNode; showVideo?: boolean }
  children?: React.ReactNode
  cta?: { label: string; href: string; external?: boolean }
}

export function DetailPage({ title, lead, diagram, media, children, cta }: DetailPageProps) {
  return (
    <Layout>
      <Link to="/how-it-works" style={s.back}>← Back to How it works</Link>
      <h1 style={s.h1}>{title}</h1>
      <p style={s.lead}>{lead}</p>

      <FeatureMedia src={media.src} poster={media.poster} transcript={media.transcript} showVideo={media.showVideo} />
      <FlowDiagram title={diagram.title} desc={diagram.desc} steps={diagram.steps} />

      {children}

      {cta && (
        <div style={s.ctaWrap}>
          {cta.external ? (
            <a href={cta.href} target="_blank" rel="noopener noreferrer" style={s.cta}>{cta.label}</a>
          ) : (
            <Link to={cta.href} style={s.cta}>{cta.label}</Link>
          )}
        </div>
      )}
    </Layout>
  )
}

const s: Record<string, React.CSSProperties> = {
  back: { display: 'inline-block', fontSize: 13, color: '#E11D48', textDecoration: 'none', fontWeight: 600, marginBottom: 16 },
  h1: { fontSize: 32, fontWeight: 700, color: '#1e293b', marginBottom: 12 },
  lead: { fontSize: 16, color: '#475569', lineHeight: 1.7, marginBottom: 24, maxWidth: 640 },
  ctaWrap: { marginTop: 32 },
  cta: { display: 'inline-flex', alignItems: 'center', gap: 8, background: '#E11D48', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 15, padding: '12px 22px', borderRadius: 8 },
}
