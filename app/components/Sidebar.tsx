'use client'
import { T, CAT_COLOR } from './tokens'

type TabId = 'agents' | 'projects' | 'telegram' | 'crm'

interface SidebarProps {
  tab:          TabId
  catFilter:    string | null
  sidebarOpen:  boolean
  onTabChange:  (t: TabId) => void
  onCatFilter:  (c: string | null) => void
  onClose:      () => void
}

export function Sidebar({ tab, catFilter, sidebarOpen, onTabChange, onCatFilter, onClose }: SidebarProps) {
  return (
    <aside
      className={`sidebar ${sidebarOpen ? 'open' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', gap: 2, background: T.navyDark, padding: '18px 0' }}
    >
      <div className="sidebar-toggle" style={{ justifyContent: 'flex-end', padding: '0 12px 8px' }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.sideText, fontSize: 18, cursor: 'pointer', opacity: 0.5 }}>✕</button>
      </div>

      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: T.sideText, opacity: 0.3, textTransform: 'uppercase', padding: '0 16px 6px' }}>Sistema</p>
      {([
        ['agents',   '⊞', 'Todos los agentes'],
        ['projects', '▤', 'Proyectos Jira'],
        ['telegram', '▷', 'Telegram control'],
        ['crm',      '◈', 'CRM Prospectos'],
      ] as const).map(([id, icon, label]) => (
        <div key={id} onClick={() => { onTabChange(id); onClose() }} style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '7px 16px', cursor: 'pointer',
          color: tab === id ? '#fff' : 'rgba(241,239,232,0.4)',
          background: tab === id ? 'rgba(24,95,165,0.22)' : 'transparent',
          borderLeft: tab === id ? `2px solid ${T.teal}` : '2px solid transparent',
          fontSize: 15, fontWeight: tab === id ? 600 : 400, transition: 'all 0.15s',
        }}>
          <span style={{ fontSize: 17, opacity: 0.8 }}>{icon}</span>
          {label}
        </div>
      ))}

      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: T.sideText, opacity: 0.3, textTransform: 'uppercase', padding: '14px 16px 6px' }}>Categorías</p>
      {([
        ['Gestión',    T.blue],
        ['Desarrollo', T.teal],
        ['Calidad',    '#BA7517'],
        ['Negocio',    '#C05621'],
      ] as [string, string][]).map(([cat, color]) => (
        <div key={cat} onClick={() => { onCatFilter(catFilter === cat ? null : cat); onTabChange('agents'); onClose() }} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '5px 16px', cursor: 'pointer',
          color: catFilter === cat ? '#fff' : 'rgba(241,239,232,0.38)', fontSize: 14, transition: 'all 0.12s',
        }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, opacity: catFilter && catFilter !== cat ? 0.4 : 1 }} />
          {cat}
        </div>
      ))}
      <div onClick={() => { onCatFilter(null); onClose() }} style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '5px 16px', cursor: 'pointer',
        color: 'rgba(241,239,232,0.28)', fontSize: 14,
      }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        Todos
      </div>
    </aside>
  )
}
