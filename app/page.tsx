'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Agent {
  id: number
  name: string
  category: string
  icon: string
  status: string
  tasks_done: number
  last_active: string
  prompt?: string
}
interface Project {
  id: string
  name: string
  jira_key: string
  status: string
  created_at: string
}
interface Task {
  id: string
  jira_key: string
  title: string
  agent_name: string
  status: string
  priority: string
  created_at: string
}
interface Log {
  id: number
  agent_name: string
  message: string
  level: string
  timestamp: string
}

// ─── Design tokens ───────────────────────────────────────────────────────────
const T = {
  navy:       '#0C2D4E',
  blue:       '#185FA5',
  teal:       '#1D9E75',
  carbon:     '#444441',
  bone:       '#F1EFE8',
  navyDark:   '#0a2540',
  card:       'rgba(255,255,255,0.05)',
  cardHover:  'rgba(255,255,255,0.08)',
  border:     'rgba(241,239,232,0.1)',
  borderHover:'rgba(241,239,232,0.2)',
}

const CAT_COLOR: Record<string, string> = {
  'Gestión':     T.blue,
  'Desarrollo':  T.teal,
  'Calidad':     '#BA7517',
  'Negocio':     '#C05621',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function statusDotColor(s: string) {
  return s === 'active' ? T.teal : s === 'busy' ? T.blue : 'rgba(255,255,255,0.2)'
}
function statusLabel(s: string) {
  return s === 'active' ? 'Activo' : s === 'busy' ? 'Procesando...' : 'En espera'
}

function jiraBadge(s: string) {
  const map: Record<string, { background: string; color: string; label: string }> = {
    'Done':        { background: 'rgba(29,158,117,0.15)',  color: '#5DCAA5', label: 'Hecho' },
    'In Progress': { background: 'rgba(24,95,165,0.2)',    color: '#7AADDF', label: 'En curso' },
    'To Do':       { background: 'rgba(241,239,232,0.08)', color: 'rgba(241,239,232,0.55)', label: 'Por hacer' },
  }
  return map[s] || map['To Do']
}

function priorityBadgeStyle(p: string) {
  return p === 'High'   ? { background: 'rgba(192,86,33,0.2)',  color: '#E8875A' }
       : p === 'Medium' ? { background: 'rgba(186,117,23,0.2)', color: '#F6C053' }
                        : { background: 'rgba(29,158,117,0.15)', color: '#5DCAA5' }
}

function projectBadgeStyle(s: string) {
  return s === 'active'  ? { background: 'rgba(29,158,117,0.15)', color: '#5DCAA5' }
       : s === 'paused'  ? { background: 'rgba(186,117,23,0.2)',  color: '#F6C053' }
       : s === 'done'    ? { background: 'rgba(24,95,165,0.2)',   color: '#7AADDF' }
                         : { background: 'rgba(192,86,33,0.2)',   color: '#E8875A' }
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent: string }) {
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderTop: `3px solid ${accent}`, borderRadius: 12, padding: '14px 16px',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: T.bone, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, color: accent === T.teal ? T.teal : T.bone, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 10, color: T.bone, opacity: 0.38, marginTop: 4 }}>{sub}</p>
    </div>
  )
}

// ─── AgentCard ────────────────────────────────────────────────────────────────
function AgentCard({ agent, selected, onClick }: { agent: Agent; selected: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? 'rgba(29,158,117,0.1)' : hov ? T.cardHover : T.card,
        border: selected ? `1.5px solid ${T.teal}` : `1px solid ${hov ? T.borderHover : T.border}`,
        borderRadius: 10, padding: '11px 12px', cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: selected ? '0 0 0 3px rgba(29,158,117,0.12)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: `${CAT_COLOR[agent.category] || T.blue}20`,
        }}>{agent.icon}</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.bone, lineHeight: 1.25, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.name}</p>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: CAT_COLOR[agent.category] || T.blue }}>{agent.category}</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{
          width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
          background: statusDotColor(agent.status),
          boxShadow: agent.status === 'busy' ? `0 0 6px ${T.blue}` : 'none',
        }} />
        <span style={{ fontSize: 10, color: T.bone, opacity: 0.5 }}>{statusLabel(agent.status)}</span>
        {agent.tasks_done > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: 9, color: T.bone, opacity: 0.3 }}>{agent.tasks_done} tareas</span>
        )}
      </div>
    </div>
  )
}

