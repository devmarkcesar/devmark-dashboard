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

  // Sidebar hamburger (móvil)
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
      setError('Sin conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const iv = setInterval(fetchStats, 30_000)
    return () => clearInterval(iv)
  }, [])

  // Countdown en tiempo real
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
  const isRateLimited = countdown > 0

  const barColor = pct < 60 ? T.teal : pct < 85 ? '#E67E22' : '#E74C3C'

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: 'calc(100dvh - 58px)', background: T.navy }}>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

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

      <div style={{
        flex: 1, minWidth: 0,
        padding: '24px 32px',
        overflowY: 'auto',
        maxWidth: 680,
        margin: '0 auto',
        width: '100%',
        background: '#F1EFE8',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a2a3a' }}>Groq Monitor</h1>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280' }}>llama-3.3-70b-versatile</p>
          </div>
          <button
            onClick={fetchStats}
            style={{
              background: 'none', border: `1px solid rgba(0,0,0,0.15)`,
              borderRadius: 8, padding: '6px 14px',
              color: T.teal, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ↻ Actualizar
          </button>
        </div>

        {loading ? (
          <p style={{ color: '#6B7280', fontSize: 13 }}>Cargando...</p>
        ) : error ? (
          <>
            <div style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.25)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ margin: 0, color: '#C0392B', fontSize: 13, fontWeight: 600 }}>⚠️ {error} — reinicia devmark-core en el servidor</p>
            </div>
          </>
        ) : (
          <>
            {/* Status badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 18px',
              borderRadius: 12,
              background: isRateLimited ? 'rgba(231,76,60,0.08)' : 'rgba(29,158,117,0.08)',
              border: `1px solid ${isRateLimited ? 'rgba(231,76,60,0.25)' : 'rgba(29,158,117,0.25)'}`,
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 20 }}>{isRateLimited ? '🔴' : '🟢'}</span>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isRateLimited ? '#C0392B' : T.teal }}>
                  {isRateLimited ? 'Rate limited' : 'Disponible'}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#6B7280' }}>
                  {isRateLimited
                    ? `Resetea en ${fmtCountdown(countdown)}`
                    : 'La API de Groq está lista para recibir solicitudes'}
                </p>
              </div>
              {isRateLimited && (
                <div style={{
                  marginLeft: 'auto',
                  fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums',
                  color: '#E74C3C', letterSpacing: '0.02em',
                  fontFamily: 'monospace',
                }}>
                  {fmtCountdown(countdown)}
                </div>
              )}
            </div>

            {/* Tokens progress */}
            <div style={{
              background: '#fff', borderRadius: 12,
              padding: '20px 20px 18px',
              border: '1px solid rgba(0,0,0,0.08)',
              marginBottom: 20,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#1a2a3a' }}>Tokens/día consumidos</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: barColor }}>
                  {pct}%
                </p>
              </div>

              {/* Barra */}
              <div style={{
                width: '100%', height: 10, borderRadius: 6,
                background: 'rgba(0,0,0,0.08)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${pct}%`,
                  background: barColor,
                  borderRadius: 6,
                  transition: 'width 0.4s ease',
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <p style={{ margin: 0, fontSize: 11, color: '#6B7280' }}>
                  {used.toLocaleString('es-MX')} usados
                </p>
                <p style={{ margin: 0, fontSize: 11, color: '#6B7280' }}>
                  {limit.toLocaleString('es-MX')} límite
                </p>
              </div>

              <p style={{ margin: '10px 0 0', fontSize: 11, color: '#6B7280' }}>
                Disponibles: <span style={{ color: '#1a2a3a', fontWeight: 600 }}>
                  {(limit - used).toLocaleString('es-MX')}
                </span> tokens
              </p>
            </div>

            {/* Timestamps */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 12, marginBottom: 20,
            }}>
              {[
                { label: 'Último uso',          value: fmtTime(stats?.last_updated ?? null) },
                { label: 'Rate limited a las',  value: fmtTime(stats?.rate_limited_at ?? null) },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: '#fff', borderRadius: 10, padding: '14px 16px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}>
                  <p style={{ margin: '0 0 4px', fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a2a3a' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Reset timestamp */}
            {stats?.reset_at && (
              <div style={{
                background: '#fff', borderRadius: 10, padding: '14px 16px',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <p style={{ margin: '0 0 4px', fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reset a las</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1a2a3a' }}>{fmtTime(stats.reset_at)}</p>
              </div>
            )}
          </>
        )}

        {/* Footer igual al dashboard */}
        <footer style={{ borderTop: '1px solid rgba(0,0,0,0.07)', marginTop: 'auto', paddingTop: 28, padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <img
            src="/logos/horizontal/dev-hori-1.png?v=2"
            alt="devmark"
            style={{ height: 62, width: 'auto', objectFit: 'contain' }}
          />
          <p style={{ fontSize: 15, color: '#6B7280', margin: 0, fontWeight: 500 }}>© {new Date().getFullYear()} devmark</p>
        </footer>
      </div>
    </div>
  )
}
