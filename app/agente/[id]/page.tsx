'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { T, statusLabel } from '../../components/tokens'
import type { Agent } from '../../components/types'

interface ChatMessage {
  id: number
  agent_id: number
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export default function AgentDetailPage() {
  const router  = useRouter()
  const params  = useParams()
  const agentId = Number(params.id)

  const [agent,    setAgent]    = useState<Agent | null>(null)
  const [history,  setHistory]  = useState<ChatMessage[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [clearing, setClearing] = useState(false)

  async function load() {
    const res = await fetch(`/api/agent/${agentId}`)
    if (!res.ok) return
    const data = await res.json()
    if (data.agent)   setAgent(data.agent)
    if (data.history) setHistory(data.history)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [agentId])

  async function handleClearHistory() {
    if (!window.confirm(`¿Borrar toda la memoria de ${agent?.name}? Esta acción no se puede deshacer.`)) return
    setClearing(true)
    try {
      await fetch('/api/clear-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seqAgentId: agentId }),
      })
      setHistory([])
    } finally {
      setClearing(false)
    }
  }

  const filtered = search.trim()
    ? history.filter(m => m.content.toLowerCase().includes(search.toLowerCase()))
    : history

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ color: T.teal, fontSize: 16, fontWeight: 600 }}>Cargando agente...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div style={{ padding: 40, color: T.bone }}>
        <p>Agente no encontrado.</p>
        <button onClick={() => router.push('/')} style={{ marginTop: 16, color: T.teal, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>
          ← Volver al dashboard
        </button>
      </div>
    )
  }

  const statusColor = agent.status === 'active' ? T.teal : agent.status === 'busy' ? '#E67E22' : '#8A8A87'

  return (
    <div className="agent-detail-content">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => router.push('/')}
          style={{ background: 'none', border: 'none', color: T.teal, cursor: 'pointer', fontSize: 22, padding: 0 }}
        >
          ←
        </button>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'rgba(29,158,117,0.12)',
          border: '1.5px solid rgba(29,158,117,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, flexShrink: 0,
        }}>
          {agent.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: T.bone, margin: 0 }}>{agent.name}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, padding: '2px 9px', borderRadius: 99, background: `${statusColor}22`, color: statusColor, fontWeight: 700 }}>
              {statusLabel(agent.status)}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(241,239,232,0.45)' }}>{agent.category}</span>
            <span style={{ fontSize: 11, color: 'rgba(241,239,232,0.45)' }}>· {agent.tasks_done} tareas</span>
          </div>
        </div>
      </div>

      {/* Historial de chat */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 24,
      }}>
        {/* Cabecera del historial */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: 'rgba(241,239,232,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
            Historial ({history.length} mensajes)
          </h2>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              style={{
                fontSize: 11, padding: '5px 12px', borderRadius: 7,
                border: '1px solid rgba(192,86,33,0.4)',
                background: 'rgba(192,86,33,0.1)', color: '#C05621',
                cursor: 'pointer', fontWeight: 600,
                opacity: clearing ? 0.5 : 1,
              }}
            >
              {clearing ? 'Limpiando...' : '🗑️ Limpiar memoria'}
            </button>
          )}
        </div>

        {/* Búsqueda */}
        {history.length > 3 && (
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar en historial..."
            style={{
              width: '100%', fontSize: 12, padding: '8px 12px',
              borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)', color: T.bone,
              outline: 'none', marginBottom: 16, boxSizing: 'border-box',
            }}
          />
        )}

        {filtered.length === 0 ? (
          <p style={{ color: 'rgba(241,239,232,0.35)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
            {search ? 'Sin resultados para esa búsqueda.' : 'No hay historial de conversación con este agente.'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '85%',
                    background: isUser ? 'rgba(29,158,117,0.15)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${isUser ? 'rgba(29,158,117,0.25)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '10px 14px',
                  }}>
                    <p style={{ fontSize: 13, color: T.bone, margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {msg.content}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, color: 'rgba(241,239,232,0.3)', marginTop: 3, padding: '0 4px' }}>
                    {isUser ? '👤 Tú' : `${agent.icon} ${agent.name}`}
                    {' · '}
                    {new Date(msg.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