// ─── Panel / PanelTitle ───────────────────────────────────────────────────────
function Panel({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, ...style }}>
      {children}
    </div>
  )
}
function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: T.bone, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.45, paddingBottom: 10, borderBottom: `1px solid ${T.border}`, marginBottom: 10 }}>{children}</p>
  )
}

// ─── Category Tab Button ──────────────────────────────────────────────────────
function CatTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 14px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
      border: active ? 'none' : `1px solid ${T.border}`, transition: 'all 0.15s',
      background: active ? T.teal : 'transparent',
      color: active ? '#fff' : 'rgba(241,239,232,0.45)',
    }}>{children}</button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [agents,     setAgents]     = useState<Agent[]>([])
  const [projects,   setProjects]   = useState<Project[]>([])
  const [tasks,      setTasks]      = useState<Task[]>([])
  const [logs,       setLogs]       = useState<Log[]>([])
  const [loading,    setLoading]    = useState(true)
  const [tab,        setTab]        = useState<'agents' | 'projects' | 'telegram'>('agents')
  const [selected,   setSelected]   = useState<Agent | null>(null)
  const [catFilter,  setCatFilter]  = useState<string | null>(null)
  const [taskInput,  setTaskInput]  = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchAll()
    const iv = setInterval(fetchAll, 30000)

    const ch = supabase.channel('agents-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (p) => {
        const updated = p.new as unknown as Agent | undefined
        if (updated?.name) {
          setAgents(prev => prev.map(a => a.name === updated.name ? { ...a, ...updated } : a))
        }
      })
      .subscribe()

    return () => { clearInterval(iv); supabase.removeChannel(ch) }
  }, [])

  async function fetchAll() {
    const [ar, pr, tr, lr] = await Promise.all([
      supabase.from('agents').select('*').order('id'),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(50),
    ])
    if (ar.data) setAgents(ar.data)
    if (pr.data) setProjects(pr.data)
    if (tr.data) setTasks(tr.data)
    if (lr.data) setLogs(lr.data)
    setLoading(false)
  }

  const filteredAgents = catFilter ? agents.filter(a => a.category === catFilter) : agents
  const activeCount    = agents.filter(a => a.status === 'active').length
  const busyCount      = agents.filter(a => a.status === 'busy').length
  const openTasks      = tasks.filter(t => t.status === 'To Do').length
  const inProgTasks    = tasks.filter(t => t.status === 'In Progress').length
  const doneTasks      = tasks.filter(t => t.status === 'Done').length

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ color: T.teal, fontSize: 16, fontWeight: 600 }}>⚡ Cargando devmark...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">

      {/* ── MOBILE SIDEBAR TOGGLE ── */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
        style={{
          position: 'fixed', bottom: 20, left: 20, zIndex: 40,
          width: 48, height: 48, borderRadius: 12,
          background: T.teal, border: 'none', cursor: 'pointer',
          color: '#fff', fontSize: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >☰</button>

      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          display: 'flex', flexDirection: 'column', gap: 2,
          background: T.navyDark, borderRadius: 12, padding: '14px 0',
          border: `1px solid ${T.border}`,
        }}
      >
        {/* Close button (mobile only) */}
        <div className="sidebar-toggle" style={{ justifyContent: 'flex-end', padding: '0 12px 8px' }}>
          <button onClick={() => setSidebarOpen(false)} style={{
            background: 'none', border: 'none', color: T.bone, fontSize: 18, cursor: 'pointer', opacity: 0.5,
          }}>✕</button>
        </div>

        {/* Section: Sistema */}
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: T.bone, opacity: 0.25, textTransform: 'uppercase', padding: '0 16px 6px' }}>Sistema</p>
        {([
          ['agents',   '⊞', 'Todos los agentes'],
          ['projects', '▤', 'Proyectos Jira'],
          ['telegram', '▷', 'Telegram control'],
        ] as const).map(([id, icon, label]) => (
          <div key={id} onClick={() => { setTab(id); setSidebarOpen(false) }} style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '7px 16px', cursor: 'pointer',
            color: tab === id ? '#fff' : 'rgba(241,239,232,0.4)',
            background: tab === id ? 'rgba(24,95,165,0.22)' : 'transparent',
            borderLeft: tab === id ? `2px solid ${T.teal}` : '2px solid transparent',
            fontSize: 12, fontWeight: tab === id ? 600 : 400, transition: 'all 0.15s',
          }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>{icon}</span>
            {label}
          </div>
        ))}

        {/* Section: Categorías */}
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: T.bone, opacity: 0.25, textTransform: 'uppercase', padding: '14px 16px 6px' }}>Categorías</p>
        {([
          ['Gestión',    T.blue],
          ['Desarrollo', T.teal],
          ['Calidad',    '#BA7517'],
          ['Negocio',    '#C05621'],
        ] as [string, string][]).map(([cat, color]) => (
          <div key={cat} onClick={() => { setCatFilter(f => f === cat ? null : cat); setTab('agents'); setSidebarOpen(false) }} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '5px 16px', cursor: 'pointer',
            color: catFilter === cat ? '#fff' : 'rgba(241,239,232,0.38)', fontSize: 11, transition: 'all 0.12s',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0,
              opacity: catFilter && catFilter !== cat ? 0.4 : 1 }} />
            {cat}
          </div>
        ))}
        <div onClick={() => { setCatFilter(null); setSidebarOpen(false) }} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '5px 16px', cursor: 'pointer',
          color: 'rgba(241,239,232,0.28)', fontSize: 11,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
          Todos
        </div>


      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard label="Agentes activos" value={activeCount + busyCount} sub={`De ${agents.length} totales`} accent={T.blue} />
          <StatCard label="Proyectos Jira" value={projects.length} sub={`${inProgTasks} en progreso`} accent={T.teal} />
          <StatCard label="Tickets Jira abiertos" value={tasks.length} sub={`${doneTasks} completados hoy`} accent={T.blue} />
        </div>

        {/* ── AGENTS TAB ── */}
        {tab === 'agents' && (
          <>
            <div className="agents-header">
              <p style={{ fontSize: 11, fontWeight: 700, color: T.bone, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.45 }}>
                {catFilter ? `${catFilter} — devmark` : `${filteredAgents.length} agentes — devmark`}
              </p>
              <div className="cat-tabs">
                <CatTab active={!catFilter} onClick={() => setCatFilter(null)}>Todos</CatTab>
                <CatTab active={catFilter === 'Gestión'} onClick={() => setCatFilter(catFilter === 'Gestión' ? null : 'Gestión')}>Gestión</CatTab>
                <CatTab active={catFilter === 'Desarrollo'} onClick={() => setCatFilter(catFilter === 'Desarrollo' ? null : 'Desarrollo')}>Desarrollo</CatTab>
                <CatTab active={catFilter === 'Calidad'} onClick={() => setCatFilter(catFilter === 'Calidad' ? null : 'Calidad')}>Calidad</CatTab>
                <CatTab active={catFilter === 'Negocio'} onClick={() => setCatFilter(catFilter === 'Negocio' ? null : 'Negocio')}>Negocio</CatTab>
              </div>
            </div>

            <div className="agents-grid">
              {filteredAgents.map(a => (
                <AgentCard key={a.id} agent={a} selected={selected?.id === a.id} onClick={() => setSelected(a)} />
              ))}
            </div>

            {/* Detail + Jira mini */}
            <div className="detail-grid">
              <Panel>
                <PanelTitle>{selected ? `${selected.icon} ${selected.name}` : 'Selecciona un agente'}</PanelTitle>
                <div style={{
                  background: 'rgba(241,239,232,0.05)', border: `1px solid ${T.border}`,
                  borderRadius: 8, padding: 10, fontSize: 11, color: T.bone, opacity: 0.7,
                  lineHeight: 1.6, maxHeight: 110, overflowY: 'auto', fontStyle: 'italic', marginBottom: 10,
                }}>
                  {selected?.prompt || 'Haz clic en cualquier agente para ver su prompt del sistema y asignarle una tarea vía Telegram.'}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    style={{
                      flex: 1, fontSize: 11, padding: '7px 10px',
                      border: `1px solid ${T.border}`, borderRadius: 7,
                      background: 'rgba(241,239,232,0.06)', color: T.bone, outline: 'none',
                    }}
                    placeholder={selected ? `Asignar tarea a ${selected.name}...` : 'Selecciona un agente primero...'}
                    value={taskInput}
                    onChange={e => setTaskInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setTaskInput('')}
                  />
                  <button
                    onClick={() => setTaskInput('')}
                    style={{
                      fontSize: 11, padding: '7px 13px', borderRadius: 7, border: 'none', cursor: 'pointer',
                      background: T.blue, color: '#fff', fontWeight: 700,
                    }}
                  >Enviar ↗</button>
                </div>
              </Panel>

              <Panel>
                <PanelTitle>Tickets Jira activos</PanelTitle>
                {tasks.length === 0 ? (
                  <p style={{ fontSize: 11, color: T.bone, opacity: 0.35, fontStyle: 'italic' }}>
                    Sin tickets aún. Usa /nuevo en Telegram para crear un proyecto.
                  </p>
                ) : (
                  <>
                    {tasks.slice(0, 5).map(t => {
                      const { label, ...badgeStyle } = jiraBadge(t.status)
                      return (
                        <div key={t.id} style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                          borderRadius: 7, border: `1px solid ${T.border}`, background: 'rgba(241,239,232,0.03)', marginBottom: 5,
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: T.blue, minWidth: 62, fontFamily: 'monospace' }}>{t.jira_key || '—'}</span>
                          <span style={{ fontSize: 11, color: T.bone, flex: 1, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                          <span style={{ ...badgeStyle, fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</span>
                        </div>
                      )
                    })}
                    {tasks.length > 5 && (
                      <p onClick={() => setTab('projects')} style={{ fontSize: 10, color: T.blue, textAlign: 'center', marginTop: 6, cursor: 'pointer', opacity: 0.7 }}>
                        Ver todos los tickets →
                      </p>
                    )}
                  </>
                )}
              </Panel>
            </div>
          </>
        )}

        {/* ── PROJECTS TAB ── */}
        {tab === 'projects' && (
          <>
            <Panel>
              <PanelTitle>Proyectos devmark</PanelTitle>
              {projects.length === 0 ? (
                <p style={{ fontSize: 12, color: T.bone, opacity: 0.4, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
                  Sin proyectos aún. Usa /nuevo [nombre] en Telegram para crear uno.
                </p>
              ) : projects.map(p => {
                const pStyle = projectBadgeStyle(p.status)
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                    borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 6,
                    background: 'rgba(241,239,232,0.03)', flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.bone, flex: 1, minWidth: 120 }}>{p.name}</span>
                    {p.jira_key && <span style={{ fontSize: 10, fontFamily: 'monospace', color: T.blue, fontWeight: 700 }}>{p.jira_key}</span>}
                    <span style={{ ...pStyle, fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{p.status}</span>
                    <span style={{ fontSize: 10, color: T.bone, opacity: 0.3 }}>{new Date(p.created_at).toLocaleDateString('es-MX')}</span>
                  </div>
                )
              })}
            </Panel>

            <Panel>
              <PanelTitle>Tickets Jira — devmark</PanelTitle>
              {tasks.length === 0 ? (
                <p style={{ fontSize: 12, color: T.bone, opacity: 0.4, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>Sin tickets aún.</p>
              ) : tasks.map(t => {
                const { label: jLabel, ...jStyle } = jiraBadge(t.status)
                const pStyle = priorityBadgeStyle(t.priority)
                return (
                  <div key={t.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    borderRadius: 8, border: `1px solid ${T.border}`, marginBottom: 5,
                    background: 'rgba(241,239,232,0.03)', flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: T.blue, minWidth: 66 }}>{t.jira_key || '—'}</span>
                    <span style={{ fontSize: 12, color: T.bone, flex: 1, opacity: 0.9, minWidth: 100 }}>{t.title}</span>
                    <span style={{ fontSize: 10, color: T.bone, opacity: 0.35 }}>{t.agent_name || '—'}</span>
                    <span style={{ ...jStyle, fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap' }}>{jLabel}</span>
                    <span style={{ ...pStyle, fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{t.priority}</span>
                  </div>
                )
              })}
            </Panel>
          </>
        )}

        {/* ── TELEGRAM CONTROL (Logs) TAB ── */}
        {tab === 'telegram' && (
          <Panel>
            <PanelTitle>Telegram — Logs del sistema en tiempo real</PanelTitle>
            {logs.length === 0 ? (
              <p style={{ fontSize: 12, color: T.bone, opacity: 0.4, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>Sin logs aún.</p>
            ) : logs.map(log => {
              const lc = log.level === 'error' ? '#E8875A' : log.level === 'warn' ? '#F6C053' : T.teal
              return (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0',
                  borderBottom: `1px solid ${T.border}`, flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', color: lc, minWidth: 36, marginTop: 1 }}>{log.level}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: T.bone, opacity: 0.8, minWidth: 110 }}>{log.agent_name}</span>
                  <span style={{ fontSize: 11, color: T.bone, opacity: 0.5, flex: 1, minWidth: 100 }}>{log.message}</span>
                  <span style={{ fontSize: 10, color: T.bone, opacity: 0.25, whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </Panel>
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: 10, color: T.bone, opacity: 0.2, paddingTop: 8 }}>
          devmark · {agents.length} agentes · Actualización cada 30s · Supabase + Vercel
        </p>
      </div>
    </div>
  )
}
