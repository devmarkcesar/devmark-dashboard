'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { T, statusLabel, CAT_COLOR } from '../../components/tokens'
import { Sidebar } from '../../components/Sidebar'
import type { Agent } from '../../components/types'

type TabId = 'agents' | 'projects' | 'logs' | 'crm' | 'diagnostico'

interface ChatMsg {
  id?: number
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export default function AgentChatPage() {
  const router = useRouter()
  const params = useParams()
  const slug   = String(params.slug)

  const [agent,    setAgent]    = useState<Agent | null>(null)
  const [history,  setHistory]  = useState<ChatMsg[]>([])
  const [loading,  setLoading]  = useState(true)
  const [input,    setInput]    = useState('')
  const [sending,  setSending]  = useState(false)
  const [thinking, setThinking] = useState(false)
  const [clearing, setClearing] = useState(false)

  // Sidebar state
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Escuchar hamburguesa del navbar (móvil)
  useEffect(() => {
    const handler = () => setSidebarOpen(prev => !prev)
    window.addEventListener('devmark:toggle-sidebar', handler)
    return () => window.removeEventListener('devmark:toggle-sidebar', handler)
  }, [])

  // Carga inicial
  useEffect(() => {
    async function loadAgent() {
      const res = await fetch(`/api/agent/${slug}`)
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      if (data.agent)   setAgent(data.agent)
      if (data.history) setHistory(data.history)
      setLoading(false)
    }
    loadAgent()
  }, [slug])

  // Scroll al fondo al recibir nuevos mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, thinking])

  // Sidebar tab → ir al dashboard con esa tab
  function handleTabChange(t: TabId) {
    localStorage.setItem('devmark-tab', t)
    router.push('/')
  }

  async function handleSend() {
    if (!input.trim() || sending || !agent) return
    const text = input.trim()
    setInput('')
    setSending(true)
    setThinking(true)
    setHistory(prev => [...prev, { role: 'user', content: text }])

    try {
      const res = await fetch(`/api/agent/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.response) {
        setHistory(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setHistory(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error ?? 'Error al contactar al agente.'}` }])
      }
    } catch {
      setHistory(prev => [...prev, { role: 'assistant', content: '⚠️ Sin conexión con el servidor.' }])
    } finally {
      setSending(false)
      setThinking(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  async function handleClear() {
    if (!agent) return
    if (!window.confirm(`¿Borrar toda la memoria de ${agent.name}?`)) return
    setClearing(true)
    await fetch('/api/clear-history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seqAgentId: agent.id }),
    })
    setHistory([])
    setClearing(false)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: T.teal, fontSize: 15, fontWeight: 600 }}>
        Cargando...
      </div>
    )
  }

  if (!agent) {
    return (
      <div style={{ padding: 40, color: T.bone }}>
        <p>Agente no encontrado.</p>
        <button onClick={() => router.push('/')}
          style={{ marginTop: 12, color: T.teal, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
          ← Volver
        </button>
      </div>
    )
  }

  const catColor    = CAT_COLOR[agent.category] || T.blue
  const statusColor = agent.status === 'active' ? T.teal : agent.status === 'busy' ? '#E67E22' : '#8A8A87'

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: 'calc(100dvh - 58px)', background: T.navy }}>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        tab="agents"
        catFilter={null}
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onTabChange={handleTabChange}
        onCatFilter={() => router.push('/')}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => { setSidebarCollapsed(prev => !prev); setSidebarOpen(false) }}
      />

      <div style={{
        flex: 1, minWidth: 0,
        display: 'flex', flexDirection: 'column',
        height: 'calc(100dvh - 58px)',
        overflow: 'hidden',
        background: T.navy,
        maxWidth: 720,
        margin: '0 auto',
        width: '100%',
      }}>

        {/* Header */}
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: T.navyDark,
        }}>
          <button onClick={() => router.push('/')}
            style={{ background: 'none', border: 'none', color: T.teal, cursor: 'pointer', fontSize: 20, padding: '0 4px', lineHeight: 1 }}
            aria-label="Volver"
          >←</button>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: `${catColor}22`, border: `1.5px solid ${catColor}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 21, flexShrink: 0,
          }}>{agent.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.bone, lineHeight: 1.3 }}>{agent.name}</p>
            <p style={{ margin: 0, fontSize: 11, color: statusColor, lineHeight: 1.4 }}>
              {statusLabel(agent.status)} · {agent.category}
            </p>
          </div>
          {history.length > 0 && (
            <button onClick={handleClear} disabled={clearing} title="Limpiar memoria"
              style={{ background: 'none', border: 'none', color: 'rgba(241,239,232,0.35)', cursor: 'pointer', fontSize: 15, padding: '4px 6px', opacity: clearing ? 0.4 : 1 }}
            >🗑️</button>
          )}
        </div>

        {/* Mensajes */}
        <div style={{
          flex: 1, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 8,
          padding: '16px 20px',
        }}>
          {history.length === 0 && !thinking && (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'rgba(241,239,232,0.22)', fontSize: 13, paddingTop: 32 }}>
              <p style={{ fontSize: 32, margin: '0 0 10px' }}>{agent.icon}</p>
              <p style={{ margin: 0 }}>Escribe para comenzar una conversación</p>
            </div>
          )}
          {history.map((msg, i) => {
            const isUser = msg.role === 'user'
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '9px 13px',
                  borderRadius: isUser ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                  background: isUser ? 'rgba(29,158,117,0.22)' : 'rgba(255,255,255,0.08)',
                  border: isUser ? '1px solid rgba(29,158,117,0.35)' : '1px solid rgba(255,255,255,0.1)',
                }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: T.bone, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {msg.content}
                  </p>
                  {msg.created_at && (
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: 'rgba(241,239,232,0.3)', textAlign: isUser ? 'right' : 'left', lineHeight: 1 }}>
                      {new Date(msg.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
          {thinking && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '9px 14px', borderRadius: '14px 14px 14px 3px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(241,239,232,0.45)', fontSize: 13, fontStyle: 'italic',
              }}>
                {agent.icon} escribiendo...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px 14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          background: T.navyDark,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder={`Mensaje a ${agent.name}...`}
            disabled={sending}
            autoFocus
            style={{
              flex: 1, minWidth: 0, fontSize: 13, padding: '10px 16px',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.07)',
              color: T.bone, outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            style={{
              width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0,
              background: (!input.trim() || sending) ? 'rgba(29,158,117,0.2)' : T.teal,
              color: '#fff', fontSize: 17, cursor: (!input.trim() || sending) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            aria-label="Enviar"
          >➤</button>
        </div>

      </div>
    </div>
  )
}
