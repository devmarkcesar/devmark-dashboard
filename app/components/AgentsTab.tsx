'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { T, CAT_COLOR, agentSlug } from './tokens'
import { AgentCard, Panel, PanelTitle, CatTab } from './ui'
import { jiraBadge } from './tokens'
import type { Agent, Task } from './types'

// Markdown inline renderer
function MdLine({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|https?:\/\/[^\s)]+)/g)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
        if (p.startsWith('*') && p.endsWith('*'))   return <em key={i}>{p.slice(1, -1)}</em>
        if (p.startsWith('`') && p.endsWith('`'))   return <code key={i} style={{ background: 'rgba(0,0,0,0.07)', borderRadius: 3, padding: '1px 5px', fontSize: '0.88em', fontFamily: 'monospace' }}>{p.slice(1, -1)}</code>
        if (p.startsWith('http://') || p.startsWith('https://')) return <a key={i} href={p} target="_blank" rel="noreferrer" style={{ color: T.teal, textDecoration: 'underline', wordBreak: 'break-all' }}>{p}</a>
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

function MdContent({ content }: { content: string }) {
  const lines = content.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('### ')) {
      nodes.push(<p key={i} style={{ fontWeight: 700, fontSize: 13, color: T.navy, margin: '8px 0 3px' }}><MdLine text={line.slice(4)} /></p>)
    } else if (line.startsWith('## ')) {
      nodes.push(<p key={i} style={{ fontWeight: 700, fontSize: 13, color: T.navy, margin: '10px 0 4px', borderBottom: `1px solid ${T.cardBorder}`, paddingBottom: 3 }}><MdLine text={line.slice(3)} /></p>)
    } else if (line.startsWith('# ')) {
      nodes.push(<p key={i} style={{ fontWeight: 700, fontSize: 13, color: T.navy, margin: '10px 0 5px' }}><MdLine text={line.slice(2)} /></p>)
    } else if (line.startsWith('```')) {
      const code: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++ }
      nodes.push(<pre key={i} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: 6, padding: '7px 10px', fontSize: 12, fontFamily: 'monospace', overflowX: 'auto', margin: '4px 0 6px', lineHeight: 1.5, whiteSpace: 'pre', border: `1px solid ${T.cardBorder}` }}>{code.join('\n')}</pre>)
    } else if (line.match(/^\d+\. /)) {
      const items: React.ReactNode[] = []
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        const m = lines[i].match(/^\d+\. (.*)/)
        if (m) items.push(<li key={i} style={{ marginBottom: 2 }}><MdLine text={m[1]} /></li>)
        i++
      }
      nodes.push(<ol key={`ol${i}`} style={{ paddingLeft: 18, margin: '3px 0 6px', fontSize: 13 }}>{items}</ol>)
      continue
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: React.ReactNode[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(<li key={i} style={{ marginBottom: 2 }}><MdLine text={lines[i].slice(2)} /></li>)
        i++
      }
      nodes.push(<ul key={`ul${i}`} style={{ paddingLeft: 16, margin: '3px 0 6px', listStyleType: 'disc', fontSize: 13 }}>{items}</ul>)
      continue
    } else if (line.startsWith('| ')) {
      const rows: string[] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!lines[i].match(/^\|[-| ]+\|$/)) rows.push(lines[i])
        i++
      }
      nodes.push(
        <div key={`tbl${i}`} style={{ overflowX: 'auto', margin: '4px 0 8px' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 13, width: '100%' }}>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1).map((cell, ci) => (
                  <td key={ci} style={{ border: `1px solid ${T.cardBorder}`, padding: '3px 8px', background: ri === 0 ? 'rgba(0,0,0,0.04)' : 'transparent', fontWeight: ri === 0 ? 700 : 400 }}>
                    <MdLine text={cell.trim()} />
                  </td>
                ))}
              </tr>
            ))}
          </table>
        </div>
      )
      continue
    } else if (line.trim() === '') {
      nodes.push(<div key={i} style={{ height: 4 }} />)
    } else {
      nodes.push(<p key={i} style={{ margin: '2px 0', lineHeight: 1.6, fontSize: 13 }}><MdLine text={line} /></p>)
    }
    i++
  }
  return <>{nodes}</>
}

