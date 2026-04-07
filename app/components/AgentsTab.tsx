'use client'
import { useState } from 'react'
import { T, CAT_COLOR } from './tokens'
import { AgentCard, Panel, PanelTitle, CatTab } from './ui'
import { jiraBadge } from './tokens'
import { ActivityChart } from './ActivityChart'
import type { Agent, Task } from './types'

interface AgentsTabProps {
  agents: Agent[]
  tasks:  Task[]
  onShowProjects: () => void
}

export function AgentsTab({ agents, tasks, onShowProjects }: AgentsTabProps) {
  const [selected,   setSelected]  = useState<Agent | null>(null)
  const [catFilter,  setCatFilter] = useState<string | null>(null)
  const [taskInput,  setTaskInput] = useState('')
  const [sending,    setSending]   = useState(false)
  const [taskFeedback, setTaskFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  async function handleSend() {
    if (!selected || !taskInput.trim() || sending) return
    setSending(true)
    setTaskFeedback(null)
    try {
      const res = await fetch(`/api/agent/${selected.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: taskInput.trim() }),
      })
      if (res.ok) {
        setTaskInput('')
        setTaskFeedback({ ok: true, msg: 'Tarea asignada — el agente la tomará en el próximo ciclo.' })
      } else {
        const d = await res.json().catch(() => ({}))
        setTaskFeedback({ ok: false, msg: d.error ?? 'Error al enviar.' })
      }
    } catch {
      setTaskFeedback({ ok: false, msg: 'Sin conexión con el servidor.' })
    } finally {
      setSending(false)
      setTimeout(() => setTaskFeedback(null), 5000)
    }
  }

  const filtered = catFilter ? agents.filter(a => a.category === catFilter) : agents

  return (
    <>
      {/* Cabecera con filtros de categoría */}
      <div className="agents-header">
        <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {catFilter ? `${catFilter} — devmark` : `${filtered.length} agentes — devmark`}
        </p>
        <div className="cat-tabs">
          <CatTab active={!catFilter} onClick={() => setCatFilter(null)}>Todos</CatTab>
          {['Gestión', 'Desarrollo', 'Calidad', 'Negocio'].map(cat => (
            <CatTab key={cat} active={catFilter === cat} onClick={() => setCatFilter(catFilter === cat ? null : cat)}>
              {cat}
            </CatTab>
          ))}
        </div>
      </div>

      {/* Grid de agentes */}
      <div className="agents-grid">
        {filtered.map(a => (
          <AgentCard key={a.id} agent={a} selected={selected?.id === a.id} onClick={() => setSelected(a)} />
        ))}
      </div>

      {/* Detalle del agente + mini tabla Jira */}
      <div className="detail-grid">
        <Panel>
          <PanelTitle>{selected ? `${selected.icon} ${selected.name}` : 'Selecciona un agente'}</PanelTitle>

          {/* Métricas del agente seleccionado */}
          {selected && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, fontWeight: 700,
                background: `${CAT_COLOR[selected.category] || T.blue}15`, color: CAT_COLOR[selected.category] || T.blue }}>
                {selected.category}
              </span>
              <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 99, fontWeight: 700,
                background: 'rgba(29,158,117,0.1)', color: T.teal }}>
                {selected.tasks_done} tareas completadas
              </span>
              {selected.last_active && (
                <span style={{ fontSize: 10, color: T.textMuted }}>
                  Última actividad: {new Date(selected.last_active).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                </span>
              )}
            </div>
          )}

          <div style={{
            background: T.bone, border: `1px solid ${T.cardBorder}`,
            borderRadius: 8, padding: 10, fontSize: 11, color: T.carbon, opacity: 0.7,
            lineHeight: 1.6, maxHeight: 110, overflowY: 'auto', fontStyle: 'italic', marginBottom: 10,
          }}>
            {selected?.prompt || 'Haz clic en cualquier agente para ver su prompt del sistema y asignarle una tarea vía Telegram.'}
          </div>

          <div className="agent-task-row" style={{ display: 'flex', gap: 6, minWidth: 0 }}>
            <input
              style={{
                flex: 1, minWidth: 0, fontSize: 11, padding: '7px 10px',
                border: `1px solid ${T.cardBorder}`, borderRadius: 7,
                background: T.bone, color: T.navy, outline: 'none',
              }}
              placeholder={selected ? `Asignar tarea a ${selected.name}...` : 'Selecciona un agente primero...'}
              value={taskInput}
              disabled={!selected || sending}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!selected || !taskInput.trim() || sending}
              style={{
                fontSize: 11, padding: '7px 13px', borderRadius: 7, border: 'none',
                cursor: (!selected || !taskInput.trim() || sending) ? 'not-allowed' : 'pointer',
                background: sending ? '#8A8A87' : T.blue, color: '#fff', fontWeight: 700,
                opacity: (!selected || !taskInput.trim()) ? 0.6 : 1,
              }}
            >{sending ? '...' : 'Enviar ↗'}</button>
          </div>
          {taskFeedback && (
            <p style={{
              fontSize: 11, marginTop: 6, padding: '6px 10px', borderRadius: 7,
              background: taskFeedback.ok ? 'rgba(29,158,117,0.1)' : 'rgba(192,86,33,0.1)',
              color: taskFeedback.ok ? T.teal : '#C05621',
              border: `1px solid ${taskFeedback.ok ? 'rgba(29,158,117,0.25)' : 'rgba(192,86,33,0.25)'}`,
            }}>{taskFeedback.msg}</p>
          )}
        </Panel>

        <Panel>
          <PanelTitle>Tickets Jira activos</PanelTitle>
          {tasks.length === 0 ? (
            <p style={{ fontSize: 11, color: T.carbon, fontStyle: 'italic' }}>
              Sin tickets aún. Usa /nuevo en Telegram para crear un proyecto.
            </p>
          ) : (
            <>
              {tasks.slice(0, 5).map(t => {
                const { label, ...badgeStyle } = jiraBadge(t.status)
                return (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                    borderRadius: 7, border: `1px solid ${T.cardBorder}`, background: T.bone,
                    marginBottom: 5, overflow: 'hidden', minWidth: 0,
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: T.blue, minWidth: 62, fontFamily: 'monospace' }}>{t.jira_key || '—'}</span>
                    <span style={{ fontSize: 11, color: T.navy, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                    <span style={{ ...badgeStyle, fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</span>
                  </div>
                )
              })}
              {tasks.length > 5 && (
                <p onClick={onShowProjects} style={{ fontSize: 10, color: T.blue, textAlign: 'center', marginTop: 6, cursor: 'pointer', opacity: 0.7 }}>
                  Ver todos los tickets →
                </p>
              )}
            </>
          )}
        </Panel>
      </div>

      {/* Gráfica de actividad */}
      <Panel>
        <PanelTitle>📊 Actividad de agentes (tareas completadas)</PanelTitle>
        <ActivityChart agents={agents} />
      </Panel>
    </>
  )
}
