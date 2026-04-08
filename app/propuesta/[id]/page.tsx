import pool from '@/lib/db'
import { ProspuestaView, type Propuesta } from '@/app/components/ProspuestaView'
import { PrintButton } from '@/app/propuesta/PrintButton'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

const DIAS_EXPIRACION = 15

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function getDiagnostico(param: string) {
  if (!UUID_RE.test(param)) return null
  const res = await pool.query('SELECT * FROM diagnosticos WHERE public_token = $1', [param])
  if (res.rows.length === 0) return null
  const row = res.rows[0]
  return { ...row, propuesta: typeof row.propuesta === 'string' ? JSON.parse(row.propuesta) : row.propuesta }
}

export default async function PropuestaPublica({ params }: Props) {
  const { id } = await params

  const diag = await getDiagnostico(id)
  if (!diag || !diag.propuesta) notFound()

  // Verificar expiración: 15 días desde created_at
  const createdAt = new Date(diag.created_at)
  const ahora = new Date()
  const diasTranscurridos = (ahora.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

  if (diasTranscurridos > DIAS_EXPIRACION) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1EFE8', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', maxWidth: 480, textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/horizontal/dev-hori-1.png" alt="devmark" style={{ height: 48, objectFit: 'contain', marginBottom: 32 }} />
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0C2D4E', margin: '0 0 12px' }}>
            Este enlace ha expirado
          </h1>
          <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, margin: '0 0 24px' }}>
            Las propuestas de devmark tienen una vigencia de <strong>{DIAS_EXPIRACION} días naturales</strong>.
            Si necesitas acceso a esta propuesta, contacta a tu asesor de devmark.
          </p>
          <a
            href="https://devmark.mx"
            style={{ display: 'inline-block', background: '#0C2D4E', color: '#fff', borderRadius: 8, padding: '12px 24px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            Ir a devmark.mx
          </a>
        </div>
      </div>
    )
  }

  const p: Propuesta = diag.propuesta

  return (
    <div className="propuesta-publica-wrapper" style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 48px' }}>
      {/* Barra superior — oculta en impresión */}
      <div className="print-hide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/horizontal/dev-hori-1.png"
          alt="devmark"
          style={{ height: 70, objectFit: 'contain' }}
        />
        <PrintButton businessName={diag.business_name} />
      </div>

      <ProspuestaView p={p} businessName={diag.business_name} />

      <footer className="print-hide" style={{ borderTop: '1px solid rgba(0,0,0,0.08)', marginTop: 32, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/horizontal/dev-hori-1.png?v=2"
          alt="devmark"
          style={{ height: 62, width: 'auto', objectFit: 'contain' }}
        />
        <p style={{ fontSize: 15, color: '#444', margin: 0, fontWeight: 500 }}>© {new Date().getFullYear()} devmark</p>
        <p style={{ fontSize: 13, color: '#999', margin: 0 }}>+52 3319907259 · devmarkcesaranaya@gmail.com · Guadalajara, Jalisco, México · devmark.mx</p>
      </footer>
    </div>
  )
}

