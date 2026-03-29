// ─── Design tokens devmark ────────────────────────────────────────────────────
export const T = {
  navy:       '#0C2D4E',
  blue:       '#185FA5',
  teal:       '#1D9E75',
  carbon:     '#444441',
  bone:       '#F1EFE8',
  white:      '#FFFFFF',
  navyDark:   '#091E33',
  cardBg:     '#FFFFFF',
  cardBorder: '#DDD9D0',
  cardHover:  '#F7F6F3',
  textMuted:  '#8A8A87',
  sideText:   '#F1EFE8',
  sideBorder: 'rgba(241,239,232,0.1)',
}

export const CAT_COLOR: Record<string, string> = {
  'Gestión':    T.blue,
  'Desarrollo': T.teal,
  'Calidad':    '#BA7517',
  'Negocio':   '#C05621',
}

export function statusDotColor(s: string) {
  return s === 'active' ? T.teal : s === 'busy' ? T.blue : '#C0BDB5'
}
export function statusLabel(s: string) {
  return s === 'active' ? 'Activo' : s === 'busy' ? 'Procesando...' : 'En espera'
}
export function jiraBadge(s: string) {
  const map: Record<string, { background: string; color: string; label: string }> = {
    'Done':        { background: 'rgba(29,158,117,0.12)',  color: T.teal,   label: 'Hecho' },
    'In Progress': { background: 'rgba(24,95,165,0.12)',   color: T.blue,   label: 'En curso' },
    'To Do':       { background: 'rgba(68,68,65,0.08)',    color: T.carbon, label: 'Por hacer' },
  }
  return map[s] || map['To Do']
}
export function priorityBadgeStyle(p: string) {
  return p === 'High'   ? { background: 'rgba(192,86,33,0.12)',  color: '#C05621' }
       : p === 'Medium' ? { background: 'rgba(186,117,23,0.12)', color: '#BA7517' }
                        : { background: 'rgba(29,158,117,0.12)', color: T.teal }
}
export function projectBadgeStyle(s: string) {
  return s === 'active'  ? { background: 'rgba(29,158,117,0.12)', color: T.teal }
       : s === 'paused'  ? { background: 'rgba(186,117,23,0.12)', color: '#BA7517' }
       : s === 'done'    ? { background: 'rgba(24,95,165,0.12)',  color: T.blue }
                         : { background: 'rgba(192,86,33,0.12)',  color: '#C05621' }
}
