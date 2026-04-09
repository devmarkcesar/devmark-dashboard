import pool from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

const CORE_API   = process.env.CORE_API_URL         ?? 'http://127.0.0.1:8000'
const API_SECRET = process.env.DASHBOARD_API_SECRET ?? ''

// POST — genera propuesta multi-agente para un diagnóstico existente.
// Proxy a POST /diagnostico/{id}/propuesta-multi en devmark-core.
// Selección de modo automática en core: budget='bajo' → rápido, resto → equipos.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  const check = await pool.query('SELECT id FROM diagnosticos WHERE id = $1', [numId])
  if (check.rows.length === 0) return NextResponse.json({ error: 'Diagnóstico no encontrado' }, { status: 404 })

  try {
    const coreRes = await fetch(`${CORE_API}/diagnostico/${numId}/propuesta-multi`, {
      method:  'POST',
      headers: { 'x-api-secret': API_SECRET },
      signal:  AbortSignal.timeout(95_000),
    })

    if (!coreRes.ok) {
      const err = await coreRes.json().catch(() => ({}))
      return NextResponse.json(
        { error: (err as { detail?: string }).detail ?? 'Error al generar propuesta multi-agente' },
        { status: coreRes.status }
      )
    }

    const data = await coreRes.json()
    return NextResponse.json({ ok: true, propuesta: data.propuesta, modo: data.modo })

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error de conexión'
    return NextResponse.json({ error: msg }, { status: 503 })
  }
}
