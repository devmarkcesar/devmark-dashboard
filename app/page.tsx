'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { T } from './components/tokens'
import { StatCard } from './components/ui'
import { Sidebar } from './components/Sidebar'
import { AgentsTab } from './components/AgentsTab'
import { ProjectsTab } from './components/ProjectsTab'
import { LogsTab } from './components/LogsTab'
import type { Agent, Project, Task, Log } from './components/types'

type TabId = 'agents' | 'projects' | 'telegram'

export default function Dashboard() {
  const [agents,      setAgents]      = useState<Agent[]>([])
  const [projects,    setProjects]    = useState<Project[]>([])
  const [tasks,       setTasks]       = useState<Task[]>([])
  const [logs,        setLogs]        = useState<Log[]>([])
  const [loading,     setLoading]     = useState(true)
  const [tab,         setTab]         = useState<TabId>('agents')
  const [catFilter,   setCatFilter]   = useState<string | null>(null)
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
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
        style={{
          position: 'fixed', bottom: 20, left: 20, zIndex: 40,
          width: 48, height: 48, borderRadius: 12,
          background: T.teal, border: 'none', cursor: 'pointer',
          color: '#fff', fontSize: 22, boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >&#9776;</button>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        tab={tab}
        catFilter={catFilter}
        sidebarOpen={sidebarOpen}
        onTabChange={setTab}
        onCatFilter={setCatFilter}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-content">
        <div className="stats-grid">
          <StatCard label="Agentes activos" value={activeCount + busyCount} sub={"De " + agents.length + " totales"} accent={T.blue} />
          <StatCard label="Proyectos Jira" value={projects.length} sub={inProgTasks + " en progreso"} accent={T.teal} />
          <StatCard label="Tareas completadas" value={totalTasksDone} sub={topAgent ? "Top: " + topAgent.name : 'Sin tareas'} accent={T.blue} />
          <StatCard label="Tickets totales" value={tasks.length} sub={doneTasks + " completados"} accent={T.teal} />
        </div>

        {tab === 'agents' && (
          <AgentsTab
            agents={catFilter ? agents.filter(a => a.category === catFilter) : agents}
            tasks={tasks}
            onShowProjects={() => setTab('projects')}
          />
        )}
        {tab === 'projects' && <ProjectsTab projects={projects} tasks={tasks} />}
        {tab === 'telegram' && <LogsTab logs={logs} />}

        <p style={{ textAlign: 'center', fontSize: 15, color: T.textMuted, paddingTop: 8 }}>
          ©devmarkcesaranaya - 2026
        </p>
      </div>
    </div>
  )
}
