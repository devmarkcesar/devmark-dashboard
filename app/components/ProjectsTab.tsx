'use client'
import { Panel, PanelTitle } from './ui'
import { T, jiraBadge, priorityBadgeStyle, projectBadgeStyle } from './tokens'
import type { Project, Task } from './types'

interface ProjectsTabProps {
  projects: Project[]
  tasks:    Task[]
}

export function ProjectsTab({ projects, tasks }: ProjectsTabProps) {
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
        <PanelTitle>Tickets Jira — devmark</PanelTitle>
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
