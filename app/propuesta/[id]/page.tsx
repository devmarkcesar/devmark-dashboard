import pool from '@/lib/db'
import { ProspuestaView, type Propuesta } from '@/app/components/ProspuestaView'
import { PrintButton } from '@/app/propuesta/PrintButton'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

async function getDiagnostico(id: number) {
  const res = await pool.query('SELECT * FROM diagnosticos WHERE id = $1', [id])
  if (res.rows.length === 0) return null
  const row = res.rows[0]
  return {
    ...row,
    propuesta: typeof row.propuesta === 'string' ? JSON.parse(row.propuesta) : row.propuesta,
  }
}

export default async function PropuestaPublica({ params }: Props) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) notFound()

  const diag = await getDiagnostico(numId)
  if (!diag || !diag.propuesta) notFound()

  const p: Propuesta = diag.propuesta

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 16px 48px' }}>
      {/* Barra superior */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/horizontal/dev-hori-1.png"
          alt="devmark"
          style={{ height: 32, objectFit: 'contain' }}
        />
        <PrintButton />
      </div>

      <ProspuestaView p={p} businessName={diag.business_name} />

      <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: '#999' }}>
        Propuesta generada por devmark · devmark.mx · Guadalajara, Jalisco
      </p>
    </div>
  )
}

