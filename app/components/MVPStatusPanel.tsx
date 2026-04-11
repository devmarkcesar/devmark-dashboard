'use client'
import { useState } from 'react'
import { T } from './tokens'

interface MVPStatus {
  mvp_status:       string | null   // 'pendiente' | 'generando' | 'listo' | 'error'
  mvp_staging_url:  string | null
  mvp_drive_url:    string | null
  drive_doc_url:    string | null
  drive_imagen_url: string | null
}

const STATUS_INFO: Record<string, { label: string; bg: string; color: string }> = {
  pendiente: { label: 'Pendiente',  bg: 'rgba(100,100,100,0.10)', color: '#666'    },
  generando: { label: 'Generando…', bg: 'rgba(246,201,14,0.15)', color: '#9A7C00' },
  listo:     { label: 'Listo ✓',   bg: 'rgba(29,158,117,0.12)', color: '#1D9E75'  },
  error:     { label: 'Error',      bg: 'rgba(192,86,33,0.10)',  color: '#C05621'  },
}

interface Props {
  diagnosticoId: number
  status: MVPStatus
  onRefresh: () => Promise<void> | void
}

export function MVPStatusPanel({ diagnosticoId, status, onRefresh }: Props) {
  const [mvpLoading,  setMvpLoading]  = useState(false)
  const [docLoading,  setDocLoading]  = useState(false)
  const [imgLoading,  setImgLoading]  = useState(false)
  const [localError,  setLocalError]  = useState<string | null>(null)
  const [deploySh,    setDeploySh]    = useState<string | null>(null)

  const mvpInfo = STATUS_INFO[status.mvp_status ?? 'pendiente'] ?? STATUS_INFO.pendiente

  async function handleGenerarMVP() {
    setMvpLoading(true)
    setLocalError(null)
    setDeploySh(null)
    try {
      const res  = await fetch(`/api/diagnostico/${diagnosticoId}/ejecutar-mvp`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setLocalError(data.detail ?? data.error ?? 'Error generando MVP'); return }
      if (data.deploy_sh) setDeploySh(data.deploy_sh)
      await onRefresh()
    } catch (e: unknown) {
      setLocalError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setMvpLoading(false)
    }
  }

  async function handleDocumentacion() {
    setDocLoading(true)
    setLocalError(null)
    try {
      const res  = await fetch(`/api/diagnostico/${diagnosticoId}/documentos?tipo=documentacion`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setLocalError(data.detail ?? data.error ?? 'Error generando documentación'); return }
      await onRefresh()
    } catch (e: unknown) {
      setLocalError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setDocLoading(false)
    }
  }

  async function handleImagen() {
    setImgLoading(true)
    setLocalError(null)
    try {
      const res  = await fetch(`/api/diagnostico/${diagnosticoId}/documentos?tipo=imagen`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setLocalError(data.detail ?? data.error ?? 'Error generando imagen'); return }
      await onRefresh()
    } catch (e: unknown) {
      setLocalError(e instanceof Error ? e.message : 'Error de red')
    } finally {
      setImgLoading(false)
    }
  }

  function downloadDeploySh() {
    if (!deploySh) return
    const blob = new Blob([deploySh], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `deploy-mvp-${diagnosticoId}.sh`
    a.click()
    URL.revokeObjectURL(url)
  }

  const panel: React.CSSProperties = {
    background: T.cardBg, border: `1.5px solid ${T.cardBorder}`,
    borderRadius: 12, padding: '20px 24px', display: 'flex',
    flexDirection: 'column', gap: 16,
  }

  const btnBase: React.CSSProperties = {
    padding: '8px 16px', fontSize: 13, fontWeight: 600,
    borderRadius: 8, cursor: 'pointer', border: 'none',
  }

  const btnPrimary: React.CSSProperties = {
    ...btnBase, background: T.navy, color: '#fff',
  }

  const btnSecondary: React.CSSProperties = {
    ...btnBase, background: 'transparent',
    border: `1.5px solid ${T.navy}`, color: T.navy,
  }

  const badge: React.CSSProperties = {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    fontSize: 12, fontWeight: 600,
    background: mvpInfo.bg, color: mvpInfo.color,
  }

  const linkStyle: React.CSSProperties = {
    fontSize: 13, color: T.navy, textDecoration: 'underline', wordBreak: 'break-all',
  }

  return (
    <div className="print-hide" style={panel}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.carbon }}>Estado MVP</span>
        <span style={badge}>{mvpInfo.label}</span>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <button
          style={btnPrimary}
          disabled={mvpLoading}
          onClick={handleGenerarMVP}
        >
          {mvpLoading ? '⏳ Generando MVP…' : '🚀 Generar MVP'}
        </button>
        <button
          style={btnSecondary}
          disabled={docLoading}
          onClick={handleDocumentacion}
        >
          {docLoading ? '⏳ Generando docs…' : '📄 Documentación'}
        </button>
        <button
          style={btnSecondary}
          disabled={imgLoading}
          onClick={handleImagen}
        >
          {imgLoading ? '⏳ Generando imagen…' : '🎨 Imagen de marca'}
        </button>
        {deploySh && (
          <button style={btnSecondary} onClick={downloadDeploySh}>
            ⬇️ Descargar deploy.sh
          </button>
        )}
      </div>

      {localError && (
        <span style={{ fontSize: 13, color: '#C05621' }}>⚠️ {localError}</span>
      )}

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {status.mvp_staging_url && (
          <div style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: T.navy, marginRight: 6 }}>Staging:</span>
            <a
              href={status.mvp_staging_url}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              {status.mvp_staging_url}
            </a>
          </div>
        )}
        {status.mvp_drive_url && (
          <div style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: T.navy, marginRight: 6 }}>Archivos MVP:</span>
            <a
              href={status.mvp_drive_url}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Ver en Drive
            </a>
          </div>
        )}
        {status.drive_doc_url && (
          <div style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: T.navy, marginRight: 6 }}>Documentación:</span>
            <a
              href={status.drive_doc_url}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Ver en Drive
            </a>
          </div>
        )}
        {status.drive_imagen_url && (
          <div style={{ fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: T.navy, marginRight: 6 }}>Imagen de marca:</span>
            <a
              href={status.drive_imagen_url}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Ver en Drive
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
