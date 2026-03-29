'use client'
import { T, CAT_COLOR } from './tokens'
import type { Agent } from './types'

interface Props {
  agents: Agent[]
}

export function ActivityChart({ agents }: Props) {
  const sorted = [...agents]
    .filter(a => (a.tasks_done || 0) > 0)
    .sort((a, b) => (b.tasks_done || 0) - (a.tasks_done || 0))
    .slice(0, 12)

  if (sorted.length === 0) {
    return (
      <p style={{ fontSize: 12, color: T.textMuted, textAlign: 'center', padding: '12px 0', fontStyle: 'italic' }}>
        Sin actividad registrada aún. Interactúa con los agentes vía Telegram.
      </p>
    )
  }

  const max = sorted[0].tasks_done || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {sorted.map(a => {
        const pct  = Math.max(5, ((a.tasks_done || 0) / max) * 100)
        const cat  = a.category as string
        const color = CAT_COLOR[cat] || T.blue
        return (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 22, textAlign: 'center', fontSize: 15, flexShrink: 0 }}>{a.icon}</span>
            <div style={{
              flex: 1,
              background: 'rgba(0,0,0,0.07)',
              borderRadius: 5,
              height: 11,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${color}cc, ${color}66)`,
                borderRadius: 5,
                transition: 'width 0.7s ease',
              }} />
            </div>
            <span style={{
              minWidth: 26, fontSize: 11, fontWeight: 700,
              color: T.carbon, textAlign: 'right', flexShrink: 0,
            }}>
              {a.tasks_done}
            </span>
          </div>
        )
      })}
    </div>
  )
}
