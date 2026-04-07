'use client'
import { useState, useRef, useEffect } from 'react'
import { T, CAT_COLOR } from './tokens'
import { AgentCard, Panel, PanelTitle, CatTab } from './ui'
import { jiraBadge } from './tokens'
import { ActivityChart } from './ActivityChart'
import type { Agent, Task } from './types'

interface ChatMsg {
  id?: string | number
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface AgentsTabProps {
  agents: Agent[]
  tasks:  Task[]
  onShowProjects: () => void
}

export function AgentsTab({ agents, tasks, onShowProjects }: AgentsTabProps) {
  const [selected,     setSelected]    = useState<Agent | null>(null)
  const [catFilter,    setCatFilter]   = useState<string | null>(null)
  const [taskInput,    setTaskInput]   = useState('')
  const [sending,      setSending]     = useState(false)
  const [thinking,     setThinking]    = useState(false)
  const [chatHistory,  setChatHistory] = useState<ChatMsg[]>([])
  const [loadingHist,  setLoadingHist] = useState(false)

  // Broadcast
  const [bcInput,      setBcInput]     = useState('')
  const [bcSending,    setBcSending]   = useState(false)
  const [bcResult,     setBcResult]    = useState<string | null>(null)

  // Crear proyecto
  const [projDesc,     setProjDesc]    = useState('')
  const [projSending,  setProjSending] = useState(false)
  const [projResult,   setProjResult]  = useState<string | null>(null)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Scroll al fondo cuando llegan mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, thinking])

  // Cargar historial al seleccionar agente
  async function selectAgent(agent: Agent) {
    setSelected(agent)
    setChatHistory([])
    setTaskInput('')
    setThinking(false)
    setLoadingHist(true)
    try {
      const res = await fetch(`/api/agent/${agent.id}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.history)) {
          setChatHistory(data.history.map((m: ChatMsg) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            created_at: m.created_at,
          })))
        }
      }
    } catch { /* historial vacío si falla */ }
    finally { setLoadingHist(false) }
  }

  async function handleSend() {
    if (!selected || !taskInput.trim() || sending) return
    const userMsg = taskInput.trim()
    setTaskInput('')
    setSending(true)
    setThinking(true)
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
    try {
      const res = await fetch(`/api/agent/${selected.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.response) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setChatHistory(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error ?? 'Error al contactar al agente.'}` }])
      }
    } catch {
      setChatHistory(prev => [...prev, { role: 'assistant', content: '⚠️ Sin conexión con el servidor.' }])
    } finally {
      setSending(false)
      setThinking(false)
    }
  }

  async function handleBroadcast() {
    if (!bcInput.trim() || bcSending) return
    setBcSending(true)
    setBcResult(null)
    try {
      const res = await fetch('/api/agent/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: bcInput.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        const resumen = Object.entries(data.results ?? {})
          .map(([id, r]: [string, unknown]) => `• Agente ${id}: ${typeof r === 'object' && r !== null && 'response' in r ? String((r as {response: string}).response).slice(0, 120) : 'sin respuesta'}`)
          .join('\n')
        setBcResult(resumen || 'Broadcast enviado.')
        setBcInput('')
      } else {
        setBcResult(`⚠️ ${data.error ?? 'Error en broadcast.'}`)
      }
    } catch {
      setBcResult('⚠️ Sin conexión con el servidor.')
    } finally {
      setBcSending(false)
    }
  }

  async function handleCreateProject() {
    if (!projDesc.trim() || projSending) return
    setProjSending(true)
    setProjResult(null)
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: projDesc.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.response) {
        setProjResult(data.response)
        setProjDesc('')
      } else {
        setProjResult(`⚠️ ${data.error ?? 'Error al crear el proyecto.'}`)
      }
    } catch {
      setProjResult('⚠️ Sin conexión con el servidor.')
    } finally {
      setProjSending(false)
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
          <AgentCard key={a.id} agent={a} selected={selected?.id === a.id} onClick={() => selectAgent(a)} />
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

          {/* Prompt del agente */}
          <div style={{
            background: T.bone, border: `1px solid ${T.cardBorder}`,
            borderRadius: 8, padding: 10, fontSize: 11, color: T.carbon, opacity: 0.7,
            lineHeight: 1.6, maxHeight: 80, overflowY: 'auto', fontStyle: 'italic', marginBottom: 10,
          }}>
            {selected?.prompt || 'Haz clic en cualquier agente para ver su prompt del sistema y chatear con él directamente.'}
          </div>

          {/* Área de chat */}
          <div style={{
            border: `1px solid ${T.cardBorder}`, borderRadius: 8,
            background: T.bone, minHeight: 160, maxHeight: 260,
            overflowY: 'auto', padding: '10px 12px', marginBottom: 8,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {loadingHist && (
              <p style={{ fontSize: 11, color: T.textMuted, fontStyle: 'italic', textAlign: 'center' }}>Cargando historial...</p>
            )}
            {!loadingHist && chatHistory.length === 0 && !thinking && (
              <p style={{ fontSize: 11, color: T.textMuted, fontStyle: 'italic', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                {selected ? 'Sin mensajes aún. Escribe una tarea o pregunta.' : 'Selecciona un agente para comenzar.'}
              </p>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '82%', padding: '7px 11px', borderRadius: msg.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  fontSize: 11, lineHeight: 1.55,
                  background: msg.role === 'user' ? T.blue : '#fff',
                  color: msg.role === 'user' ? '#fff' : T.navy,
                  border: msg.role === 'assistant' ? `1px solid ${T.cardBorder}` : 'none',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {thinking && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '7px 14px', borderRadius: '12px 12px 12px 3px',
                  background: '#fff', border: `1px solid ${T.cardBorder}`,
                  fontSize: 11, color: T.textMuted, fontStyle: 'italic',
                }}>
                  pensando...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input y botón de envío */}
          <div className="agent-task-row" style={{ display: 'flex', gap: 6, minWidth: 0 }}>
            <input
              style={{
                flex: 1, minWidth: 0, fontSize: 11, padding: '7px 10px',
                border: `1px solid ${T.cardBorder}`, borderRadius: 7,
                background: '#fff', color: T.navy, outline: 'none',
              }}
              placeholder={selected ? `Mensaje a ${selected.name}...` : 'Selecciona un agente primero...'}
              value={taskInput}
              disabled={!selected || sending}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!selected || !taskInput.trim() || sending}
              style={{
                fontSize: 11, padding: '7px 13px', borderRadius: 7, border: 'none',
                cursor: (!selected || !taskInput.trim() || sending) ? 'not-allowed' : 'pointer',
                background: sending ? '#8A8A87' : T.blue, color: '#fff', fontWeight: 700,
                opacity: (!selected || !taskInput.trim()) ? 0.6 : 1, whiteSpace: 'nowrap',
              }}
            >{sending ? '...' : 'Enviar ↗'}</button>
          </div>
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

      {/* Broadcast + Crear proyecto */}
      <div className="detail-grid">
        <Panel>
          <PanelTitle>◈ Consultar a todos los agentes</PanelTitle>
          <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, lineHeight: 1.5 }}>
            Envía una instrucción o pregunta a todos los agentes activos al mismo tiempo.
          </p>
          <div style={{ display: 'flex', gap: 6, minWidth: 0 }}>
            <input
              style={{
                flex: 1, minWidth: 0, fontSize: 11, padding: '7px 10px',
                border: `1px solid ${T.cardBorder}`, borderRadius: 7,
                background: '#fff', color: T.navy, outline: 'none',
              }}
              placeholder="Ej: ¿Cuál es tu estado actual?"
              value={bcInput}
              disabled={bcSending}
              onChange={e => setBcInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleBroadcast()}
            />
            <button
              onClick={handleBroadcast}
              disabled={!bcInput.trim() || bcSending}
              style={{
                fontSize: 11, padding: '7px 13px', borderRadius: 7, border: 'none',
                cursor: (!bcInput.trim() || bcSending) ? 'not-allowed' : 'pointer',
                background: bcSending ? '#8A8A87' : T.teal, color: '#fff', fontWeight: 700,
                opacity: !bcInput.trim() ? 0.6 : 1, whiteSpace: 'nowrap',
              }}
            >{bcSending ? 'Enviando...' : 'Broadcast ↗'}</button>
          </div>
          {bcResult && (
            <pre style={{
              marginTop: 10, fontSize: 10, color: T.navy, background: T.bone,
              border: `1px solid ${T.cardBorder}`, borderRadius: 7, padding: '8px 10px',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 160, overflowY: 'auto',
              lineHeight: 1.55,
            }}>{bcResult}</pre>
          )}
        </Panel>

        <Panel>
          <PanelTitle>🗂️ Crear proyecto con PM</PanelTitle>
          <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, lineHeight: 1.5 }}>
            Describe el proyecto y el Project Manager lo estructurará y delegará a los agentes.
          </p>
          <textarea
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box', fontSize: 11, padding: '7px 10px',
              border: `1px solid ${T.cardBorder}`, borderRadius: 7,
              background: '#fff', color: T.navy, outline: 'none', resize: 'vertical',
              fontFamily: 'inherit', lineHeight: 1.5, marginBottom: 6,
            }}
            placeholder="Ej: App web para gestionar inventario de restaurante con módulo de reportes..."
            value={projDesc}
            disabled={projSending}
            onChange={e => setProjDesc(e.target.value)}
          />
          <button
            onClick={handleCreateProject}
            disabled={!projDesc.trim() || projSending}
            style={{
              fontSize: 11, padding: '7px 13px', borderRadius: 7, border: 'none',
              cursor: (!projDesc.trim() || projSending) ? 'not-allowed' : 'pointer',
              background: projSending ? '#8A8A87' : T.blue, color: '#fff', fontWeight: 700,
              opacity: !projDesc.trim() ? 0.6 : 1,
            }}
          >{projSending ? 'Procesando...' : 'Crear proyecto ↗'}</button>
          {projResult && (
            <pre style={{
              marginTop: 10, fontSize: 10, color: T.navy, background: T.bone,
              border: `1px solid ${T.cardBorder}`, borderRadius: 7, padding: '8px 10px',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 160, overflowY: 'auto',
              lineHeight: 1.55,
            }}>{projResult}</pre>
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
