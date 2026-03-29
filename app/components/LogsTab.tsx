'use client'
import { Panel, PanelTitle } from './ui'
import { T } from './tokens'
import type { Log } from './types'

export function LogsTab({ logs }: { logs: Log[] }) {
  return (
    <Panel>
      <PanelTitle>Telegram — Logs del sistema en tiempo real</PanelTitle>
      {logs.length === 0 ? (
        <p style={{ fontSize: 12, color: T.carbon, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>Sin logs aún.</p>
      ) : logs.map(log => {
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
