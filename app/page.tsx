'use client'

import { useEffect, useState } from 'react'
import { T } from './components/tokens'
import { StatCard } from './components/ui'
import { Sidebar } from './components/Sidebar'
import { AgentsTab } from './components/AgentsTab'
import { ProjectsTab } from './components/ProjectsTab'
import { LogsTab } from './components/LogsTab'
import { CRMTab } from './components/CRMTab'
import type { Agent, Project, Task, Log, Prospect } from './components/types'

type TabId = 'agents' | 'projects' | 'telegram' | 'crm'

export default function Dashboard() {
  const [agents,      setAgents]      = useState<Agent[]>([])
  const [projects,    setProjects]    = useState<Project[]>([])
  const [tasks,       setTasks]       = useState<Task[]>([])
  const [logs,        setLogs]        = useState<Log[]>([])
  const [prospects,   setProspects]   = useState<Prospect[]>([])
  const [loading,     setLoading]     = useState(true)
  const [refreshing,  setRefreshing]  = useState(false)
  const [fetchError,  setFetchError]  = useState<string | null>(null)
  const [tab,         setTab]         = useState<TabId>('agents')
  const [catFilter,   setCatFilter]   = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    fetchAll()
    const iv = setInterval(fetchAll, 5000)
    return () => { clearInterval(iv) }
  }, [])

  // Restaurar tab guardada
  useEffect(() => {
    const saved = localStorage.getItem('devmark-tab') as TabId
    if (saved && ['agents', 'projects', 'telegram', 'crm'].includes(saved)) setTab(saved)
  }, [])

  // Escuchar hamburguesa del navbar (móvil)
  useEffect(() => {
    const handler = () => setSidebarOpen(prev => !prev)
    window.addEventListener('devmark:toggle-sidebar', handler)
    return () => window.removeEventListener('devmark:toggle-sidebar', handler)
  }, [])

  function handleTabChange(t: TabId) {
    setTab(t)
    localStorage.setItem('devmark-tab', t)
  }

  async function fetchAll() {
    setRefreshing(true)
    try {
      const [dataRes, crmRes] = await Promise.all([
        fetch('/api/data'),
        fetch('/api/crm/prospects'),
      ])
      if (!dataRes.ok) { setFetchError(`Error ${dataRes.status} al obtener datos`); return }
      const data = await dataRes.json()
      if (data.agents)   setAgents(data.agents)
      if (data.projects) setProjects(data.projects)
      if (data.tasks)    setTasks(data.tasks)
      if (data.logs)     setLogs(data.logs)
      if (crmRes.ok) { const crm = await crmRes.json(); setProspects(crm) }
      setFetchError(null)
    } catch {
      setFetchError('Sin conexión con el servidor')
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  const activeCount    = agents.filter(a => a.status === 'active').length
  const busyCount      = agents.filter(a => a.status === 'busy').length
  const openTasks      = tasks.filter(t => t.status === 'To Do').length
  const inProgTasks    = tasks.filter(t => t.status === 'In Progress').length
  const doneTasks      = tasks.filter(t => t.status === 'Done').length
  const totalTasksDone = agents.reduce((sum, a) => sum + (a.tasks_done || 0), 0)
  const topAgent       = agents.reduce((top, a) => (a.tasks_done || 0) > (top.tasks_done || 0) ? a : top, agents[0])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ color: T.teal, fontSize: 16, fontWeight: 600 }}>Loading devmark...</div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        tab={tab}
        catFilter={catFilter}
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onTabChange={handleTabChange}
        onCatFilter={setCatFilter}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => { setSidebarCollapsed(prev => !prev); setSidebarOpen(false) }}
      />

      <div className="main-content">
        {fetchError && (
          <div style={{
            background: 'rgba(192,86,33,0.12)', border: '1px solid rgba(192,86,33,0.3)',
            borderRadius: 9, padding: '10px 16px', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 15 }}>⚠️</span>
            <span style={{ fontSize: 12, color: '#C05621', fontWeight: 600 }}>{fetchError}</span>
            <button onClick={fetchAll} style={{ marginLeft: 'auto', fontSize: 11, color: T.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Reintentar</button>
          </div>
        )}
        {tab !== 'crm' && (
          <div className="stats-grid" style={{ position: 'relative' }}>
            {refreshing && !loading && (
              <span style={{ position: 'absolute', top: -18, right: 0, fontSize: 10, color: T.textMuted, opacity: 0.6 }}>actualizando...</span>
            )}
            <StatCard label="Agentes activos"    value={activeCount + busyCount} sub={"De " + agents.length + " totales"}                  accent={T.blue} />
            <StatCard label="Proyectos Jira"     value={projects.length}         sub={inProgTasks + " en progreso"}                        accent={T.teal} />
            <StatCard label="Tareas completadas" value={totalTasksDone}          sub={topAgent ? "Top: " + topAgent.name : 'Sin tareas'}    accent={T.blue} />
            <StatCard label="Tickets totales"    value={tasks.length}            sub={doneTasks + " completados"}                          accent={T.teal} />
          </div>
        )}

        {tab === 'agents' && (
          <AgentsTab
            agents={catFilter ? agents.filter(a => a.category === catFilter) : agents}
            tasks={tasks}
            onShowProjects={() => handleTabChange('projects')}
          />
        )}
        {tab === 'projects' && <ProjectsTab projects={projects} tasks={tasks} />}
        {tab === 'telegram' && <LogsTab logs={logs} />}
        {tab === 'crm' && <CRMTab prospects={prospects} onProspectsChange={setProspects} />}

        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <img
            src="/logos/horizontal/dev-hori-1.png?v=2"
            alt="devmark"
            style={{ height: 62, width: 'auto', objectFit: 'contain' }}
          />
          <p style={{ fontSize: 15, color: T.textMuted, margin: 0, fontWeight: 500 }}>© 2026 devmark</p>
        </footer>
      </div>
    </div>
  )
}
