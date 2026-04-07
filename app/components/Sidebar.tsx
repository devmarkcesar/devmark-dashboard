'use client'
import { T, CAT_COLOR } from './tokens'

type TabId = 'agents' | 'projects' | 'telegram' | 'crm'

interface SidebarProps {
  tab:                TabId
  catFilter:          string | null
  sidebarOpen:        boolean
  collapsed?:         boolean
  onTabChange:        (t: TabId) => void
  onCatFilter:        (c: string | null) => void
  onClose:            () => void
  onToggleCollapse?:  () => void
}

export function Sidebar({ tab, catFilter, sidebarOpen, collapsed, onTabChange, onCatFilter, onClose, onToggleCollapse }: SidebarProps) {
  return (
    <aside
      className={`sidebar ${sidebarOpen ? 'open' : ''} ${collapsed ? 'desktop-collapsed' : ''}`}
      style={{ display: 'flex', flexDirection: 'column', gap: 2, background: T.navyDark, padding: '10px 0' }}
    >
      {/* Hamburger — Desktop only (hidden on mobile via CSS) */}
      <div className="sidebar-desktop-toggle" style={{ padding: '4px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 6 }}>
        <button
          onClick={onToggleCollapse}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.sideText, fontSize: 14, fontWeight: 600,
            padding: '6px 4px', opacity: 0.65, transition: 'opacity 0.15s',
            width: '100%',
          }}
          title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>☰</span>
          <span className="nav-label">Menú</span>
        </button>
      </div>


      <p className="nav-section" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: T.sideText, opacity: 0.3, textTransform: 'uppercase', padding: '0 16px 6px' }}>Sistema</p>
      {([
        ['agents',   '⊞', 'Todos los agentes'],
        ['projects', '▤', 'Proyectos Jira'],
        ['telegram', '▷', 'Telegram control'],
        ['crm',      '◈', 'CRM'],
      ] as const).map(([id, icon, label]) => (
        <div key={id} onClick={() => { onTabChange(id); onClose() }}
          className="nav-item"
          style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '7px 16px', cursor: 'pointer',
            color: tab === id ? '#fff' : 'rgba(241,239,232,0.4)',
            background: tab === id ? 'rgba(24,95,165,0.22)' : 'transparent',
            borderLeft: tab === id ? `2px solid ${T.teal}` : '2px solid transparent',
            fontSize: 15, fontWeight: tab === id ? 600 : 400, transition: 'all 0.15s',
          }}>
          <span style={{ fontSize: 17, opacity: 0.8, flexShrink: 0 }}>{icon}</span>
          <span className="nav-label">{label}</span>
        </div>
      ))}

      <p className="nav-section" style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: T.sideText, opacity: 0.3, textTransform: 'uppercase', padding: '14px 16px 6px' }}>Categorías</p>
      {([
        ['Gestión',    T.blue],
        ['Desarrollo', T.teal],
        ['Calidad',    '#BA7517'],
        ['Negocio',    '#C05621'],
      ] as [string, string][]).map(([cat, color]) => (
        <div key={cat} onClick={() => { onCatFilter(catFilter === cat ? null : cat); onTabChange('agents'); onClose() }}
          className="nav-dot-item"
          style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '5px 16px', cursor: 'pointer',
            color: catFilter === cat ? '#fff' : 'rgba(241,239,232,0.38)', fontSize: 14, transition: 'all 0.12s',
          }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, opacity: catFilter && catFilter !== cat ? 0.4 : 1 }} />
          <span className="nav-label">{cat}</span>
        </div>
      ))}
      <div onClick={() => { onCatFilter(null); onClose() }}
        className="nav-dot-item"
        style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '5px 16px', cursor: 'pointer',
          color: 'rgba(241,239,232,0.28)', fontSize: 14,
        }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        <span className="nav-label">Todos</span>
      </div>
    </aside>
  )
}

