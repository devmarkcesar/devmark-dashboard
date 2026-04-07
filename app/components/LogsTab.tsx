'use client'
import { useState } from 'react'
import { Panel } from './ui'
import { T } from './tokens'
import type { Log } from './types'

const LEVELS = ['Todos', 'info', 'warn', 'error'] as const

const CMD_GROUPS = [
  {
    title: '🤖 Dashboard — Agentes',
    color: T.blue,
    cmds: [
      { cmd: 'Chat individual',   desc: 'Selecciona un agente → escribe → responde en tiempo real' },
      { cmd: 'Broadcast',         desc: 'Envia un mensaje a todos los agentes activos a la vez' },
      { cmd: 'Crear proyecto',    desc: 'Describe el proyecto → el PM lo estructura y delega' },
    ],
  },
  {
    title: '⚡ Telegram — Sistema',
    color: T.teal,
    cmds: [
      { cmd: '/start · /ayuda',        desc: 'Bienvenida y menú de comandos completo' },
      { cmd: '/status',                desc: 'Estado de agentes y proyectos en tiempo real' },
      { cmd: '/agentes',               desc: 'Lista los 22 agentes con su número' },
    ],
  },
  {
    title: '📁 Telegram — Proyectos',
    color: T.teal,
    cmds: [
      { cmd: '/nuevo [nombre]',         desc: 'Crea proyecto en Jira + carpeta en Google Drive' },
      { cmd: '/proyecto [nombre]',      desc: 'Establece el proyecto activo como contexto global' },
      { cmd: '/tickets',                desc: 'Lista tickets Jira abiertos del proyecto activo' },
      { cmd: '/desglosar [KEY]',        desc: 'Crea sub-tasks a partir de una Story de Jira' },
      { cmd: '/ticket [descripción]',   desc: 'Crea un ticket rápido sin pasar por PM' },
      { cmd: '/cerrar [KEY]',           desc: 'Cierra un ticket en Jira' },
    ],
  },
  {
    title: '🧠 Telegram — Agentes directos',
    color: '#7C5CFF',
    cmds: [
      { cmd: '/pm [tarea]',             desc: 'Project Manager — planifica y delega' },
      { cmd: '/analista [req]',         desc: 'Analista — requisitos y especificaciones' },
      { cmd: '/estimacion [proy]',      desc: 'Estimación de horas y costo' },
      { cmd: '/backend [req]',          desc: 'Agente Backend — consultas de arquitectura / código' },
      { cmd: '/qa [módulo]',            desc: 'Agente QA — plan de pruebas' },
      { cmd: '/git [tarea]',            desc: 'Agente Git — flujo de ramas y merges' },
      { cmd: '/deploy [repo]',          desc: 'Agente Deploy — pasos de despliegue' },
      { cmd: '/agente [1-22] [tarea]',  desc: 'Cualquier agente por número' },
      { cmd: '/todos [mensaje]',        desc: 'Broadcast a los 22 agentes via Telegram' },
    ],
  },
  {
    title: '💬 Telegram — Chat y memoria',
    color: '#7C5CFF',
    cmds: [
      { cmd: '/chat [num]',             desc: 'Inicia chat directo con un agente (conversacional)' },
      { cmd: '/salir',                  desc: 'Termina el chat personal activo' },
      { cmd: '/historial [num]',        desc: 'Ver últimos mensajes con un agente' },
      { cmd: '/memoria [num]',          desc: 'Ver memoria persistente del agente' },
      { cmd: '/olvidar [num]',          desc: 'Borra la memoria de un agente' },
    ],
  },
  {
    title: '📊 Telegram — Reportes y Drive',
    color: '#BA7517',
    cmds: [
      { cmd: '/reporte',                desc: 'Reporte ejecutivo del sistema (Drive + Jira)' },
      { cmd: '/guardar [proy] | [tít]', desc: 'Guarda entregable en la carpeta Drive del proyecto' },
    ],
  },
]

export function LogsTab({ logs }: { logs: Log[] }) {
  const [levelFilter, setLevelFilter] = useState<string>('Todos')
  const [showCmds, setShowCmds] = useState(false)

  const visible = levelFilter === 'Todos' ? logs : logs.filter(l => l.level === levelFilter)

  return (
    <>
    {/* Panel de referencia de comandos */}
    <Panel>
      <div
        onClick={() => setShowCmds(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, flex: 1 }}>
          📋 Comandos disponibles
        </p>
        <span style={{ fontSize: 10, color: T.textMuted }}>Dashboard + Telegram &nbsp;{showCmds ? '▲' : '▼'}</span>
      </div>
      {showCmds && (
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {CMD_GROUPS.map(group => (
            <div key={group.title} style={{ border: `1px solid ${T.cardBorder}`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '6px 12px', background: `${group.color}12`, borderBottom: `1px solid ${T.cardBorder}` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: group.color }}>{group.title}</span>
              </div>
              <div style={{ padding: '6px 0' }}>
                {group.cmds.map(c => (
                  <div key={c.cmd} style={{ display: 'flex', gap: 8, padding: '5px 12px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: group.color, whiteSpace: 'nowrap', minWidth: 0 }}>{c.cmd}</span>
                    <span style={{ fontSize: 10, color: T.carbon, lineHeight: 1.4, opacity: 0.8 }}>{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>

    {/* Panel de logs */}
    <Panel>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap', paddingBottom: 10, borderBottom: `1px solid ${T.cardBorder}` }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.navy, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Telegram — Logs del sistema</p>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {LEVELS.map(lv => {
            const active = levelFilter === lv
            const color = lv === 'error' ? '#C05621' : lv === 'warn' ? '#BA7517' : lv === 'info' ? T.teal : T.textMuted
            return (
              <button
                key={lv}
                onClick={() => setLevelFilter(lv)}
                style={{
                  fontSize: 10, padding: '3px 10px', borderRadius: 99, border: 'none',
                  cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase',
                  background: active ? `${color}22` : 'transparent',
                  color: active ? color : T.textMuted,
                  outline: active ? `1px solid ${color}55` : 'none',
                }}
              >{lv}</button>
            )
          })}
        </div>
      </div>
      {visible.length === 0 ? (
        <p style={{ fontSize: 12, color: T.carbon, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>Sin logs para este nivel.</p>
      ) : visible.map(log => {
        const lc = log.level === 'error' ? '#C05621' : log.level === 'warn' ? '#BA7517' : T.teal
        return (
          <div key={log.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0',
            borderBottom: `1px solid ${T.cardBorder}`, flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 9, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', color: lc, minWidth: 36, marginTop: 1 }}>{log.level}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: T.navy, minWidth: 110 }}>{log.agent_name}</span>
            <span style={{ fontSize: 11, color: T.carbon, flex: 1, minWidth: 100 }}>{log.message}</span>
            <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: 'nowrap' }}>
              {new Date(log.timestamp).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )
      })}
    </Panel>    </>  )
}
