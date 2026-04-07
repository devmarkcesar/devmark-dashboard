'use client'
import { useState } from 'react'
import { Panel, PanelTitle } from './ui'
import { T, jiraBadge, priorityBadgeStyle, projectBadgeStyle } from './tokens'
import type { Project, Task } from './types'

interface ProjectsTabProps {
  projects: Project[]
  tasks:    Task[]
}

export function ProjectsTab({ projects, tasks }: ProjectsTabProps) {
  const [syncing,     setSyncing]     = useState(false)
  const [syncResult,  setSyncResult]  = useState<{ synced?: number; error?: string } | null>(null)

  async function handleJiraSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res  = await fetch('/api/sync/jira', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setSyncResult({ synced: data.synced ?? 0 })
      } else {
        setSyncResult({ error: data.error ?? 'Error al sincronizar' })
      }
    } catch {
      setSyncResult({ error: 'Sin conexión con el servidor' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      <Panel>
        <PanelTitle>Proyectos devmark</PanelTitle>
        {projects.length === 0 ? (
          <p style={{ fontSize: 12, color: T.carbon, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
            Sin proyectos aún. Usa /nuevo [nombre] en Telegram para crear uno.
          </p>
        ) : projects.map(p => {
          const pStyle = projectBadgeStyle(p.status)
          return (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 8, border: `1px solid ${T.cardBorder}`, marginBottom: 6,
              background: T.bone, flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.navy, flex: 1, minWidth: 120 }}>{p.name}</span>
              {p.jira_key && <span style={{ fontSize: 10, fontFamily: 'monospace', color: T.blue, fontWeight: 700 }}>{p.jira_key}</span>}
              <span style={{ ...pStyle, fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{p.status}</span>
              <span style={{ fontSize: 10, color: T.textMuted }}>{new Date(p.created_at).toLocaleDateString('es-MX')}</span>
            </div>
          )
        })}
      </Panel>

      <Panel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderBottom: `1px solid ${T.cardBorder}`, paddingBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Tickets Jira — devmark</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {syncResult && (
              <span style={{ fontSize: 10, color: syncResult.error ? '#C05621' : T.teal, fontWeight: 600 }}>
                {syncResult.error ? `Error: ${syncResult.error}` : `${syncResult.synced} tickets sincronizados`}
              </span>
            )}
            <button
              onClick={handleJiraSync}
              disabled={syncing}
              style={{
                fontSize: 10, padding: '5px 12px', borderRadius: 6, border: `1px solid ${T.cardBorder}`,
                background: syncing ? T.bone : T.white, color: syncing ? T.textMuted : T.blue,
                cursor: syncing ? 'not-allowed' : 'pointer', fontWeight: 700,
              }}
            >
              {syncing ? 'Sincronizando...' : 'Sync Jira'}
            </button>
          </div>
        </div>
        {tasks.length === 0 ? (
          <p style={{ fontSize: 12, color: T.carbon, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>Sin tickets aún.</p>
        ) : tasks.map(t => {
          const { label: jLabel, ...jStyle } = jiraBadge(t.status)
          const pStyle = priorityBadgeStyle(t.priority)
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 8, border: `1px solid ${T.cardBorder}`, marginBottom: 5,
              background: T.bone, flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: T.blue, minWidth: 66 }}>{t.jira_key || '—'}</span>
              <span style={{ fontSize: 12, color: T.navy, flex: 1, minWidth: 100 }}>{t.title}</span>
              <span style={{ fontSize: 10, color: T.textMuted }}>{t.agent_name || '—'}</span>
              <span style={{ ...jStyle, fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap' }}>{jLabel}</span>
              <span style={{ ...pStyle, fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{t.priority}</span>
            </div>
          )
        })}
      </Panel>
    </>
  )
}
