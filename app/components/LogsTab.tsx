'use client'
import { useState } from 'react'
import { Panel } from './ui'
import { T } from './tokens'
import type { Log } from './types'

const LEVELS = ['Todos', 'info', 'warn', 'error'] as const

export function LogsTab({ logs }: { logs: Log[] }) {
  const [levelFilter, setLevelFilter] = useState<string>('Todos')

  const visible = levelFilter === 'Todos' ? logs : logs.filter(l => l.level === levelFilter)

  return (
    <Panel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap', paddingBottom: 10, borderBottom: `1px solid ${T.cardBorder}` }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Telegram — Logs del sistema</p>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {LEVELS.map(lv => {
            const active = levelFilter === lv
            const color = lv === 'error' ? '#C05621' : lv === 'warn' ? '#BA7517' : lv === 'info' ? T.teal : T.textMuted
            return (
              <button
                key={lv}
                onClick={() => setLevelFilter(lv)}
                style={{
                  fontSize: 10, padding: '3px 10px', borderRadius: 99, border: 'none',
                  cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase',
                  background: active ? `${color}22` : 'transparent',
                  color: active ? color : T.textMuted,
                  outline: active ? `1px solid ${color}55` : 'none',
                }}
              >{lv}</button>
            )
          })}
        </div>
      </div>
      {visible.length === 0 ? (
        <p style={{ fontSize: 12, color: T.carbon, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>Sin logs para este nivel.</p>
      ) : visible.map(log => {
        const lc = log.level === 'error' ? '#C05621' : log.level === 'warn' ? '#BA7517' : T.teal
        return (
          <div key={log.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0',
            borderBottom: `1px solid ${T.cardBorder}`, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', color: lc, minWidth: 36, marginTop: 1 }}>{log.level}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.navy, minWidth: 110 }}>{log.agent_name}</span>
            <span style={{ fontSize: 11, color: T.carbon, flex: 1, minWidth: 100 }}>{log.message}</span>
            <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: 'nowrap' }}>
              {new Date(log.timestamp).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )
      })}
    </Panel>
  )
}
