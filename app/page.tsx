'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Agent {
  id: number
  name: string
  category: string
  icon: string
  status: string
  tasks_done: number
  last_active: string
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

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'agents' | 'projects' | 'tasks' | 'logs'>('agents')

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    const [agentsRes, projectsRes, tasksRes, logsRes] = await Promise.all([
      supabase.from('agents').select('*').order('id'),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(50),
    ])
    setAgents(agentsRes.data || [])
    setProjects(projectsRes.data || [])
    setTasks(tasksRes.data || [])
    setLogs(logsRes.data || [])
    setLoading(false)
  }

  const activeAgents = agents.filter(a => a.status === 'active').length
  const busyAgents = agents.filter(a => a.status === 'busy').length
  const idleAgents = agents.filter(a => a.status === 'idle').length
  const openTasks = tasks.filter(t => t.status === 'To Do').length
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length

  const statusColor = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-500'
      case 'busy': return 'bg-blue-500'
      case 'idle': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const levelColor = (l: string) => {
    switch (l) {
      case 'info': return 'text-blue-400'
      case 'warn': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const priorityBadge = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-900 text-red-300'
      case 'Medium': return 'bg-yellow-900 text-yellow-300'
      case 'Low': return 'bg-green-900 text-green-300'
      default: return 'bg-gray-800 text-gray-300'
    }
  }

  const projectStatusBadge = (s: string) => {
    switch (s) {
      case 'active': return 'bg-green-900 text-green-300'
      case 'paused': return 'bg-yellow-900 text-yellow-300'
      case 'done': return 'bg-blue-900 text-blue-300'
      case 'cancelled': return 'bg-red-900 text-red-300'
      default: return 'bg-gray-800 text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-400">⚡ Cargando devmark OS...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-sm text-gray-400">Agentes Totales</p>
          <p className="text-3xl font-bold mt-1">{agents.length}</p>
          <p className="text-xs text-gray-500 mt-2">
            🟢 {activeAgents} · 🔵 {busyAgents} · ⚪ {idleAgents}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-sm text-gray-400">Proyectos</p>
          <p className="text-3xl font-bold mt-1">{projects.length}</p>
          <p className="text-xs text-gray-500 mt-2">
            {projects.filter(p => p.status === 'active').length} activos
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-sm text-gray-400">Tickets Jira</p>
          <p className="text-3xl font-bold mt-1">{tasks.length}</p>
          <p className="text-xs text-gray-500 mt-2">
            {openTasks} pendientes · {inProgressTasks} en progreso
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <p className="text-sm text-gray-400">Logs recientes</p>
          <p className="text-3xl font-bold mt-1">{logs.length}</p>
          <p className="text-xs text-gray-500 mt-2">
            {logs.filter(l => l.level === 'error').length} errores
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 w-fit">
        {(['agents', 'projects', 'tasks', 'logs'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-white text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'agents' && '🤖 Agentes'}
            {tab === 'projects' && '📁 Proyectos'}
            {tab === 'tasks' && '📋 Tickets'}
            {tab === 'logs' && '📊 Logs'}
          </button>
        ))}
      </div>

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-xs text-gray-400">{agent.category}</p>
                  </div>
                </div>
                <span className={`w-3 h-3 rounded-full ${statusColor(agent.status)}`} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Tareas: {agent.tasks_done}</span>
                <span className="capitalize">{agent.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {projects.length === 0 ? (
            <p className="p-6 text-gray-400 text-center">No hay proyectos aún. Usa /nuevo en Telegram para crear uno.</p>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-800 text-left text-sm text-gray-400">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Jira Key</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Creado</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(proj => (
                  <tr key={proj.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium">{proj.name}</td>
                    <td className="px-4 py-3 text-gray-400">{proj.jira_key || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${projectStatusBadge(proj.status)}`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(proj.created_at).toLocaleDateString('es-MX')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {tasks.length === 0 ? (
            <p className="p-6 text-gray-400 text-center">No hay tickets aún.</p>
          ) : (
            <table className="w-full">
              <thead className="border-b border-gray-800 text-left text-sm text-gray-400">
                <tr>
                  <th className="px-4 py-3">Jira</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Agente</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Prioridad</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm text-blue-400">{task.jira_key || '—'}</td>
                    <td className="px-4 py-3 font-medium">{task.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{task.agent_name || '—'}</td>
                    <td className="px-4 py-3 text-sm">{task.status}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${priorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {logs.length === 0 ? (
            <p className="p-6 text-gray-400 text-center">No hay logs aún.</p>
          ) : (
            <div className="divide-y divide-gray-800/50 max-h-[600px] overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="px-4 py-3 hover:bg-gray-800/30 flex items-start gap-4">
                  <span className={`text-xs font-mono uppercase font-bold mt-0.5 ${levelColor(log.level)}`}>
                    {log.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-300">{log.agent_name}</span>
                    <p className="text-sm text-gray-400 truncate">{log.message}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('es-MX')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-gray-600 pt-4">
        devmark OS · {agents.length} agentes · Auto-refresh cada 30s · Powered by Supabase + Vercel
      </p>
    </div>
  )
}