interface AgentsTabProps {
  agents:             Agent[]
  tasks:              Task[]
  onShowProjects:     () => void
  externalCatFilter?: string | null
}

export function AgentsTab({ agents, tasks, onShowProjects, externalCatFilter }: AgentsTabProps) {
  const router = useRouter()
  const [catFilter,   setCatFilter]  = useState<string | null>(null)

  // F2 — Toast global
  const [toast,       setToast]       = useState<{ msg: string; type: 'error' | 'ok' } | null>(null)

  // F3 — Broadcast expandible por agente
  interface BcItem { agent_id: number; agent: string; icon: string; response: string; ok: boolean }
  const [bcInput,     setBcInput]    = useState('')
  const [bcSending,   setBcSending]  = useState(false)
  const [bcItems,     setBcItems]    = useState<BcItem[]>([])
  const [bcExpanded,  setBcExpanded] = useState<number | null>(null)

  const [projDesc,    setProjDesc]   = useState('')
  const [projSending, setProjSending] = useState(false)
  const [projResult,  setProjResult] = useState<string | null>(null)
  const [projJiraKey, setProjJiraKey] = useState<string | null>(null)

  // F2 — auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(t)
  }, [toast])

  function showToast(msg: string, type: 'error' | 'ok' = 'error') {
    setToast({ msg, type })
  }

  // Sincronizar filtro externo del sidebar
  useEffect(() => {
    setCatFilter(externalCatFilter ?? null)
  }, [externalCatFilter])

  async function handleBroadcast() {
    if (!bcInput.trim() || bcSending) return
    setBcSending(true)
    setBcItems([])
    setBcExpanded(null)
    try {
      const res = await fetch('/api/agent/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: bcInput.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && Array.isArray(data.results)) {
        setBcItems(data.results as BcItem[])
        setBcInput('')
      } else {
        showToast(data.error ?? 'Error en broadcast')
      }
    } catch {
      showToast('Sin conexión con el servidor')
    } finally {
      setBcSending(false)
    }
  }

  async function handleCreateProject() {
    if (!projDesc.trim() || projSending) return
    setProjSending(true)
    setProjResult(null)
    setProjJiraKey(null)
    try {
      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: projDesc.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.response) {
        setProjResult(data.response)
        // Extraer la epic key si viene en la respuesta (formato DVM-XX)
        const match = String(data.response).match(/\b(DVM-\d+)\b/)
        if (match) setProjJiraKey(match[1])
        setProjDesc('')
        showToast('Proyecto creado en Jira', 'ok')
      } else {
        const msg = data.error ?? 'Error al crear el proyecto'
        setProjResult(`Error: ${msg}`)
        showToast(msg)
      }
    } catch {
      const msg = 'Sin conexión con el servidor'
      setProjResult(msg)
      showToast(msg)
    } finally {
      setProjSending(false)
    }
  }

  const filtered = catFilter ? agents.filter(a => a.category?.toLowerCase() === catFilter.toLowerCase()) : agents

  return (
    <>
      {/* F2 — Toast global */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 12,
          background: toast.type === 'ok' ? T.teal : '#C05621',
          color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          maxWidth: 360, textAlign: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}
      {/* Filtros de categoria */}
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
          <AgentCard key={a.id} agent={a} selected={false} onClick={() => router.push(`/agente/${agentSlug(a.name)}`)} />
        ))}
      </div>

      {/* Panel 2: Tickets Jira activos */}
      <Panel>
        <PanelTitle>Tickets Jira activos</PanelTitle>
        {tasks.length === 0 ? (
          <p style={{ fontSize: 11, color: T.carbon, fontStyle: 'italic' }}>
            Sin tickets aun. Usa /nuevo en Telegram para crear un proyecto.
          </p>
        ) : (
          <>
            {tasks.slice(0, 5).map(t => {
              const { label, ...badgeStyle } = jiraBadge(t.status)
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                  borderRadius: 7, border: `1px solid ${T.cardBorder}`, background: T.bone,
                  marginBottom: 5, overflow: 'hidden',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: T.blue, minWidth: 62, fontFamily: 'monospace' }}>{t.jira_key || '—'}</span>
                  <span style={{ fontSize: 11, color: T.navy, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                  <span style={{ ...badgeStyle, fontSize: 9, padding: '2px 8px', borderRadius: 99, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{label}</span>
                </div>
              )
            })}
            {tasks.length > 5 && (
              <p onClick={onShowProjects} style={{ fontSize: 10, color: T.blue, textAlign: 'center', marginTop: 6, cursor: 'pointer', opacity: 0.7 }}>
                Ver todos los tickets
              </p>
            )}
          </>
        )}
      </Panel>

      {/* Panel 3: Broadcast */}
      <Panel>
        <PanelTitle>Consultar a todos los agentes</PanelTitle>
        <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, lineHeight: 1.5 }}>
          Envia una instruccion o pregunta a todos los agentes activos al mismo tiempo.
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            style={{
              flex: 1, minWidth: 0, fontSize: 11, padding: '7px 10px',
              border: `1px solid ${T.cardBorder}`, borderRadius: 7,
              background: '#fff', color: T.navy, outline: 'none',
            }}
            placeholder="Cual es tu estado actual?"
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
          >{bcSending ? 'Enviando...' : 'Broadcast'}</button>
        </div>
        {bcItems.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {bcItems.map(item => (
              <div key={item.agent_id} style={{ border: `1px solid ${T.cardBorder}`, borderRadius: 7, background: T.bone, overflow: 'hidden' }}>
                <button
                  onClick={() => setBcExpanded(bcExpanded === item.agent_id ? null : item.agent_id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.navy, flex: 1 }}>{item.agent}</span>
                  <span style={{ fontSize: 10, color: item.ok ? T.teal : '#C05621', fontWeight: 600 }}>
                    {item.ok ? 'OK' : 'Error'}
                  </span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>{bcExpanded === item.agent_id ? '▲' : '▼'}</span>
                </button>
                {bcExpanded === item.agent_id && (
                  <div style={{ padding: '0 12px 10px', maxHeight: 300, overflowY: 'auto', color: T.carbon }}>
                    <MdContent content={item.response} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Panel 4: Crear proyecto con PM */}
      <Panel>
        <PanelTitle>Crear proyecto con PM</PanelTitle>
        <p style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, lineHeight: 1.5 }}>
          Describe el proyecto y el Project Manager lo estructurara y delegara a los agentes.
        </p>
        <textarea
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box', fontSize: 11, padding: '7px 10px',
            border: `1px solid ${T.cardBorder}`, borderRadius: 7,
            background: '#fff', color: T.navy, outline: 'none', resize: 'vertical',
            fontFamily: 'inherit', lineHeight: 1.5, marginBottom: 6,
          }}
          placeholder="App web para gestionar inventario de restaurante con modulo de reportes..."
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
        >{projSending ? 'Creando en Jira...' : 'Crear proyecto en Jira'}</button>
        {projJiraKey && (
          <p style={{ fontSize: 10, color: T.teal, marginTop: 6, fontWeight: 700 }}>
            Epic creado: <a
              href={`https://${process.env.NEXT_PUBLIC_JIRA_DOMAIN ?? 'devmark.atlassian.net'}/browse/${projJiraKey}`}
              target="_blank" rel="noreferrer"
              style={{ color: T.teal }}
            >{projJiraKey}</a>
          </p>
        )}
        {projResult && (
          <div style={{ marginTop: 10, fontSize: 11, color: T.navy, background: T.bone, border: `1px solid ${T.cardBorder}`, borderRadius: 7, padding: '8px 12px', maxHeight: 300, overflowY: 'auto' }}>
            <MdContent content={projResult} />
          </div>
        )}
      </Panel>
    </>
  )
}
