'use client'
import { useState } from 'react'
import { T, CAT_COLOR, statusDotColor, statusLabel } from './tokens'
import type { Agent } from './types'

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub: string; accent: string
}) {
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.cardBorder}`,
      borderTop: `3px solid ${accent}`, borderRadius: 10, padding: '16px 18px',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: T.navy, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>{sub}</p>
    </div>
  )
}

// ─── AgentCard ────────────────────────────────────────────────────────────────
export function AgentCard({ agent, selected, onClick }: {
  agent: Agent; selected: boolean; onClick: () => void
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? 'rgba(29,158,117,0.06)' : hov ? T.cardHover : T.white,
        border: selected ? `1.5px solid ${T.teal}` : `1px solid ${hov ? '#C8C4BC' : T.cardBorder}`,
        borderRadius: 10, padding: '14px 14px', cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(29,158,117,0.1)' : hov ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: `${CAT_COLOR[agent.category] || T.blue}15`,
        }}>{agent.icon}</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.navy, lineHeight: 1.25, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.name}</p>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: CAT_COLOR[agent.category] || T.blue }}>{agent.category}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
          background: statusDotColor(agent.status),
          boxShadow: agent.status === 'busy' ? `0 0 6px ${T.blue}` : 'none',
        }} />
        <span style={{ fontSize: 10, color: T.carbon, opacity: 0.7 }}>{statusLabel(agent.status)}</span>
        {agent.tasks_done > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 9, color: T.textMuted }}>{agent.tasks_done} tareas</span>
        )}
      </div>
    </div>
  )
}

// ─── Panel / PanelTitle ───────────────────────────────────────────────────────
export function Panel({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: T.white, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: 18, ...style }}>
      {children}
    </div>
  )
}
export function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 10, borderBottom: `1px solid ${T.cardBorder}`, marginBottom: 10 }}>{children}</p>
  )
}

// ─── CatTab ───────────────────────────────────────────────────────────────────
export function CatTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 16px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
      border: active ? 'none' : `1px solid ${T.cardBorder}`, transition: 'all 0.15s',
      background: active ? T.navy : T.white,
      color: active ? '#fff' : T.navy,
    }}>{children}</button>
  )
}
