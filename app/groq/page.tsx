'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { T } from '../components/tokens'
import { Sidebar } from '../components/Sidebar'

type TabId = 'agents' | 'projects' | 'logs' | 'crm' | 'diagnostico' | 'groq'

interface GroqStats {
  tokens_used_today:  number
  tokens_limit_day:   number
  reset_at:           string | null
  rate_limited_at:    string | null
  last_updated:       string | null
}

function fmtTime(isoStr: string | null): string {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return '00:00'
  const totalSec = Math.ceil(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function GroqPage() {
  const router = useRouter()

  const [stats,      setStats]      = useState<GroqStats | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [countdown,  setCountdown]  = useState(0)
  const [sidebarOpen,      setSidebarOpen]      = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const handler = () => setSidebarOpen(prev => !prev)
    window.addEventListener('devmark:toggle-sidebar', handler)
    return () => window.removeEventListener('devmark:toggle-sidebar', handler)
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch('/api/groq', { cache: 'no-store' })
      if (!res.ok) { setError('Error al obtener datos'); return }
      const data = await res.json()
      setStats(data)
      setError(null)
    } catch {
      setError('Sin conexion')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const iv = setInterval(fetchStats, 30_000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (!stats?.reset_at) { setCountdown(0); return }
    const update = () => {
      const remaining = new Date(stats.reset_at!).getTime() - Date.now()
      setCountdown(remaining > 0 ? remaining : 0)
    }
    update()
    timerRef.current = setInterval(update, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [stats?.reset_at])

  function handleTabChange(t: TabId) {
    if (t === 'groq') return
    localStorage.setItem('devmark-tab', t)
    router.push('/')
  }

  const used  = stats?.tokens_used_today ?? 0
  const limit = stats?.tokens_limit_day  ?? 100000
  const pct   = Math.min(100, Math.round((used / limit) * 100))
  const available = limit - used
  const isRateLimited = countdown > 0
  const barColor = pct < 60 ? T.teal : pct < 85 ? '#BA7517' : '#C05621'
  const accentStatus = isRateLimited ? '#C05621' : T.teal

  return (
    <div className="dashboard-layout">

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        tab="groq"
        catFilter={null}
        sidebarOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onTabChange={handleTabChange}
        onCatFilter={() => {}}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => { setSidebarCollapsed(prev => !prev); setSidebarOpen(false) }}
      />

      <div className="main-content">

        {error && (
          <div style={{
            background: 'rgba(192,86,33,0.10)', border: '1px solid rgba(192,86,33,0.28)',
            borderRadius: 9, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 15 }}>warning {error} — reinicia devmark-core en el servidor</span>
            <button onClick={fetchStats} style={{ marginLeft: 'auto', fontSize: 11, color: T.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Reintentar</button>
          </div>
        )}

        <div className="stats-grid-4">
          <div style={{ background: T.white, border: `1px solid ${T.cardBorder}`, borderTop: `3px solid ${accentStatus}`, borderRadius: 10, padding: '16px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Estado API</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: accentStatus, lineHeight: 1 }}>
              {loading ? '—' : isRateLimited ? 'Rate limited' : 'Disponible'}
            </p>
            <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>llama-3.3-70b-versatile</p>
          </div>

          <div style={{ background: T.white, border: `1px solid ${T.cardBorder}`, borderTop: `3px solid ${T.blue}`, borderRadius: 10, padding: '16px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tokens usados hoy</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: T.navy, lineHeight: 1 }}>{loading ? '—' : used.toLocaleString('es-MX')}</p>
            <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>de {limit.toLocaleString('es-MX')} limite diario</p>
          </div>

          <div style={{ background: T.white, border: `1px solid ${T.cardBorder}`, borderTop: `3px solid ${T.teal}`, borderRadius: 10, padding: '16px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Tokens disponibles</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: T.navy, lineHeight: 1 }}>{loading ? '—' : available.toLocaleString('es-MX')}</p>
            <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>{loading ? '' : `${pct}% consumido`}</p>
          </div>

          <div style={{ background: T.white, border: `1px solid ${T.cardBorder}`, borderTop: `3px solid ${isRateLimited ? '#C05621' : T.teal}`, borderRadius: 10, padding: '16px 18px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Reset en</p>
            {loading ? (
              <p style={{ fontSize: 28, fontWeight: 700, color: T.navy, lineHeight: 1 }}>—</p>
            ) : isRateLimited ? (
              <p style={{ fontSize: 22, fontWeight: 700, color: '#C05621', lineHeight: 1, fontFamily: 'monospace' }}>{fmtCountdown(countdown)}</p>
            ) : (
              <p style={{ fontSize: 28, fontWeight: 700, color: T.teal, lineHeight: 1 }}>OK</p>
            )}
            <p style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>{isRateLimited ? 'Tiempo hasta reset' : 'Sin limite activo'}</p>
          </div>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, margin: '4px 0 -4px' }}>
          GROQ MONITOR — DEVMARK
        </p>

        <div style={{ background: T.white, border: `1px solid ${T.cardBorder}`, borderRadius: 10, padding: '20px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uso de tokens diarios</p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: barColor }}>{pct}%</p>
          </div>
          <div style={{ width: '100%', height: 10, borderRadius: 6, background: T.cardBorder, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 6, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <p style={{ margin: 0, fontSize: 10, color: T.textMuted }}>{used.toLocaleString('es-MX')} usados</p>
            <p style={{ margin: 0, fontSize: 10, color: T.textMuted }}>{limit.toLocaleString('es-MX')} limite</p>
          </div>
        </div>

        <div className="detail-grid">
          {[
            { label: 'Ultimo uso',         value: fmtTime(stats?.last_updated    ?? null), accent: T.blue    },
            { label: 'Rate limited a las', value: fmtTime(stats?.rate_limited_at ?? null), accent: '#C05621' },
            { label: 'Reset a las',        value: fmtTime(stats?.reset_at        ?? null), accent: T.teal    },
            { label: 'Requests',           value: isRateLimited ? 'Bloqueado' : 'Activo',  accent: accentStatus },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{
              background: T.white, border: `1px solid ${T.cardBorder}`,
              borderLeft: `3px solid ${accent}`,
              borderRadius: 10, padding: '16px 18px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, color: T.carbon, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.navy }}>{value}</p>
            </div>
          ))}
        </div>

        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 16, padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <img src="/logos/horizontal/dev-hori-1.png?v=2" alt="devmark" style={{ height: 62, width: 'auto', objectFit: 'contain' }} />
          <p style={{ fontSize: 15, color: T.textMuted, margin: 0, fontWeight: 500 }}>© {new Date().getFullYear()} devmark</p>
        </footer>

      </div>
    </div>
  )
}